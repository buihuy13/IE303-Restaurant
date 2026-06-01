package com.CNTTK18.user_service.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Users {
    @Id
    private UUID id;

    @NotBlank(message = "Username is mandatory")
    private String username;

    @Email
    @NotBlank(message = "Email is mandatory")
    private String email;

    private String phone;

    private String slug;

    @Column(name = "bank_number")
    private String bankNumber;

    @Column(name = "bank")
    private String bank;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "created_at")
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Address> addressList;

    public List<Address> getAddressList() {
        if (this.addressList == null) {
            this.addressList = new ArrayList<Address>();
        }
        return addressList;
    }

    public void setAddressList(List<Address> addressList) {
        if (addressList == null) {
            this.addressList = new ArrayList<Address>();
            return;
        }
        this.addressList = addressList;
    }

    public void addAddress(Address address) {
        if (this.addressList == null) {
            this.addressList = new ArrayList<Address>();
        }
        this.addressList.add(address);
        address.setUser(this);
    }
}
