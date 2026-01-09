package com.ecobazaar.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "tree_planting_submissions")
public class TreePlantingSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "customerProfile"})
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({"user", "orderItems"})
    private Order order;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
    
    @Column(name = "eco_points_awarded")
    private Integer ecoPointsAwarded = 0;
    
    @Column(name = "is_eco_friendly_product")
    private Boolean isEcoFriendlyProduct = false;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    @JsonIgnoreProperties({"password"})
    private User reviewedBy;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
    
    // Constructors
    public TreePlantingSubmission() {}
    
    public TreePlantingSubmission(User user, Order order, String imageUrl, String description) {
        this.user = user;
        this.order = order;
        this.imageUrl = imageUrl;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public SubmissionStatus getStatus() {
        return status;
    }
    
    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }
    
    public String getAdminNotes() {
        return adminNotes;
    }
    
    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
    
    public Integer getEcoPointsAwarded() {
        return ecoPointsAwarded;
    }
    
    public void setEcoPointsAwarded(Integer ecoPointsAwarded) {
        this.ecoPointsAwarded = ecoPointsAwarded;
    }
    
    public Boolean getIsEcoFriendlyProduct() {
        return isEcoFriendlyProduct;
    }
    
    public void setIsEcoFriendlyProduct(Boolean isEcoFriendlyProduct) {
        this.isEcoFriendlyProduct = isEcoFriendlyProduct;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    public User getReviewedBy() {
        return reviewedBy;
    }
    
    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
    
    // Enum for submission status
    public enum SubmissionStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
