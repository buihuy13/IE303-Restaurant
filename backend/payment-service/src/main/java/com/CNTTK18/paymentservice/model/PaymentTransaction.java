package com.CNTTK18.paymentservice.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;

import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.CNTTK18.paymentservice.model.data.PaymentStatus;

import lombok.*;

@Entity
@Table(name = "payment_transactions")
@EntityListeners(AuditingEntityListener.class)
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
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status;

    // ID của link thanh toán do PayOS trả về
    @Column(name = "payment_link_id")
    private String paymentLinkId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = PaymentStatus.PENDING;
        }
    }
}
