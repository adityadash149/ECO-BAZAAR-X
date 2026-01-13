package com.ecobazaar.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private String categoryName;
    private Long sellerId;
    private String sellerName;
    private BigDecimal weightKg;
    private BigDecimal shippingDistanceKm;
    private BigDecimal carbonScore;
    private Integer stockQuantity;
    private String imageUrl;
    private Integer ecoPoints;
    private Double carbonReduction;
    private Boolean isEcoFriendly;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Explicit setters for clarity
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    public void setShippingDistanceKm(BigDecimal shippingDistanceKm) { this.shippingDistanceKm = shippingDistanceKm; }
    public void setCarbonScore(BigDecimal carbonScore) { this.carbonScore = carbonScore; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setEcoPoints(Integer ecoPoints) { this.ecoPoints = ecoPoints; }
    public void setCarbonReduction(Double carbonReduction) { this.carbonReduction = carbonReduction; }
    public void setIsEcoFriendly(Boolean isEcoFriendly) { this.isEcoFriendly = isEcoFriendly; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
