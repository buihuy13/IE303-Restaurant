package com.CNTTK18.auth_service.service;

import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Event.ConfirmationEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {
    private final RabbitTemplate rabbitTemplate;

    @Async
    public void sendConfirmationEmail(String email, UUID verificationCode) {
        ConfirmationEvent ce = new ConfirmationEvent(email, "api/users/confirmation?code=" + verificationCode);
        rabbitTemplate.convertAndSend("Confirmation_exchange", "Confirmation", ce);
    }
}
