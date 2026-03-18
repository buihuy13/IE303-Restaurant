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

        boolean isProcessed = paymentService.processWebhook(webhookBody, signature);

        if (isProcessed) {
            // PayOS yêu cầu trả về HTTP Status Code 200 kèm chuỗi "success" hoặc JSON chứa code 00 để xác nhận đã nhận
            return ResponseEntity.ok("success");
        } else {
            return ResponseEntity.badRequest().body("failed");
        }
    }
}
