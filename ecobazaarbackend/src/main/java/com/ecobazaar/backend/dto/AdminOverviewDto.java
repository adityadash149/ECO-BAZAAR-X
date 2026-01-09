package com.ecobazaar.backend.dto;

import java.math.BigDecimal;

public class AdminOverviewDto {
    private Long totalUsers;
    private Long totalSellers;
    private Long totalCustomers;
    private Long activeSellers;
    private Long totalProducts;
    private BigDecimal totalCarbonImpact;
    private Long pendingApplications;
    private Long totalOrders;
    private BigDecimal totalRevenue;

    public AdminOverviewDto() {}

    public AdminOverviewDto(Long totalUsers, Long totalSellers, Long totalCustomers, Long activeSellers, 
                           Long totalProducts, BigDecimal totalCarbonImpact, Long pendingApplications, 
                           Long totalOrders, BigDecimal totalRevenue) {
        this.totalUsers = totalUsers;
        this.totalSellers = totalSellers;
        this.totalCustomers = totalCustomers;
        this.activeSellers = activeSellers;
        this.totalProducts = totalProducts;
        this.totalCarbonImpact = totalCarbonImpact;
        this.pendingApplications = pendingApplications;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
    }

    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalSellers() { return totalSellers; }
    public void setTotalSellers(Long totalSellers) { this.totalSellers = totalSellers; }

    public Long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Long totalCustomers) { this.totalCustomers = totalCustomers; }

    public Long getActiveSellers() { return activeSellers; }
    public void setActiveSellers(Long activeSellers) { this.activeSellers = activeSellers; }

    public Long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Long totalProducts) { this.totalProducts = totalProducts; }

    public BigDecimal getTotalCarbonImpact() { return totalCarbonImpact; }
    public void setTotalCarbonImpact(BigDecimal totalCarbonImpact) { this.totalCarbonImpact = totalCarbonImpact; }

    public Long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(Long pendingApplications) { this.pendingApplications = pendingApplications; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
