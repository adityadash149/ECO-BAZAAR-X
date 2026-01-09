package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.DashboardStatsDto;
import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.OrderStatus;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.repository.OrderRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SellerService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    public DashboardStatsDto getDashboardStats(Long sellerId) {
        // Get total products
        Long totalProducts = productRepository.countBySellerId(sellerId);
        
        // Get active products
        Long activeProducts = productRepository.countBySellerIdAndIsActiveTrue(sellerId);
        
        // Get total sales (count of orders)
        Long totalSales = orderRepository.countBySellerId(sellerId);
        
        // Calculate total revenue
        BigDecimal totalRevenue = orderRepository.sumTotalAmountBySellerId(sellerId);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        
        // Calculate carbon impact (sum of all products' carbon scores)
        BigDecimal carbonImpact = productRepository.sumCarbonScoreBySellerId(sellerId);
        if (carbonImpact == null) {
            carbonImpact = BigDecimal.ZERO;
        }
        
        // Get pending orders
        Long pendingOrders = orderRepository.countBySellerIdAndStatus(sellerId, OrderStatus.PENDING);
        
        return new DashboardStatsDto(
            totalProducts,
            activeProducts,
            totalSales,
            totalRevenue,
            carbonImpact,
            pendingOrders
        );
    }
}
