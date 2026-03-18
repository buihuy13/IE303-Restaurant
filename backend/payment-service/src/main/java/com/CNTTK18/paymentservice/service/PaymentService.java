package com.CNTTK18.paymentservice.service;

import java.util.Map;

import com.CNTTK18.paymentservice.dto.PaymentRequestDTO;
import com.CNTTK18.paymentservice.dto.PaymentResponseDTO;

public interface PaymentService {

    /**
     * Luồng 1: Nhận yêu cầu tạo thanh toán từ Frontend -> Lưu Db -> Call PayOS -> Trả về Link
     */
    PaymentResponseDTO createPaymentLink(PaymentRequestDTO request);

    /**
     * Luồng 2: Xử lý Webhook (thông báo) được bắn về từ PayOS sau khi KH quét mã thành công
     */
    boolean processWebhook(Map<String, Object> webhookBody, String inputSignature);
}
