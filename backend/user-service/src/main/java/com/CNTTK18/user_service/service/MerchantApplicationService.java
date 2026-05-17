package com.CNTTK18.user_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.user_service.dto.request.MerchantRegisterRequest;
import com.CNTTK18.user_service.dto.request.RejectMerchantRequest;
import com.CNTTK18.user_service.dto.response.MerchantApplicationResponse;
import com.CNTTK18.user_service.dto.response.RegisterResponse;
import com.CNTTK18.user_service.model.data.ApplicationStatus;

public interface MerchantApplicationService {

    /**
     * Register a merchant application: creates Keycloak user (enabled=false)
     * and saves restaurant info as a pending application.
     */
    RegisterResponse applyAsMerchant(MerchantRegisterRequest request);

    /**
     * Get all applications, optionally filtered by status.
     * @param status null = return all
     */
    List<MerchantApplicationResponse> getApplications(ApplicationStatus status);

    /**
     * Admin approves a merchant application:
     * - Enables the Keycloak user (enabled=true)
     * - Updates application status to APPROVED
     * Returns the updated application.
     */
    MerchantApplicationResponse approveApplication(UUID applicationId);

    /**
     * Admin rejects a merchant application:
     * - Deletes the Keycloak user
     * - Deletes the user from local DB
     * - Updates application status to REJECTED with reason
     * Returns the updated application.
     */
    MerchantApplicationResponse rejectApplication(UUID applicationId, RejectMerchantRequest request);
}
