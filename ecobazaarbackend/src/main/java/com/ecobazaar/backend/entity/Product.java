package com.ecobazaar.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@lombok.ToString(exclude = {"seller", "category"})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"products", "hibernateLazyInitializer", "handler"})
    private Category category;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"products", "password", "orders", "hibernateLazyInitializer", "handler"})
    private User seller;
    
    @Column(name = "weight_kg", precision = 8, scale = 3)
    private BigDecimal weightKg = BigDecimal.ZERO;
    
    @Column(name = "shipping_distance_km", precision = 8, scale = 2)
    private BigDecimal shippingDistanceKm = BigDecimal.ZERO;
    
    @Column(name = "carbon_score", precision = 8, scale = 2)
    private BigDecimal carbonScore = BigDecimal.ZERO;
    
    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "eco_points")
    private Integer ecoPoints = 0;

    @Column(name = "carbon_reduction")
    private Double carbonReduction = 0.0;

    @Column(name = "is_eco_friendly")
    private Boolean isEcoFriendly = false;
    
    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(nullable = false)
    private boolean isApproved = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public User getSeller() {
		return seller;
	}

	public void setSeller(User seller) {
		this.seller = seller;
	}

	public BigDecimal getWeightKg() {
		return weightKg;
	}

	public void setWeightKg(BigDecimal weightKg) {
		this.weightKg = weightKg;
	}

	public BigDecimal getShippingDistanceKm() {
		return shippingDistanceKm;
	}

	public void setShippingDistanceKm(BigDecimal shippingDistanceKm) {
		this.shippingDistanceKm = shippingDistanceKm;
	}

	public BigDecimal getCarbonScore() {
		return carbonScore;
	}

	public void setCarbonScore(BigDecimal carbonScore) {
		this.carbonScore = carbonScore;
	}

	public Integer getStockQuantity() {
		return stockQuantity;
	}

	public void setStockQuantity(Integer stockQuantity) {
		this.stockQuantity = stockQuantity;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Integer getEcoPoints() {
		return ecoPoints;
	}

	public void setEcoPoints(Integer ecoPoints) {
		this.ecoPoints = ecoPoints;
	}

	public Double getCarbonReduction() {
		return carbonReduction;
	}

	public void setCarbonReduction(Double carbonReduction) {
		this.carbonReduction = carbonReduction;
	}

	public Boolean getIsEcoFriendly() {
		return isEcoFriendly;
	}

	public void setIsEcoFriendly(Boolean isEcoFriendly) {
		this.isEcoFriendly = isEcoFriendly;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        this.isApproved = approved;
    }

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}


	public Product(Long id, String name, String description, BigDecimal price, Category category, User seller,
			BigDecimal weightKg, BigDecimal shippingDistanceKm, BigDecimal carbonScore, Integer stockQuantity,
			String imageUrl, Integer ecoPoints, Double carbonReduction, Boolean isEcoFriendly, Boolean isActive, boolean isApproved, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.name = name;
		this.description = description;
		this.price = price;
		this.category = category;
		this.seller = seller;
		this.weightKg = weightKg;
		this.shippingDistanceKm = shippingDistanceKm;
		this.carbonScore = carbonScore;
		this.stockQuantity = stockQuantity;
		this.imageUrl = imageUrl;
		this.ecoPoints = ecoPoints;
		this.carbonReduction = carbonReduction;
		this.isEcoFriendly = isEcoFriendly;
		this.isActive = isActive;
		this.isApproved = isApproved;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public Product() {
		super();
		// TODO Auto-generated constructor stub
	}
    
}
