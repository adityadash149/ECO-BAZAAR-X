package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.NotificationDto;
import com.ecobazaar.backend.entity.Notification;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.NotificationRepository;
import com.ecobazaar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification createNotification(User user, String title, String message, String notificationType) {
        Notification notification = new Notification(user, title, message, notificationType);
        return notificationRepository.save(notification);
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<NotificationDto> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countUnreadNotificationsByUserId(userId);
    }

    public void markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markNotificationAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllNotificationsAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void createSampleNotifications(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = user.getRole().name();
            
            if ("ADMIN".equals(role)) {
                // Admin notifications
                createNotification(user, "New Seller Registration", "A new seller 'EcoStore' has registered and is waiting for approval.", "SELLER_REGISTRATION");
                createNotification(user, "Product Review Required", "5 products are pending approval for review from multiple sellers.", "PRODUCT_APPROVAL");
                createNotification(user, "High Carbon Footprint Alert", "Product 'Plastic Bottles' flagged for high carbon footprint (8.5t).", "CARBON_ALERT");
                createNotification(user, "Monthly Report Ready", "Your monthly carbon footprint analytics report is ready for download.", "REPORT");
                createNotification(user, "New Order Alert", "150 new orders placed today with total revenue of ₹45,000.", "ORDER_SUMMARY");
            } else if ("SELLER".equals(role)) {
                // Seller notifications
                createNotification(user, "Welcome to EcoBazaarX!", "Your seller application has been approved! You can now start adding products and begin your eco-friendly business journey. All the best!", "SELLER_APPROVAL");
                createNotification(user, "Product Approved!", "Great news! Your product 'Bamboo Water Bottle' has been approved and is now live on the marketplace.", "PRODUCT_APPROVAL");
                createNotification(user, "New Order Received", "You have received a new order for 'Organic Cotton T-Shirt' from customer Pushpa Priya. Order value: ₹799", "ORDER");
                createNotification(user, "Low Stock Alert", "Your product 'Solar LED Lantern' is running low on stock (5 items remaining).", "STOCK_ALERT");
                createNotification(user, "Carbon Score Update", "Your overall carbon score has improved by 15% this month! Keep up the good work.", "CARBON_UPDATE");
            } else if ("CUSTOMER".equals(role)) {
                // Customer notifications
                createNotification(user, "Welcome to EcoBazaarX!", "Thank you for joining our eco-friendly marketplace. Start shopping for sustainable products today!", "WELCOME");
                createNotification(user, "Order Confirmation", "Your order #ECO1001 has been confirmed and is being processed. Expected delivery: 3-5 business days.", "ORDER_STATUS");
                createNotification(user, "Order Shipped", "Great news! Your order #ECO1001 has been shipped and is on its way. Track your package now.", "ORDER_STATUS");
                createNotification(user, "Eco Points Earned", "Congratulations! You have earned 75 eco points for your recent purchase of eco-friendly products.", "ECO_POINTS");
                createNotification(user, "Special Offer", "🌱 20% off on all organic products this week! Use code ECO20 at checkout.", "PROMOTION");
            }
        }
    }

    private NotificationDto convertToDto(Notification notification) {
        return new NotificationDto(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getNotificationType(),
            notification.getIsRead(),
            notification.getCreatedAt()
        );
    }
}
