package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.*;
import com.ecobazaar.backend.repository.TreePlantingSubmissionRepository;
import com.ecobazaar.backend.repository.OrderRepository;
import com.ecobazaar.backend.repository.CustomerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class TreePlantingService {
    
    @Autowired
    private TreePlantingSubmissionRepository treePlantingSubmissionRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CustomerProfileRepository customerProfileRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    private static final String UPLOAD_DIR = "uploads/tree-planting/";
    private static final int BASE_ECO_POINTS = 50;
    private static final int ECO_FRIENDLY_BONUS = 20;
    
    public TreePlantingSubmission submitTreePlanting(Long userId, Long orderId, MultipartFile image, String description) {
        try {
            System.out.println("=== TREE PLANTING SUBMISSION DEBUG ===");
            System.out.println("User ID: " + userId);
            System.out.println("Order ID: " + orderId);
            System.out.println("Image size: " + (image != null ? image.getSize() : "null"));
            System.out.println("Description: " + description);
            
            // Check if submission already exists
            Optional<TreePlantingSubmission> existingSubmission = treePlantingSubmissionRepository.findByUserIdAndOrderId(userId, orderId);
            if (existingSubmission.isPresent()) {
                throw new RuntimeException("Tree planting submission already exists for this order");
            }
            
            // Get order and verify it belongs to user
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            System.out.println("Order found: " + order.getId() + ", Status: " + order.getStatus() + ", User: " + order.getUser().getId());
            
            if (!order.getUser().getId().equals(userId)) {
                throw new RuntimeException("Order does not belong to user");
            }
            
            // Check if order is delivered
            if (!order.getStatus().toString().equals("DELIVERED")) {
                throw new RuntimeException("Order must be delivered before submitting tree planting");
            }
            
            // Check if order was delivered within the last 24 hours
            LocalDateTime deliveredAt = order.getDeliveredAt();
            if (deliveredAt == null) {
                throw new RuntimeException("Order delivery date not found");
            }
            
            LocalDateTime now = LocalDateTime.now();
            long hoursSinceDelivery = java.time.Duration.between(deliveredAt, now).toHours();
            System.out.println("Hours since delivery: " + hoursSinceDelivery);
            
            if (hoursSinceDelivery > 24) {
                throw new RuntimeException("Tree planting submission window has expired. You can only submit within 24 hours of delivery.");
            }
            
            // Save image
            String imageUrl = saveTreePlantingImage(image);
            System.out.println("Image saved to: " + imageUrl);
            
            // Check if order contains eco-friendly products
            boolean isEcoFriendly = order.getTotalCarbonScore().compareTo(java.math.BigDecimal.valueOf(3)) <= 0;
            System.out.println("Is eco-friendly: " + isEcoFriendly + ", Carbon score: " + order.getTotalCarbonScore());
            
            // Create submission
            TreePlantingSubmission submission = new TreePlantingSubmission();
            submission.setUser(order.getUser());
            submission.setOrder(order);
            submission.setImageUrl(imageUrl);
            submission.setDescription(description);
            submission.setIsEcoFriendlyProduct(isEcoFriendly);
            submission.setStatus(TreePlantingSubmission.SubmissionStatus.PENDING);
            submission.setSubmittedAt(LocalDateTime.now()); // Add this missing field
            
            TreePlantingSubmission savedSubmission = treePlantingSubmissionRepository.save(submission);
            System.out.println("Submission saved with ID: " + savedSubmission.getId());
            System.out.println("================================");
            
            return savedSubmission;
            
        } catch (Exception e) {
            System.out.println("ERROR in submitTreePlanting: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to submit tree planting: " + e.getMessage());
        }
    }
    
    public List<TreePlantingSubmission> getUserSubmissions(Long userId) {
        return treePlantingSubmissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }
    
    public List<TreePlantingSubmission> getAllSubmissions() {
        return treePlantingSubmissionRepository.findAllByOrderBySubmittedAtDesc();
    }
    
    public List<TreePlantingSubmission> getPendingSubmissions() {
        return treePlantingSubmissionRepository.findByStatusOrderBySubmittedAtDesc(TreePlantingSubmission.SubmissionStatus.PENDING);
    }
    
    public TreePlantingSubmission reviewSubmission(Long submissionId, boolean approved, String adminNotes, Long adminId) {
        TreePlantingSubmission submission = treePlantingSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        // Allow re-approval of rejected submissions, but not re-review of approved ones
        if (submission.getStatus() == TreePlantingSubmission.SubmissionStatus.APPROVED) {
            throw new RuntimeException("Submission has already been approved and cannot be changed");
        }
        
        User admin = new User();
        admin.setId(adminId);
        
        submission.setReviewedBy(admin);
        submission.setReviewedAt(LocalDateTime.now());
        submission.setAdminNotes(adminNotes);
        
        if (approved) {
            submission.setStatus(TreePlantingSubmission.SubmissionStatus.APPROVED);
            
            // Calculate eco points
            int ecoPoints = BASE_ECO_POINTS;
            if (submission.getIsEcoFriendlyProduct()) {
                ecoPoints += ECO_FRIENDLY_BONUS;
            }
            submission.setEcoPointsAwarded(ecoPoints);
            
            // Award eco points to customer (always award on approval)
            System.out.println("=== AWARDING ECO POINTS ===");
            System.out.println("User ID: " + submission.getUser().getId());
            System.out.println("Eco points to award: " + ecoPoints);
            System.out.println("Is eco-friendly product: " + submission.getIsEcoFriendlyProduct());
            
            awardEcoPoints(submission.getUser().getId(), ecoPoints);
            
            // Send approval notification
            String title = "Tree Planting Approved!";
            String message = String.format("Your tree planting submission has been approved! You've earned %d eco points. Keep up the great work!", ecoPoints);
            notificationService.createNotification(submission.getUser(), title, message, "TREE_PLANTING_APPROVED");
            
        } else {
            submission.setStatus(TreePlantingSubmission.SubmissionStatus.REJECTED);
            
            // Send rejection notification
            String title = "Tree Planting Submission Rejected";
            String message = "Your tree planting submission has been rejected. Reason: " + adminNotes + ". Please ensure you upload a clear photo of yourself planting a tree.";
            notificationService.createNotification(submission.getUser(), title, message, "TREE_PLANTING_REJECTED");
        }
        
        return treePlantingSubmissionRepository.save(submission);
    }
    
    private String saveTreePlantingImage(MultipartFile image) {
        try {
            System.out.println("=== SAVING TREE PLANTING IMAGE ===");
            System.out.println("Original filename: " + image.getOriginalFilename());
            System.out.println("Image size: " + image.getSize());
            System.out.println("Content type: " + image.getContentType());
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            System.out.println("Upload path: " + uploadPath.toAbsolutePath());
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created directory: " + uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            
            System.out.println("Generated filename: " + filename);
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath);
            
            String imageUrl = "/uploads/tree-planting/" + filename;
            System.out.println("Image URL: " + imageUrl);
            System.out.println("File exists: " + Files.exists(filePath));
            System.out.println("================================");
            
            return imageUrl;
            
        } catch (IOException e) {
            System.out.println("ERROR saving image: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save tree planting image: " + e.getMessage());
        }
    }
    
    private void awardEcoPoints(Long userId, int points) {
        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        
        int currentPoints = profile.getEcoPoints() != null ? profile.getEcoPoints() : 0;
        int newPoints = currentPoints + points;
        profile.setEcoPoints(newPoints);
        
        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        
        // Debug logging
        System.out.println("=== ECO POINTS AWARDED ===");
        System.out.println("User ID: " + userId);
        System.out.println("Points to award: " + points);
        System.out.println("Previous points: " + currentPoints);
        System.out.println("New total points: " + newPoints);
        System.out.println("Saved profile eco_points: " + savedProfile.getEcoPoints());
        System.out.println("=========================");
    }
    
    public Long getPendingSubmissionsCount() {
        return treePlantingSubmissionRepository.countByStatus(TreePlantingSubmission.SubmissionStatus.PENDING);
    }
    
    public Long getApprovedSubmissionsCount() {
        return treePlantingSubmissionRepository.countByStatus(TreePlantingSubmission.SubmissionStatus.APPROVED);
    }
}
