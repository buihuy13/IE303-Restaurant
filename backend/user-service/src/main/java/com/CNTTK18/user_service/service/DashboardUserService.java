package com.CNTTK18.user_service.service;

public interface DashboardUserService {
    long countUsers();

    long countUsersByCreatedBetween(String start, String end);
}
