package com.CNTTK18.auth_service.scheduler;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.CNTTK18.auth_service.model.Users;
import com.CNTTK18.auth_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomTaskScheduler {
    private final UserRepository userRepository;

    // 12h đêm mỗi ngày sẽ chạy để check
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteInactivateUsers() {
        Instant thresholdDate = Instant.now().minus(30, ChronoUnit.DAYS);
        List<Users> inactivedUsers = userRepository.findInactiveAccountsOlderThan(thresholdDate);
        log.info("There are " + inactivedUsers.size() + " accounts need to be deleted");
        userRepository.deleteAll(inactivedUsers);
        log.info("Deleted successfully");
    }
}
