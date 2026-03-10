package com.CNTTK18.paymentservice.utils;

import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
public class WebhookUtils {

    /**
     * Sắp xếp các key của Object (Map) theo thứ tự Alphabet và loại bỏ các value bị null
     */
    public String convertObjToQueryStr(Map<String, Object> data) {
        // TreeMap tự động sắp xếp các key theo Alphabet
        Map<String, Object> sortedMap = new TreeMap<>(data);

        return sortedMap.entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .map(entry -> entry.getKey() + "=" + entry.getValue().toString())
                .collect(Collectors.joining("&"));
    }

    /**
     * Mã hóa chuỗi String bằng thuật toán HMAC-SHA256
     */
    public String createSignature(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] bytes = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Chuyển array byte thành chuỗi Hex (hệ cơ số 16)
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA256", e);
        }
    }

    /**
     * Xác thực dữ liệu Webhook có phải của PayOS hay không
     * Thông qua việc băm dữ liệu Query và so sánh với Signature PayOS gửi về
     */
    public boolean isValidData(Map<String, Object> data, String currentSignature, String checksumKey) {
        String queryStr = convertObjToQueryStr(data);
        String calculatedSignature = createSignature(queryStr, checksumKey);
        return calculatedSignature.equals(currentSignature);
    }
}
