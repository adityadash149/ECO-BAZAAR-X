package com.ecobazaar.backend.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private Long totalProducts;
    private Long activeProducts;
    private Long totalSales;
    private BigDecimal totalRevenue;
    private BigDecimal carbonImpact;
    private Long pendingOrders;

    public DashboardStatsDto() {}

    public DashboardStatsDto(Long totalProducts, Long activeProducts, Long totalSales, 
                           BigDecimal totalRevenue, BigDecimal carbonImpact, Long pendingOrders) {
        this.totalProducts = totalProducts;
        this.activeProducts = activeProducts;
        this.totalSales = totalSales;
        this.totalRevenue = totalRevenue;
        this.carbonImpact = carbonImpact;
        this.pendingOrders = pendingOrders;
    }

    // Getters and Setters
    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Long getActiveProducts() {
        return activeProducts;
    }

    public void setActiveProducts(Long activeProducts) {
        this.activeProducts = activeProducts;
    }

    public Long getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Long totalSales) {
        this.totalSales = totalSales;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getCarbonImpact() {
        return carbonImpact;
    }

    public void setCarbonImpact(BigDecimal carbonImpact) {
        this.carbonImpact = carbonImpact;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }
}
