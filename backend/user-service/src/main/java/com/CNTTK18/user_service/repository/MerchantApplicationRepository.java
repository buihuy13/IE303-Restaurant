package com.CNTTK18.user_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.user_service.model.MerchantApplication;
import com.CNTTK18.user_service.model.data.ApplicationStatus;

@Repository
public interface MerchantApplicationRepository extends JpaRepository<MerchantApplication, UUID> {

    List<MerchantApplication> findByStatus(ApplicationStatus status);

    List<MerchantApplication> findAllByOrderByCreatedAtDesc();

    Optional<MerchantApplication> findByUserId(UUID userId);

    boolean existsByEmail(String email);
}
