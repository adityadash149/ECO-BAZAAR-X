package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.security.UserDetailsServiceImpl;
import com.ecobazaar.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    // Customer endpoints
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        Long userId = getCurrentUserId();
        String shippingAddress = (String) orderData.get("shippingAddress");
        String paymentMethod = (String) orderData.get("paymentMethod");
        String notes = (String) orderData.get("notes");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) orderData.get("cartItems");
        
        // Extract eco-points redemption data
        Integer ecoPointsUsed = orderData.get("ecoPointsUsed") != null ? 
            Integer.valueOf(orderData.get("ecoPointsUsed").toString()) : 0;
        java.math.BigDecimal ecoPointsDiscount = orderData.get("ecoPointsDiscount") != null ? 
            new java.math.BigDecimal(orderData.get("ecoPointsDiscount").toString()) : java.math.BigDecimal.ZERO;
        Boolean isEcoBoost = orderData.get("isEcoBoost") != null ? 
            Boolean.valueOf(orderData.get("isEcoBoost").toString()) : false;
        
        try {
            Order order;
            if (cartItems != null && !cartItems.isEmpty()) {
                // Use cart items from frontend with eco-points data
                order = orderService.createOrderFromCartItems(userId, cartItems, shippingAddress, paymentMethod, notes, ecoPointsUsed, ecoPointsDiscount, isEcoBoost);
            } else {
                // Fallback to database cart
                order = orderService.createOrderFromCart(userId, shippingAddress, paymentMethod, notes);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            e.printStackTrace(); // Log the full error
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/customer")
    public ResponseEntity<List<Order>> getCustomerOrders() {
        Long userId = getCurrentUserId();
        List<Order> orders = orderService.getCustomerOrders(userId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Long userId = getCurrentUserId();
        try {
            Order order = orderService.getOrderById(orderId, userId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{orderId}/delivered")
    public ResponseEntity<Order> markAsDelivered(@PathVariable Long orderId) {
        Long userId = getCurrentUserId();
        try {
            Order order = orderService.markAsDelivered(orderId, userId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Seller endpoints
    @GetMapping("/seller")
    public ResponseEntity<List<Order>> getSellerOrders() {
        Long sellerId = getCurrentUserId();
        List<Order> orders = orderService.getSellerOrders(sellerId);
        return ResponseEntity.ok(orders);
    }
    
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<Order> confirmOrder(@PathVariable Long orderId) {
        Long sellerId = getCurrentUserId();
        try {
            Order order = orderService.confirmOrder(orderId, sellerId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<Order> markAsShipped(@PathVariable Long orderId, @RequestBody Map<String, String> shipData) {
        Long sellerId = getCurrentUserId();
        String trackingNumber = shipData.get("trackingNumber");
        
        try {
            Order order = orderService.markAsShipped(orderId, sellerId, trackingNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.getUserIdByUsername(username);
    }
}
