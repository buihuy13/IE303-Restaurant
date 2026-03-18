package com.CNTTK18.paymentservice.service.Impl;

import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.CNTTK18.paymentservice.config.properties.PayOSProperties;
import com.CNTTK18.paymentservice.dto.PaymentRequestDTO;
import com.CNTTK18.paymentservice.dto.PaymentResponseDTO;
import com.CNTTK18.paymentservice.model.PaymentTransaction;
import com.CNTTK18.paymentservice.model.data.PaymentStatus;
import com.CNTTK18.paymentservice.repository.PaymentTransactionRepository;
import com.CNTTK18.paymentservice.service.PaymentService;
import com.CNTTK18.paymentservice.utils.WebhookUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PayOS payOS;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WebhookUtils webhookUtils;
    private final PayOSProperties payOSProperties;

    @Override
    public PaymentResponseDTO createPaymentLink(PaymentRequestDTO request) {
        // 1. Khởi tạo Order Code duy nhất (Random System limit của Java Long)
        Long orderCode = System.currentTimeMillis() % 1000000000L;

        // 2. Lưu tạm giao dịch xuống DB với trạng thái PENDING
        PaymentTransaction transaction = PaymentTransaction.builder()
                .userId(request.getUserId())
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

            vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest paymentData = vn.payos
                    .model
                    .v2
                    .paymentRequests
                    .CreatePaymentLinkRequest
                    .builder()
                    .orderCode(orderCode)
                    .amount(request.getAmount().longValue())
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse data =
                    payOS.paymentRequests().create(paymentData);

            return PaymentResponseDTO.builder()
                    .checkoutUrl(data.getCheckoutUrl())
                    .orderCode(orderCode)
                    .paymentLinkId(data.getPaymentLinkId())
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi tạo payment link với PayOS", e);
            throw new RuntimeException("Không thể tạo link thanh toán PayOS", e);
        }
    }

    @Override
    public boolean processWebhook(Map<String, Object> webhookBody, String inputSignature) {
        // 1. Dùng Utils để tính toán Signature
        boolean isValid = webhookUtils.isValidData(webhookBody, inputSignature, payOSProperties.getChecksumKey());

        if (!isValid) {
            log.warn("Lỗi Xác Thực Webhook: Chữ ký không khớp!");
            return false;
        }

        // 2. Lấy thông tin orderCode từ payload webhook, ép kiểu theo chuẩn
        Object dataObj = webhookBody.get("data");
        if (dataObj instanceof Map) {
            Map<?, ?> dataMap = (Map<?, ?>) dataObj;
            Long orderCode = Long.valueOf(dataMap.get("orderCode").toString());

            // 3. Tìm giao dịch trong Database và cập nhật trạng thái PAID
            Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByOrderCode(orderCode);
            if (transactionOpt.isPresent()) {
                PaymentTransaction transaction = transactionOpt.get();
                transaction.setStatus(PaymentStatus.PAID);
                paymentTransactionRepository.save(transaction);
                log.info("Giao dịch {} thanh toán thành công!", orderCode);
                return true;
            }
        }

        return false;
    }
}
