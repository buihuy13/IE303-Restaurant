package com.CNTTK18.notification_service.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.apache.tomcat.util.buf.StringUtils;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.CNTTK18.Common.Event.ConfirmationEvent;
import com.CNTTK18.Common.Event.OrderNotificationEvent;

@Service
public class EmailService {

    @Value("${URL}")
    private String url;

    private final SpringTemplateEngine springTemplateEngine;
    private final JavaMailSender javaMailSender;

    public EmailService(SpringTemplateEngine springTemplateEngine, JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
        this.springTemplateEngine = springTemplateEngine;
    }

    @Value("${spring.mail.username}")
    private String username;

    @RabbitListener(queues = "Confirmation_queue")
    public void sendConfirmationEmail(ConfirmationEvent request) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", request.getEmail());
        map.put("url", url + request.getUrl());
        String templateName = "confirmation";
        String subject = genSubject(request.getEmail());
        sendEmail(map, templateName, subject, request.getEmail());
    }

    public void sendOrderStatusEmail(OrderNotificationEvent event) {
        if (event == null || event.getUserEmail() == null || event.getUserEmail().isBlank()) {
            return;
        }

        String status = event.getStatus() == null ? "UNKNOWN" : event.getStatus();
        Map<String, Object> map = new HashMap<>();
        map.put("orderId", event.getOrderId());
        map.put("restaurantName", event.getRestaurantName());
        map.put("status", status);
        map.put("totalPrice", event.getTotalPrice());
        map.put("deliveryAddress", event.getDeliveryAddress());
        map.put(
                "message",
                ("CANCELLED".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status))
                        ? "Unfortunately, your order could not be completed."
                        : "Your order has been received successfully.");

        String templateName = "order-status";
        String subject = "Order " + status + " - " + event.getOrderId();
        sendEmail(map, templateName, subject, event.getUserEmail());
    }

    private String genSubject(String email) {
        return StringUtils.join(Arrays.asList("Greetings", email), ' ');
    }

    private void sendEmail(Map<String, Object> map, String templateName, String subject, String destinationEmail) {
        try {
            Context context = new Context();
            context.setVariables(map);
            String process = springTemplateEngine.process(templateName, context);
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
            helper.setSubject(subject);
            helper.setText(process, true);
            helper.setTo(destinationEmail);
            helper.setFrom(username);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException | MailException ex) {
            throw new RuntimeException("Lỗi khi gửi mail, " + ex.getMessage(), ex);
        }
    }
}
