package com.CNTTK18.paymentservice.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.CNTTK18.paymentservice.service.PaymentService;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {
    @Mock
    private PaymentService paymentService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new PaymentController(paymentService))
                .build();
    }

    @Test
    void handleWebhookAcceptsGatewayPayosWebhookPath() throws Exception {
        when(paymentService.processWebhook(anyMap(), any())).thenReturn(true);

        mockMvc.perform(post("/payment/payos-webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"signature\":\"sig\",\"data\":{}}"))
                .andExpect(status().isOk())
                .andExpect(content().string("success"));

        verify(paymentService).processWebhook(anyMap(), eq("sig"));
    }
}
