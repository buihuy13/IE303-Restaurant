package com.CNTTK18.user_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.user_service.service.DashboardUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard/users")
@RequiredArgsConstructor
public class InternalDashboardUserController {
    private final DashboardUserService dashboardUserService;

    @GetMapping("/count")
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.ok(dashboardUserService.countUsers());
    }

    @GetMapping("/count-by-created-between")
    public ResponseEntity<Long> countUsersByCreatedBetween(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(dashboardUserService.countUsersByCreatedBetween(start, end));
    }
}
