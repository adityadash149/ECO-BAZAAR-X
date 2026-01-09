package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.from:ecobazaar@example.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    public void sendOrderConfirmationEmail(Order order) {
        if (!emailEnabled || mailSender == null) {
            System.out.println("Email service is disabled or not configured. Skipping email for order #" + order.getId());
            return;
        }

        try {
            String customerEmail = order.getUser().getEmail();
            if (customerEmail == null || customerEmail.trim().isEmpty()) {
                System.out.println("Customer email not found for order #" + order.getId());
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Order Confirmation - Order #" + order.getId() + " | EcoBazaar");

            String htmlContent = buildOrderConfirmationEmail(order);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Order confirmation email sent successfully to: " + customerEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildOrderConfirmationEmail(Order order) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }");
        html.append(".content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }");
        html.append(".order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #16a34a; }");
        html.append(".item { padding: 10px; border-bottom: 1px solid #e5e7eb; }");
        html.append(".item:last-child { border-bottom: none; }");
        html.append(".total { font-size: 18px; font-weight: bold; color: #16a34a; margin-top: 15px; }");
        html.append(".footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🌱 Order Confirmation</h1>");
        html.append("<p>Thank you for your eco-friendly purchase!</p>");
        html.append("</div>");
        html.append("<div class='content'>");
        html.append("<div class='order-info'>");
        html.append("<h2>Order Details</h2>");
        html.append("<p><strong>Order Number:</strong> #").append(order.getId()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(order.getCreatedAt()).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(order.getStatus()).append("</p>");
        html.append("<p><strong>Payment Method:</strong> ").append(order.getPaymentMethod()).append("</p>");
        html.append("</div>");

        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            html.append("<div class='order-info'>");
            html.append("<h3>Order Items</h3>");
            for (OrderItem item : order.getOrderItems()) {
                html.append("<div class='item'>");
                html.append("<p><strong>").append(item.getProduct().getName()).append("</strong></p>");
                html.append("<p>Quantity: ").append(item.getQuantity()).append(" × ");
                html.append(currencyFormat.format(item.getPrice())).append("</p>");
                html.append("</div>");
            }
            html.append("</div>");
        }

        html.append("<div class='order-info'>");
        html.append("<h3>Order Summary</h3>");
        html.append("<p>Subtotal: ").append(currencyFormat.format(order.getTotalPrice())).append("</p>");
        if (order.getTotalCarbonScore() != null) {
            html.append("<p>🌿 Carbon Impact: ").append(order.getTotalCarbonScore()).append(" kg CO₂ saved</p>");
        }
        html.append("<p class='total'>Total: ").append(currencyFormat.format(order.getTotalPrice())).append("</p>");
        html.append("</div>");

        if (order.getShippingAddress() != null && !order.getShippingAddress().trim().isEmpty()) {
            html.append("<div class='order-info'>");
            html.append("<h3>Shipping Address</h3>");
            html.append("<p style='white-space: pre-line;'>").append(order.getShippingAddress()).append("</p>");
            html.append("</div>");
        }

        if (order.getTrackingNumber() != null && !order.getTrackingNumber().trim().isEmpty()) {
            html.append("<div class='order-info'>");
            html.append("<h3>Tracking Information</h3>");
            html.append("<p><strong>Tracking Number:</strong> ").append(order.getTrackingNumber()).append("</p>");
            html.append("</div>");
        }

        html.append("<div class='footer'>");
        html.append("<p>Thank you for choosing EcoBazaar!</p>");
        html.append("<p>Together, we're making the world a greener place. 🌍</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }
}

