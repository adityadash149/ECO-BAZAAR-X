package com.ecobazaar.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CarbonAnalyticsDto {
    private BigDecimal totalCarbonSaved;
    private BigDecimal totalCarbonEmitted;
    private Integer totalOrders;
    private Integer ecoFriendlyOrders;
    private BigDecimal averageCarbonPerOrder;
    private List<OrderCarbonDto> orderHistory;
    private List<MonthlyCarbonDto> monthlyData;
    private Integer ecoPoints;
    private Integer treesEquivalent;

    // Constructors
    public CarbonAnalyticsDto() {}

    public CarbonAnalyticsDto(BigDecimal totalCarbonSaved, BigDecimal totalCarbonEmitted, 
                             Integer totalOrders, Integer ecoFriendlyOrders, 
                             BigDecimal averageCarbonPerOrder, List<OrderCarbonDto> orderHistory,
                             List<MonthlyCarbonDto> monthlyData, Integer ecoPoints, 
                             Integer treesEquivalent) {
        this.totalCarbonSaved = totalCarbonSaved;
        this.totalCarbonEmitted = totalCarbonEmitted;
        this.totalOrders = totalOrders;
        this.ecoFriendlyOrders = ecoFriendlyOrders;
        this.averageCarbonPerOrder = averageCarbonPerOrder;
        this.orderHistory = orderHistory;
        this.monthlyData = monthlyData;
        this.ecoPoints = ecoPoints;
        this.treesEquivalent = treesEquivalent;
    }

    // Getters and Setters
    public BigDecimal getTotalCarbonSaved() {
        return totalCarbonSaved;
    }

    public void setTotalCarbonSaved(BigDecimal totalCarbonSaved) {
        this.totalCarbonSaved = totalCarbonSaved;
    }

    public BigDecimal getTotalCarbonEmitted() {
        return totalCarbonEmitted;
    }

    public void setTotalCarbonEmitted(BigDecimal totalCarbonEmitted) {
        this.totalCarbonEmitted = totalCarbonEmitted;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Integer getEcoFriendlyOrders() {
        return ecoFriendlyOrders;
    }

    public void setEcoFriendlyOrders(Integer ecoFriendlyOrders) {
        this.ecoFriendlyOrders = ecoFriendlyOrders;
    }

    public BigDecimal getAverageCarbonPerOrder() {
        return averageCarbonPerOrder;
    }

    public void setAverageCarbonPerOrder(BigDecimal averageCarbonPerOrder) {
        this.averageCarbonPerOrder = averageCarbonPerOrder;
    }

    public List<OrderCarbonDto> getOrderHistory() {
        return orderHistory;
    }

    public void setOrderHistory(List<OrderCarbonDto> orderHistory) {
        this.orderHistory = orderHistory;
    }

    public List<MonthlyCarbonDto> getMonthlyData() {
        return monthlyData;
    }

    public void setMonthlyData(List<MonthlyCarbonDto> monthlyData) {
        this.monthlyData = monthlyData;
    }

    public Integer getEcoPoints() {
        return ecoPoints;
    }

    public void setEcoPoints(Integer ecoPoints) {
        this.ecoPoints = ecoPoints;
    }

    public Integer getTreesEquivalent() {
        return treesEquivalent;
    }

    public void setTreesEquivalent(Integer treesEquivalent) {
        this.treesEquivalent = treesEquivalent;
    }

    public static class OrderCarbonDto {
    private Long orderId;
    private BigDecimal totalPrice;
    private BigDecimal carbonScore;
    private String status;
    private LocalDateTime orderDate;
    private Integer ecoPointsEarned;

    // Constructors, getters, and setters
    public OrderCarbonDto() {}

    public OrderCarbonDto(Long orderId, BigDecimal totalPrice, BigDecimal carbonScore, 
                         String status, LocalDateTime orderDate, Integer ecoPointsEarned) {
        this.orderId = orderId;
        this.totalPrice = totalPrice;
        this.carbonScore = carbonScore;
        this.status = status;
        this.orderDate = orderDate;
        this.ecoPointsEarned = ecoPointsEarned;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BigDecimal getCarbonScore() { return carbonScore; }
    public void setCarbonScore(BigDecimal carbonScore) { this.carbonScore = carbonScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public Integer getEcoPointsEarned() { return ecoPointsEarned; }
    public void setEcoPointsEarned(Integer ecoPointsEarned) { this.ecoPointsEarned = ecoPointsEarned; }
    }

    public static class MonthlyCarbonDto {
    private String month;
    private BigDecimal carbonSaved;
    private BigDecimal carbonEmitted;
    private Integer orders;
    private Integer ecoPoints;

    // Constructors, getters, and setters
    public MonthlyCarbonDto() {}

    public MonthlyCarbonDto(String month, BigDecimal carbonSaved, BigDecimal carbonEmitted, 
                           Integer orders, Integer ecoPoints) {
        this.month = month;
        this.carbonSaved = carbonSaved;
        this.carbonEmitted = carbonEmitted;
        this.orders = orders;
        this.ecoPoints = ecoPoints;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public BigDecimal getCarbonSaved() { return carbonSaved; }
    public void setCarbonSaved(BigDecimal carbonSaved) { this.carbonSaved = carbonSaved; }

    public BigDecimal getCarbonEmitted() { return carbonEmitted; }
    public void setCarbonEmitted(BigDecimal carbonEmitted) { this.carbonEmitted = carbonEmitted; }

    public Integer getOrders() { return orders; }
    public void setOrders(Integer orders) { this.orders = orders; }

    public Integer getEcoPoints() { return ecoPoints; }
    public void setEcoPoints(Integer ecoPoints) { this.ecoPoints = ecoPoints; }
    }
}
