package com.ecobazaar.backend.dto;

import java.math.BigDecimal;

public class OrderItemDetailDto {
    private String productName;
    private String sellerName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalPrice;
    private String categoryName;
    private String imageUrl;

    public OrderItemDetailDto() {}

    public OrderItemDetailDto(String productName, String sellerName, Integer quantity, 
                             BigDecimal price, BigDecimal totalPrice, String categoryName, String imageUrl) {
        this.productName = productName;
        this.sellerName = sellerName;
        this.quantity = quantity;
        this.price = price;
        this.totalPrice = totalPrice;
        this.categoryName = categoryName;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
