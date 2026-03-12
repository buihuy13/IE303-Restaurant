package com.CNTTK18.paymentservice.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import org.hibernate.annotations.GenericGenerator;

import lombok.*;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    // UUID của User thực hiện thanh toán
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Mã đơn hàng hệ thống mã hoá gửi cho PayOS (PayOS require int/long)
    @Column(name = "order_code", nullable = false, unique = true)
    private Long orderCode;

    // Số tiền thanh toán
    @Column(name = "amount", nullable = false)
    private Long amount;

    // Trạng thái thanh toán: PENDING, PAID, CANCELLED
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    // ID của link thanh toán do PayOS trả về
    @Column(name = "payment_link_id")
    private String paymentLinkId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
