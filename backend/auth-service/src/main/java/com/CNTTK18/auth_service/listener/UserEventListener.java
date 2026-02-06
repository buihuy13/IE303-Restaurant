package com.CNTTK18.auth_service.listener;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.CNTTK18.Common.Event.User.CreateUserDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserEventListener {
    private final RabbitTemplate rabbitTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserCreated(CreateUserDTO event) {
        rabbitTemplate.convertAndSend("User_exchange", "CreateUser", event);
    }
}
