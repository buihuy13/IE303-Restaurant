package com.CNTTK18.user_service.service.Impl;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.CNTTK18.user_service.repository.UserRepository;
import com.CNTTK18.user_service.service.DashboardUserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardUserServiceImpl implements DashboardUserService {
    private final UserRepository userRepository;

    @Override
    public long countUsers() {
        return userRepository.count();
    }

    @Override
    public long countUsersByCreatedBetween(String start, String end) {
        return userRepository.countByCreatedAtBetween(parseInstant(start), parseInstant(end));
    }

    private Instant parseInstant(String value) {
        try {
            return Instant.parse(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid instant value: " + value);
        }
    }
}
