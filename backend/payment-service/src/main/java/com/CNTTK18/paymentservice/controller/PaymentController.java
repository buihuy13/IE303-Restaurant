package com.CNTTK18.paymentservice.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.CNTTK18.paymentservice.dto.PaymentRequestDTO;
import com.CNTTK18.paymentservice.dto.PaymentResponseDTO;
import com.CNTTK18.paymentservice.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDTO> createPaymentLink(@RequestBody PaymentRequestDTO request) {
        log.info(
                "Nhận yêu cầu tạo payment link cho user: {} với số tiền: {}", request.getUserId(), request.getAmount());
        PaymentResponseDTO responseDTO = paymentService.createPaymentLink(request);
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody Map<String, Object> webhookBody,
            @RequestHeader(value = "signature", required = false) String headerSignature) {
        log.info("Nhận webhook từ PayOS");

        // Chữ ký có thể nằm ở header "signature" hoặc ở trong root data body tùy vào version/config của PayOS
        String signature = headerSignature != null ? headerSignature : (String) webhookBody.get("signature");

        try {
            boolean isProcessed = paymentService.processWebhook(webhookBody, signature);
            if (!isProcessed) {
                log.warn(
                        "Webhook nhận được nhưng xử lý thất bại (Có thể do sai chữ ký hoặc chỉ là request Test từ PayOS)");
            }
        } catch (Exception e) {
            log.error("Lỗi crash khi xử lý Webhook: ", e);
        }

        // ĐIỀU KIỆN TIÊN QUYẾT TỪ PAYOS: LUÔN TRẢ VỀ 200 OK "success" để xác nhận đã nhận, tránh bị dội lại 400 và
        // block webhook
        return ResponseEntity.ok("success");
    }
}
