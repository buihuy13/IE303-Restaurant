package com.CNTTK18.paymentservice.service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.CNTTK18.paymentservice.model.PaymentTransaction;
import com.CNTTK18.paymentservice.repository.PaymentTransactionRepository;
import com.CNTTK18.paymentservice.utils.WebhookUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PayOS payOS;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WebhookUtils webhookUtils;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    /**
     * Luồng 1: Nhận yêu cầu tạo thanh toán từ Frontend -> Lưu Db -> Call PayOS -> Trả về Link
     */
    public String createPaymentLink(UUID userId, Integer amount) {
        // 1. Khởi tạo Order Code duy nhất (Random System limit của Java Long)
        Long orderCode = System.currentTimeMillis() % 1000000000L;

        // 2. Lưu tạm giao dịch xuống DB với trạng thái PENDING
        PaymentTransaction transaction = PaymentTransaction.builder()
                .userId(userId)
                .amount(amount)
                .orderCode(orderCode)
                .status("PENDING")
                .build();
        paymentTransactionRepository.save(transaction);

        // 3. TODO: Khởi tạo PaymentData theo chuẩn PayOS SDK và gọi API tạo Link
        // (Sẽ logic chi tiết sau bằng SDK PayOS)

        return "https://pay.payos.vn/dummy-link-for-now";
    }

    /**
     * Luồng 2: Xử lý Webhook (thông báo) được bắn về từ PayOS sau khi KH quét mã thành công
     */
    public boolean processWebhook(Map<String, Object> webhookBody, String inputSignature) {
        // 1. Dùng Utils do team bạn viết ở PR trước để tính toán Signature
        boolean isValid = webhookUtils.isValidData(webhookBody, inputSignature, checksumKey);

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
                transaction.setStatus("PAID");
                paymentTransactionRepository.save(transaction);
                log.info("Giao dịch {} thanh toán thành công!", orderCode);
                return true;
            }
        }

        return false;
    }
}
