package com.CNTTK18.paymentservice.service.Impl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import com.CNTTK18.Common.Event.PaymentStatusSyncContract;
import com.CNTTK18.Common.Event.PaymentStatusSyncEvent;
import com.CNTTK18.paymentservice.dto.PaymentRequestDTO;
import com.CNTTK18.paymentservice.dto.PaymentResponseDTO;
import com.CNTTK18.paymentservice.exception.PaymentCreationException;
import com.CNTTK18.paymentservice.model.PaymentTransaction;
import com.CNTTK18.paymentservice.model.data.PaymentStatus;
import com.CNTTK18.paymentservice.repository.PaymentTransactionRepository;
import com.CNTTK18.paymentservice.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private static final String DEFAULT_WEBHOOK_PATH = "/payment/payos-webhook";
    private static final int PAYMENT_EVENT_MAX_RETRIES = 3;

    private final PayOS payOS;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    @Value("${gateway.url}")
    private String gatewayUrl;

    @Value("${payos.webhook-url:}")
    private String configuredWebhookUrl;

    private static final String NGROK_INSPECTOR_URL = "http://ngrok:4040/api/tunnels";

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
        paymentTransactionRepository.save(Objects.requireNonNull(transaction));

        try {
            ensureWebhookConfirmed();

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
        WebhookData webhookData = verifyWebhook(webhookBody, inputSignature);
        if (webhookData == null) {
            return false;
        }

        // 2. Lấy thông tin orderCode từ payload webhook đã được PayOS SDK xác thực.
        Long orderCode = webhookData.getOrderCode();
        if (orderCode == null) {
            log.warn("Webhook thiếu orderCode, bỏ qua xử lý");
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

        Boolean paymentSuccess = resolvePaymentSuccess(webhookBody, webhookData);
        if (paymentSuccess == null) {
            log.warn("Webhook không xác định rõ trạng thái thanh toán cho orderCode={}, bỏ qua cập nhật", orderCode);
            return false;
        }
        PaymentStatus nextStatus = paymentSuccess ? PaymentStatus.PAID : PaymentStatus.CANCELLED;

        String webhookPaymentLinkId = webhookData.getPaymentLinkId();
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

    private void ensureWebhookConfirmed() {
        String webhookUrl = resolveWebhookUrl();
        try {
            payOS.webhooks().confirm(webhookUrl);
            log.info("Đã confirm webhook PayOS: {}", webhookUrl);
        } catch (Exception ex) {
            // Không chặn tạo link thanh toán chỉ vì webhook chưa confirm được.
            // Payment link vẫn cần tạo được để người dùng thanh toán; webhook có thể
            // được cấu hình lại sau bằng PAYOS_WEBHOOK_URL public.
            log.warn("Không thể confirm webhook PayOS: {}. Link vẫn sẽ được tạo.", webhookUrl, ex);
        }
    }

    private String resolveWebhookUrl() {
        String configured = configuredWebhookUrl != null ? configuredWebhookUrl.trim() : "";
        if (!configured.isBlank() && !isLocalWebhookUrl(configured)) {
            return configured;
        }

        String ngrokWebhookUrl = resolveNgrokWebhookUrl();
        if (!ngrokWebhookUrl.isBlank()) {
            return ngrokWebhookUrl;
        }

        String baseUrl = gatewayUrl != null ? gatewayUrl.trim() : "";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + DEFAULT_WEBHOOK_PATH;
    }

    private String resolveNgrokWebhookUrl() {
        try {
            String inspectorResponse = readHttpResponse(NGROK_INSPECTOR_URL);
            JsonNode rootNode = objectMapper.readTree(inspectorResponse);
            JsonNode tunnelsNode = rootNode.path("tunnels");
            if (!tunnelsNode.isArray()) {
                return "";
            }

            String fallbackPublicUrl = "";
            for (JsonNode tunnelNode : tunnelsNode) {
                String publicUrl = asString(tunnelNode.get("public_url"));
                if (publicUrl == null || publicUrl.isBlank()) {
                    continue;
                }

                String proto = asString(tunnelNode.get("proto"));
                if ("https".equalsIgnoreCase(proto)) {
                    return appendWebhookPath(publicUrl);
                }

                if (fallbackPublicUrl.isBlank()) {
                    fallbackPublicUrl = publicUrl;
                }
            }

            return fallbackPublicUrl.isBlank() ? "" : appendWebhookPath(fallbackPublicUrl);
        } catch (Exception ex) {
            log.debug("Không lấy được public URL từ ngrok inspector: {}", ex.getMessage());
            return "";
        }
    }

    private String appendWebhookPath(String publicUrl) {
        String normalized = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
        return normalized + DEFAULT_WEBHOOK_PATH;
    }

    private boolean isLocalWebhookUrl(String webhookUrl) {
        String normalized = webhookUrl.toLowerCase(Locale.ROOT);
        return normalized.contains("localhost")
                || normalized.contains("127.0.0.1")
                || normalized.contains("host.docker.internal");
    }

    private String readHttpResponse(String requestUrl) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) URI.create(requestUrl).toURL().openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(2000);
        connection.setReadTimeout(2000);

        int responseCode = connection.getResponseCode();
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        responseCode >= 400 ? connection.getErrorStream() : connection.getInputStream()));
        try (reader) {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
            return body.toString();
        }
    }

    private WebhookData verifyWebhook(Map<String, Object> webhookBody, String inputSignature) {
        if (webhookBody == null) {
            log.warn("Webhook body rỗng, bỏ qua xử lý");
            return null;
        }

        Map<String, Object> normalizedBody = webhookBody;
        if (asString(webhookBody.get("signature")) == null && inputSignature != null && !inputSignature.isBlank()) {
            normalizedBody = new LinkedHashMap<>(webhookBody);
            normalizedBody.put("signature", inputSignature);
        }

        try {
            return payOS.webhooks().verify(normalizedBody);
        } catch (Exception ex) {
            log.warn("Lỗi xác thực webhook PayOS: {}", ex.getMessage());
            return null;
        }
    }

    private Boolean resolvePaymentSuccess(Map<String, Object> webhookBody, WebhookData webhookData) {
        Object successObj = webhookBody.get("success");
        if (successObj instanceof Boolean) {
            return (Boolean) successObj;
        }

        String rootCode = asString(webhookBody.get("code"));
        if ("00".equals(rootCode) || "0".equals(rootCode)) {
            return true;
        }

        String dataCode = webhookData.getCode();
        if ("00".equals(dataCode) || "0".equals(dataCode)) {
            return true;
        }

        String desc = webhookData.getDesc() != null ? webhookData.getDesc() : asString(webhookBody.get("desc"));
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
                log.info("Đã phát payment status event cho orderId={}, success={}", transaction.getOrderId(), success);
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

    private String asString(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof JsonNode jsonNode) {
            return jsonNode.isNull() ? null : jsonNode.asText();
        }

        return value.toString();
    }
}
