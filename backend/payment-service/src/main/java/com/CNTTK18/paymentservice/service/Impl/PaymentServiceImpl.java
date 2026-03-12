package com.CNTTK18.paymentservice.service.Impl;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.CNTTK18.paymentservice.config.properties.PayOSProperties;
import com.CNTTK18.paymentservice.model.PaymentTransaction;
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
    public String createPaymentLink(UUID userId, Long amount) {
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

    @Override
    public boolean processWebhook(Map<String, Object> webhookBody, String inputSignature) {
        // 1. Dùng Utils để tính toán Signature
        boolean isValid =
                webhookUtils.isValidData(
                        webhookBody, inputSignature, payOSProperties.getChecksumKey());

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
