package com.CNTTK18.user_service.listener;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.CNTTK18.Common.Event.User.DeleteUserDTO;
import com.CNTTK18.Common.Event.User.UpdateUsernameDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserEventListener {
    private final RabbitTemplate rabbitTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserUpdated(UpdateUsernameDTO event) {
        rabbitTemplate.convertAndSend("User_exchange", "UpdateUser", event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserDeleted(DeleteUserDTO event) {
        rabbitTemplate.convertAndSend("User_exchange", "DeleteUser", event);
    }
}
