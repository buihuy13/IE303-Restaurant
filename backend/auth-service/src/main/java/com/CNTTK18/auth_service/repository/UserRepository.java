package com.CNTTK18.auth_service.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.auth_service.model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, UUID>, JpaSpecificationExecutor<Users> {
    Optional<Users> findByUserName(String username);

    Optional<Users> findByEmail(String email);

    Optional<Users> findByVerficationCode(String code);

    @Query("SELECT u FROM Users u WHERE u.enabled = false " + "AND u.createdAt <= :thresholdDate")
    List<Users> findInactiveAccountsOlderThan(@Param("thresholdDate") Instant thresholdDate);
}
