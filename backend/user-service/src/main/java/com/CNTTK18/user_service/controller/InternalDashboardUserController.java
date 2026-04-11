package com.CNTTK18.user_service.controller;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.CNTTK18.user_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard/users")
@RequiredArgsConstructor
public class InternalDashboardUserController {
    private final UserRepository userRepository;

    @GetMapping("/count")
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.ok(userRepository.count());
    }

    @GetMapping("/count-by-created-between")
    public ResponseEntity<Long> countUsersByCreatedBetween(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(userRepository.countByCreatedAtBetween(parseInstant(start), parseInstant(end)));
    }

    private Instant parseInstant(String value) {
        try {
            return Instant.parse(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid instant value: " + value);
        }
    }
}
