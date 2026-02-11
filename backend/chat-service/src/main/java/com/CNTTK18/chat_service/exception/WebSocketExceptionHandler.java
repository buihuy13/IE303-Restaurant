package com.CNTTK18.chat_service.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

public class WebSocketExceptionHandler extends StompSubProtocolErrorHandler {
    private static final Logger log = LoggerFactory.getLogger(WebSocketExceptionHandler.class);

    @Override
    public Message<byte[]> handleClientMessageProcessingError(@Nullable Message<byte[]> clientMessage, Throwable ex) {

        String errorMsg = (ex != null && ex.getMessage() != null) ? ex.getMessage() : "Unknown error";

        log.error("WebSocket error: {}", errorMsg, ex);

        if (clientMessage != null && clientMessage.getPayload() != null) {
            log.debug("Client message: " + new String(clientMessage.getPayload()));
        }

        // Tạo một message lỗi để gửi lại cho client
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
        accessor.setMessage(errorMsg);
        accessor.setLeaveMutable(true);

        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
