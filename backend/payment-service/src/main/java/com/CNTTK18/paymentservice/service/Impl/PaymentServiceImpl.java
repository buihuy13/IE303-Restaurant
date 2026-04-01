package com.CNTTK18.paymentservice.service.Impl;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import com.CNTTK18.Common.Event.PaymentStatusSyncContract;
import com.CNTTK18.Common.Event.PaymentStatusSyncEvent;
import com.CNTTK18.paymentservice.config.properties.PayOSProperties;
import com.CNTTK18.paymentservice.dto.PaymentRequestDTO;
import com.CNTTK18.paymentservice.dto.PaymentResponseDTO;
import com.CNTTK18.paymentservice.exception.PaymentCreationException;
import com.CNTTK18.paymentservice.model.PaymentTransaction;
import com.CNTTK18.paymentservice.model.data.PaymentStatus;
import com.CNTTK18.paymentservice.repository.PaymentTransactionRepository;
import com.CNTTK18.paymentservice.service.PaymentService;
import com.CNTTK18.paymentservice.utils.WebhookUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private static final int PAYMENT_EVENT_MAX_RETRIES = 3;

    private final PayOS payOS;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WebhookUtils webhookUtils;
    private final PayOSProperties payOSProperties;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public PaymentResponseDTO createPaymentLink(PaymentRequestDTO request) {
        // 1. Khởi tạo Order Code duy nhất (Random System limit của Java Long)
        Long orderCode = System.currentTimeMillis() % 1000000000L;

        // 2. Lưu tạm giao dịch xuống DB với trạng thái PENDING
        PaymentTransaction transaction = PaymentTransaction.builder()
                .userId(request.getUserId())
                .orderId(request.getOrderId())
                .amount(request.getAmount().longValue())
                .orderCode(orderCode)
                .status(PaymentStatus.PENDING)
                .build();
        paymentTransactionRepository.save(transaction);

        try {
            // 3. Khởi tạo PaymentData theo chuẩn PayOS SDK và gọi API tạo Link
            String description = request.getDescription() != null ? request.getDescription() : "Thanh toan don hang";
            String returnUrl = request.getReturnUrl() != null ? request.getReturnUrl() : "http://localhost:3000";
            String cancelUrl = request.getCancelUrl() != null ? request.getCancelUrl() : "http://localhost:3000";

            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(request.getAmount().longValue())
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            // Lưu paymentLinkId để dùng khi webhook callback đồng bộ sang order-service
            transaction.setPaymentLinkId(data.getPaymentLinkId());
            paymentTransactionRepository.save(transaction);

            return PaymentResponseDTO.builder()
                    .checkoutUrl(data.getCheckoutUrl())
                    .orderCode(orderCode)
                    .paymentLinkId(data.getPaymentLinkId())
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi tạo payment link với PayOS", e);
            throw new PaymentCreationException("Không thể tạo link thanh toán PayOS", e);
        }
    }

    @Override
    @Transactional
    public boolean processWebhook(Map<String, Object> webhookBody, String inputSignature) {
        // 1. Dùng Utils để tính toán Signature
        boolean isValid = webhookUtils.isValidData(webhookBody, inputSignature, payOSProperties.getChecksumKey());

        if (!isValid) {
            log.warn("Lỗi Xác Thực Webhook: Chữ ký không khớp!");
            return false;
        }

        Map<?, ?> dataMap = extractWebhookData(webhookBody);
        if (dataMap == null) {
            log.warn("Webhook thiếu object data, bỏ qua xử lý");
            return false;
        }

        // 2. Lấy thông tin orderCode từ payload webhook, ép kiểu theo chuẩn
        Long orderCode = parseLong(dataMap.get("orderCode"));
        if (orderCode == null) {
            log.warn("Webhook thiếu orderCode hoặc sai định dạng: {}", dataMap.get("orderCode"));
            return false;
        }

        // 3. Tìm giao dịch trong Database và cập nhật trạng thái theo payload webhook
        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByOrderCode(orderCode);
        if (transactionOpt.isEmpty()) {
            log.warn("Không tìm thấy giao dịch với orderCode={} để xử lý webhook", orderCode);
            return false;
        }

        PaymentTransaction transaction = transactionOpt.get();
        if (transaction.getOrderId() == null) {
            log.error("Giao dịch orderCode={} thiếu orderId, không thể đồng bộ sang order-service", orderCode);
            return false;
        }

        Boolean paymentSuccess = resolvePaymentSuccess(webhookBody, dataMap);
        if (paymentSuccess == null) {
            log.warn("Webhook không xác định rõ trạng thái thanh toán cho orderCode={}, bỏ qua cập nhật", orderCode);
            return false;
        }
        PaymentStatus nextStatus = paymentSuccess ? PaymentStatus.PAID : PaymentStatus.CANCELLED;

        String webhookPaymentLinkId = asString(dataMap.get("paymentLinkId"));
        if (webhookPaymentLinkId != null && !webhookPaymentLinkId.isBlank()) {
            transaction.setPaymentLinkId(webhookPaymentLinkId);
        }

        transaction.setStatus(nextStatus);
        paymentTransactionRepository.save(transaction);

        // 4. Phát event đồng bộ trạng thái sang order-service qua RabbitMQ.
        boolean published = publishPaymentStatusSyncEvent(transaction, paymentSuccess, orderCode);
        if (!published) {
            log.error("Không thể phát payment status event cho orderCode={}", orderCode);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return false;
        }

        log.info("Đã xử lý webhook cho orderCode={}, paymentStatus={}", orderCode, nextStatus);
        return true;
    }

    @SuppressWarnings("unchecked")
    private Map<?, ?> extractWebhookData(Map<String, Object> webhookBody) {
        Object dataObj = webhookBody.get("data");
        if (dataObj instanceof Map<?, ?>) {
            return (Map<?, ?>) dataObj;
        }
        return null;
    }

    private Boolean resolvePaymentSuccess(Map<String, Object> webhookBody, Map<?, ?> dataMap) {
        Object successObj = webhookBody.get("success");
        if (successObj instanceof Boolean) {
            return (Boolean) successObj;
        }

        String rootCode = asString(webhookBody.get("code"));
        if ("00".equals(rootCode) || "0".equals(rootCode)) {
            return true;
        }

        String dataCode = asString(dataMap.get("code"));
        if ("00".equals(dataCode) || "0".equals(dataCode)) {
            return true;
        }

        String status = asString(dataMap.get("status"));
        if (status != null) {
            String normalized = status.trim().toUpperCase(Locale.ROOT);
            if (normalized.contains("PAID") || normalized.contains("SUCCESS")) {
                return true;
            }
            if (normalized.contains("CANCEL") || normalized.contains("FAIL") || normalized.contains("EXPIRED")) {
                return false;
            }
        }

        String desc = asString(webhookBody.get("desc"));
        if (desc != null) {
            String normalized = desc.trim().toUpperCase(Locale.ROOT);
            if (normalized.contains("SUCCESS")) {
                return true;
            }
            if (normalized.contains("CANCEL") || normalized.contains("FAIL")) {
                return false;
            }
        }

        return null;
    }

    private boolean publishPaymentStatusSyncEvent(PaymentTransaction transaction, boolean success, Long orderCode) {
        String paymentLinkId = transaction.getPaymentLinkId() != null ? transaction.getPaymentLinkId() : "";
        PaymentStatusSyncEvent event =
                new PaymentStatusSyncEvent(transaction.getOrderId(), success, orderCode, paymentLinkId);

        for (int attempt = 1; attempt <= PAYMENT_EVENT_MAX_RETRIES; attempt++) {
            try {
                rabbitTemplate.convertAndSend(
                        PaymentStatusSyncContract.EXCHANGE, PaymentStatusSyncContract.ROUTING_KEY, event);
                log.info(
                        "Đã phát payment status event cho orderId={}, success={}",
                        transaction.getOrderId(),
                        success);
                return true;
            } catch (Exception ex) {
                log.warn(
                        "Lần {} phát payment status event thất bại (orderId={}, orderCode={})",
                        attempt,
                        transaction.getOrderId(),
                        orderCode,
                        ex);
                if (attempt < PAYMENT_EVENT_MAX_RETRIES) {
                    try {
                        TimeUnit.MILLISECONDS.sleep(300L * attempt);
                    } catch (InterruptedException interruptedException) {
                        Thread.currentThread().interrupt();
                        return false;
                    }
                }
            }
        }
        return false;
    }

    private Long parseLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
