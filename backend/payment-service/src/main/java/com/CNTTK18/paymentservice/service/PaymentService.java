package com.CNTTK18.paymentservice.service;

import java.util.Map;
import java.util.UUID;

public interface PaymentService {

    /**
     * Luồng 1: Nhận yêu cầu tạo thanh toán từ Frontend -> Lưu Db -> Call PayOS -> Trả về Link
     */
    String createPaymentLink(UUID userId, Long amount);

    /**
     * Luồng 2: Xử lý Webhook (thông báo) được bắn về từ PayOS sau khi KH quét mã thành công
     */
    boolean processWebhook(Map<String, Object> webhookBody, String inputSignature);
}
