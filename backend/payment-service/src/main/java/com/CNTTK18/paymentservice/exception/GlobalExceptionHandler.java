package com.CNTTK18.paymentservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.CNTTK18.Common.Exception.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(WebhookSignatureException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleWebhookSignatureException(WebhookSignatureException ex) {
        ErrorResponse errorResponse = new ErrorResponse("WEBHOOK_SIGNATURE_ERROR", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Xử lý exception chung
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ex.printStackTrace();
        ErrorResponse errorResponse = new ErrorResponse(
                "INTERNAL_SERVER_ERROR" + ex.getStackTrace().toString(), "Đã xảy ra lỗi hệ thống: " + ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
