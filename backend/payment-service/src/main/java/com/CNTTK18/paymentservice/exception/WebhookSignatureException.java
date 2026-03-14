package com.CNTTK18.paymentservice.exception;

public class WebhookSignatureException extends RuntimeException {
    public WebhookSignatureException(String message, Throwable cause) {
        super(message, cause);
    }
}
