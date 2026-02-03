package com.CNTTK18.notification_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.Common.Event.ConfirmationEvent;
import com.CNTTK18.notification_service.service.EmailService;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    private final EmailService emailService;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/confirmation")
    public ResponseEntity<String> sendConfirmationEmail(ConfirmationEvent requestBody) {
        emailService.sendConfirmationEmail(requestBody);
        return new ResponseEntity<>("Gửi mail thành công", HttpStatus.OK);
    }
}
