package com.CNTTK18.dashboard_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserDashboardDataClient {

    @GetMapping("/internal/dashboard/users/count")
    long countUsers();

    @GetMapping("/internal/dashboard/users/count-by-created-between")
    long countUsersByCreatedBetween(@RequestParam("start") String start, @RequestParam("end") String end);
}
