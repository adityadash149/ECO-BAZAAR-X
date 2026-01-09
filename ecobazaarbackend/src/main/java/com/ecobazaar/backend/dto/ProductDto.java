package com.ecobazaar.backend.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
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
	public Long getCategoryId() {
		return categoryId;
	}
	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}
	public String getCategoryName() {
		return categoryName;
	}
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}
	public Long getSellerId() {
		return sellerId;
	}
	public void setSellerId(Long sellerId) {
		this.sellerId = sellerId;
	}
	public String getSellerName() {
		return sellerName;
	}
	public void setSellerName(String sellerName) {
		this.sellerName = sellerName;
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
	@Override
	public String toString() {
		return "ProductDto [id=" + id + ", name=" + name + ", description=" + description + ", price=" + price
				+ ", categoryId=" + categoryId + ", categoryName=" + categoryName + ", sellerId=" + sellerId
				+ ", sellerName=" + sellerName + ", weightKg=" + weightKg + ", shippingDistanceKm=" + shippingDistanceKm
				+ ", carbonScore=" + carbonScore + ", stockQuantity=" + stockQuantity + ", imageUrl=" + imageUrl
				+ ", ecoPoints=" + ecoPoints + ", carbonReduction=" + carbonReduction + ", isEcoFriendly=" + isEcoFriendly + ", isActive=" + isActive + ", createdAt=" + createdAt
				+ ", updatedAt=" + updatedAt + "]";
	}
	public ProductDto(Long id, String name, String description, BigDecimal price, Long categoryId, String categoryName,
			Long sellerId, String sellerName, BigDecimal weightKg, BigDecimal shippingDistanceKm,
			BigDecimal carbonScore, Integer stockQuantity, String imageUrl, Integer ecoPoints, Double carbonReduction, Boolean isEcoFriendly, Boolean isActive,
			LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.name = name;
		this.description = description;
		this.price = price;
		this.categoryId = categoryId;
		this.categoryName = categoryName;
		this.sellerId = sellerId;
		this.sellerName = sellerName;
		this.weightKg = weightKg;
		this.shippingDistanceKm = shippingDistanceKm;
		this.carbonScore = carbonScore;
		this.stockQuantity = stockQuantity;
		this.imageUrl = imageUrl;
		this.ecoPoints = ecoPoints;
		this.carbonReduction = carbonReduction;
		this.isEcoFriendly = isEcoFriendly;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
	public ProductDto() {
		super();
		// TODO Auto-generated constructor stub
	}
    
    
}