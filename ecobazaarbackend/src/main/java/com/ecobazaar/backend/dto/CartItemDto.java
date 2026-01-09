package com.ecobazaar.backend.dto;

public class CartItemDto {
    private Long cartId;
    private Long productId;
    private String name;
    private String image;
    private Double price;
    private Integer quantity;
    private Integer ecoPoints;
    private Double carbonSaved;

    public CartItemDto() {
    }

    public CartItemDto(Long cartId, Long productId, String name, String image,
                       Double price, Integer quantity, Integer ecoPoints, Double carbonSaved) {
        this.cartId = cartId;
        this.productId = productId;
        this.name = name;
        this.image = image;
        this.price = price;
        this.quantity = quantity;
        this.ecoPoints = ecoPoints;
        this.carbonSaved = carbonSaved;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getEcoPoints() {
        return ecoPoints;
    }

    public void setEcoPoints(Integer ecoPoints) {
        this.ecoPoints = ecoPoints;
    }

    public Double getCarbonSaved() {
        return carbonSaved;
    }

    public void setCarbonSaved(Double carbonSaved) {
        this.carbonSaved = carbonSaved;
    }
}

