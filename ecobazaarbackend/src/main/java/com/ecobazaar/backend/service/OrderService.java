package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.*;
import com.ecobazaar.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CustomerProfileRepository customerProfileRepository;
    
    @Autowired(required = false)
    private EmailService emailService;
    
    public Order createOrderFromCart(Long userId, String shippingAddress, String paymentMethod, String notes) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setNotes(notes);
        order.setStatus(OrderStatus.PENDING);
        // Ensure NOT NULL columns have initial values before first save
        order.setTotalPrice(BigDecimal.ZERO);
        order.setTotalCarbonScore(BigDecimal.ZERO);
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal totalCarbonScore = BigDecimal.ZERO;
        
        // Save order first to get ID (safe because totals are initialized)
        order = orderRepository.save(order);
        
        // Create order items from cart
        for (Cart cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItem.setCarbonScore(cartItem.getProduct().getCarbonScore());
            
            // Save each order item
            orderItemRepository.save(orderItem);
            
            BigDecimal itemTotal = cartItem.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
            
            BigDecimal itemCarbonScore = cartItem.getProduct().getCarbonScore()
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalCarbonScore = totalCarbonScore.add(itemCarbonScore);
        }
        
        order.setTotalPrice(totalPrice);
        order.setTotalCarbonScore(totalCarbonScore);
        
        // Clear cart after order creation
        cartRepository.deleteAll(cartItems);
        
        Order savedOrder = orderRepository.save(order);
        
        // Send order confirmation email
        if (emailService != null) {
            try {
                emailService.sendOrderConfirmationEmail(savedOrder);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
                // Don't fail order creation if email fails
            }
        }
        
        return savedOrder;
    }
    
    public Order confirmOrder(Long orderId, Long sellerId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify that the seller owns at least one product in this order
        boolean hasSellerProduct = order.getOrderItems().stream()
            .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId));
        
        if (!hasSellerProduct) {
            throw new RuntimeException("You are not authorized to confirm this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order cannot be confirmed in current status");
        }
        
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
    
    public Order markAsShipped(Long orderId, Long sellerId, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify that the seller owns at least one product in this order
        boolean hasSellerProduct = order.getOrderItems().stream()
            .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId));
        
        if (!hasSellerProduct) {
            throw new RuntimeException("You are not authorized to ship this order");
        }
        
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order must be confirmed before shipping");
        }
        
        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(LocalDateTime.now());
        order.setTrackingNumber(trackingNumber != null ? trackingNumber : generateTrackingNumber());
        
        // Update product quantities
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            int newStock = product.getStockQuantity() - item.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            product.setStockQuantity(newStock);
            productRepository.save(product);
        }
        
        return orderRepository.save(order);
    }
    
    public Order markAsDelivered(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to update this order");
        }
        
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("Order must be shipped before marking as delivered");
        }
        
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        
        // Award eco points to customer based on carbon score
        User user = order.getUser();
        int ecoPointsEarned = order.getTotalCarbonScore().intValue();
        user.setEcoPoints(user.getEcoPoints() + ecoPointsEarned);
        userRepository.save(user);
        
        return orderRepository.save(order);
    }
    
    public List<Order> getCustomerOrders(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<Order> getSellerOrders(Long sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }
    
    public Order getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if user is the customer or seller
        boolean isCustomer = order.getUser().getId().equals(userId);
        boolean isSeller = order.getOrderItems().stream()
            .anyMatch(item -> item.getProduct().getSeller().getId().equals(userId));
        
        if (!isCustomer && !isSeller) {
            throw new RuntimeException("You are not authorized to view this order");
        }
        
        return order;
    }
    
    public Order createOrderFromCartItems(Long userId, List<Map<String, Object>> cartItems, String shippingAddress, String paymentMethod, String notes, Integer ecoPointsUsed, BigDecimal ecoPointsDiscount, Boolean isEcoBoost) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setNotes(notes);
        order.setStatus(OrderStatus.PENDING);
        // Ensure NOT NULL columns have initial values before first save
        order.setTotalPrice(BigDecimal.ZERO);
        order.setTotalCarbonScore(BigDecimal.ZERO);
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal totalCarbonScore = BigDecimal.ZERO;
        
        // Save order first to get ID (safe because totals are initialized)
        order = orderRepository.save(order);
        
        // Create order items from cart data
        for (Map<String, Object> cartItem : cartItems) {
            if (cartItem.get("productId") == null) {
                throw new RuntimeException("Product ID is missing in cart item");
            }
            if (cartItem.get("quantity") == null) {
                throw new RuntimeException("Quantity is missing in cart item");
            }
            
            Long productId = Long.valueOf(cartItem.get("productId").toString());
            Integer quantity = Integer.valueOf(cartItem.get("quantity").toString());
            
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(product.getPrice());
            orderItem.setCarbonScore(product.getCarbonScore());
            
            // Save each order item
            orderItemRepository.save(orderItem);
            
            BigDecimal itemTotal = product.getPrice()
                .multiply(BigDecimal.valueOf(quantity));
            totalPrice = totalPrice.add(itemTotal);
            
            BigDecimal itemCarbonScore = product.getCarbonScore()
                .multiply(BigDecimal.valueOf(quantity));
            totalCarbonScore = totalCarbonScore.add(itemCarbonScore);
        }
        
        order.setTotalPrice(totalPrice);
        order.setTotalCarbonScore(totalCarbonScore);
        
        // Save order with eco-points data
        Order savedOrder = orderRepository.save(order);
        
        // Deduct eco-points from customer profile if used
        if (ecoPointsUsed != null && ecoPointsUsed > 0) {
            deductEcoPoints(userId, ecoPointsUsed);
        }
        
        // Send order confirmation email
        if (emailService != null) {
            try {
                emailService.sendOrderConfirmationEmail(savedOrder);
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
                // Don't fail order creation if email fails
            }
        }
        
        return savedOrder;
    }
    
    private String generateTrackingNumber() {
        return "EB" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private void deductEcoPoints(Long userId, Integer pointsToDeduct) {
        try {
            CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Customer profile not found"));
            
            int currentPoints = profile.getEcoPoints() != null ? profile.getEcoPoints() : 0;
            int newPoints = Math.max(0, currentPoints - pointsToDeduct); // Ensure points don't go negative
            
            profile.setEcoPoints(newPoints);
            customerProfileRepository.save(profile);
            
            System.out.println("=== ECO POINTS DEDUCTED ===");
            System.out.println("User ID: " + userId);
            System.out.println("Points deducted: " + pointsToDeduct);
            System.out.println("Previous points: " + currentPoints);
            System.out.println("New total points: " + newPoints);
            System.out.println("=========================");
            
        } catch (Exception e) {
            System.out.println("ERROR deducting eco-points: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception to avoid breaking order creation
        }
    }
}