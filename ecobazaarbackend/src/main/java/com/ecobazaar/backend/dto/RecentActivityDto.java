package com.ecobazaar.backend.dto;

import java.time.LocalDateTime;

public class RecentActivityDto {
    private String activityType; // USER_REGISTRATION, PRODUCT_ADDED, ORDER_PLACED, etc.
    private String description;
    private String status; // PENDING, APPROVED, REJECTED, etc.
    private LocalDateTime timestamp;
    private String entityId; // ID of related entity
    private String entityType; // USER, PRODUCT, ORDER, etc.

    public RecentActivityDto() {}

    public RecentActivityDto(String activityType, String description, String status, 
                           LocalDateTime timestamp, String entityId, String entityType) {
        this.activityType = activityType;
        this.description = description;
        this.status = status;
        this.timestamp = timestamp;
        this.entityId = entityId;
        this.entityType = entityType;
    }

    // Getters and Setters
    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
}
