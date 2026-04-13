package com.CNTTK18.user_service.repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.CNTTK18.user_service.model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, UUID>, JpaSpecificationExecutor<Users> {
    Optional<Users> findByEmail(String email);

    Optional<Users> findBySlug(String slug);

    long countByCreatedAtAfter(Instant date);

    long countByCreatedAtBetween(Instant start, Instant end);

    default long countByCreatedAtAfter(LocalDateTime date) {
        return countByCreatedAtAfter(date.toInstant(ZoneOffset.UTC));
    }

    default long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end) {
        return countByCreatedAtBetween(start.toInstant(ZoneOffset.UTC), end.toInstant(ZoneOffset.UTC));
    }
}
