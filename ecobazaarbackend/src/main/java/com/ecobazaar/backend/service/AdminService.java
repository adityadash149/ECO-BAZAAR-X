package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.*;
import com.ecobazaar.backend.entity.*;
import com.ecobazaar.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ProductService productService;

    // Overview Dashboard Methods
    public AdminOverviewDto getAdminOverview() {
        Long totalUsers = userRepository.count();
        Long totalSellers = userRepository.countByRole(Role.SELLER);
        Long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        Long activeSellers = userRepository.countByRoleAndIsActiveTrue(Role.SELLER);
        Long totalProducts = productRepository.count();
        
        BigDecimal totalCarbonImpact = productRepository.sumTotalCarbonScore();
        if (totalCarbonImpact == null) totalCarbonImpact = BigDecimal.ZERO;
        
        // For pending applications, we'll count sellers who are not active as they need approval
        Long pendingApplications = userRepository.countByRole(Role.SELLER) - activeSellers;
        
        Long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        return new AdminOverviewDto(totalUsers, totalSellers, totalCustomers, activeSellers, 
                                   totalProducts, totalCarbonImpact, pendingApplications, 
                                   totalOrders, totalRevenue);
    }

    public List<RecentActivityDto> getRecentActivity() {
        List<RecentActivityDto> activities = new ArrayList<>();
        
        // Get recent user registrations
        List<User> recentSellers = userRepository.findByRoleOrderByCreatedAtDesc(Role.SELLER)
                                                .stream().limit(5).collect(Collectors.toList());
        for (User seller : recentSellers) {
            String status = seller.getIsActive() ? "APPROVED" : "PENDING";
            activities.add(new RecentActivityDto(
                "USER_REGISTRATION",
                "New seller \"" + seller.getFirstName() + " " + seller.getLastName() + "\" registered",
                status,
                seller.getCreatedAt(),
                seller.getId().toString(),
                "USER"
            ));
        }
        
        // Get recent products
        List<Product> recentProducts = productRepository.findAllOrderByCreatedAtDesc()
                                                       .stream().limit(5).collect(Collectors.toList());
        for (Product product : recentProducts) {
            String status = product.getIsActive() ? "APPROVED" : "PENDING";
            activities.add(new RecentActivityDto(
                "PRODUCT_ADDED",
                "Product \"" + product.getName() + "\" added by " + product.getSeller().getFirstName(),
                status,
                product.getCreatedAt(),
                product.getId().toString(),
                "PRODUCT"
            ));
        }
        
        // Get recent orders
        List<Order> recentOrders = orderRepository.findAllOrderByCreatedAtDesc()
                                                 .stream().limit(3).collect(Collectors.toList());
        for (Order order : recentOrders) {
            activities.add(new RecentActivityDto(
                "ORDER_PLACED",
                "Order placed by " + order.getUser().getFirstName() + " " + order.getUser().getLastName(),
                order.getStatus().toString(),
                order.getCreatedAt(),
                order.getId().toString(),
                "ORDER"
            ));
        }
        
        // Sort by timestamp descending and limit to 10
        return activities.stream()
                        .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                        .limit(10)
                        .collect(Collectors.toList());
    }

    // User Management Methods
    public List<UserManagementDto> getAllUsersWithStats() {
        List<User> users = userRepository.findAll();
        List<UserManagementDto> userDtos = new ArrayList<>();
        
        for (User user : users) {
            Long totalOrders = orderRepository.countOrdersByUserId(user.getId());
            BigDecimal totalSpent = orderRepository.sumTotalSpentByUserId(user.getId());
            if (totalSpent == null) totalSpent = BigDecimal.ZERO;
            
            userDtos.add(new UserManagementDto(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole(),
                user.getEcoPoints(), user.getIsActive(), user.getCreatedAt(),
                user.getUpdatedAt(), totalOrders, totalSpent
            ));
        }
        
        return userDtos;
    }

    public List<UserManagementDto> getUsersByRole(Role role) {
        List<User> users = userRepository.findByRole(role);
        List<UserManagementDto> userDtos = new ArrayList<>();
        
        for (User user : users) {
            Long totalOrders = orderRepository.countOrdersByUserId(user.getId());
            BigDecimal totalSpent = orderRepository.sumTotalSpentByUserId(user.getId());
            if (totalSpent == null) totalSpent = BigDecimal.ZERO;
            
            userDtos.add(new UserManagementDto(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole(),
                user.getEcoPoints(), user.getIsActive(), user.getCreatedAt(),
                user.getUpdatedAt(), totalOrders, totalSpent
            ));
        }
        
        return userDtos;
    }

    public void updateUserStatus(Long userId, Boolean isActive) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(isActive);
            userRepository.save(user);
            
            // Send notification to user
            String title = isActive ? "Account Activated" : "Account Deactivated";
            String message = isActive ? 
                "Your account has been activated. You can now access all features." :
                "Your account has been deactivated. Please contact support for assistance.";
            notificationService.createNotification(user, title, message, "ACCOUNT_STATUS");
        }
    }

    public void updateUserRole(Long userId, Role role) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(role);
            userRepository.save(user);
            
            // Send notification to user
            String title = "Role Updated";
            String message = "Your account role has been updated to " + role.toString() + ".";
            notificationService.createNotification(user, title, message, "ROLE_UPDATE");
        }
    }

    // Seller Management Methods
    public List<SellerWithStatsDto> getAllSellersWithStats() {
        List<User> sellers = userRepository.findByRole(Role.SELLER);
        List<SellerWithStatsDto> sellerDtos = new ArrayList<>();
        
        for (User seller : sellers) {
            Long totalProducts = productRepository.countBySellerId(seller.getId());
            Long activeProducts = productRepository.countBySellerIdAndIsActiveTrue(seller.getId());
            BigDecimal totalRevenue = orderRepository.sumTotalAmountBySellerId(seller.getId());
            Long totalOrders = orderRepository.countBySellerId(seller.getId());
            if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
            
            sellerDtos.add(new SellerWithStatsDto(
                seller.getId(), seller.getUsername(), seller.getEmail(),
                seller.getFirstName(), seller.getLastName(), seller.getIsActive(),
                seller.getCreatedAt(), totalProducts, activeProducts,
                totalRevenue, totalOrders, BigDecimal.valueOf(4.5) // Default rating
            ));
        }
        
        return sellerDtos;
    }

    public void approveSeller(Long sellerId, String adminNotes) {
        Optional<User> sellerOpt = userRepository.findById(sellerId);
        if (sellerOpt.isPresent()) {
            User seller = sellerOpt.get();
            seller.setIsActive(true);
            userRepository.save(seller);
            
            // Send approval notification
            String title = "Seller Application Approved!";
            String message = "Congratulations! Your seller application has been approved. " +
                           "You can now start adding products and begin your business. " +
                           "All the best for your eco-friendly journey!";
            notificationService.createNotification(seller, title, message, "SELLER_APPROVAL");
        }
    }

    public void rejectSeller(Long sellerId, String adminNotes) {
        Optional<User> sellerOpt = userRepository.findById(sellerId);
        if (sellerOpt.isPresent()) {
            User seller = sellerOpt.get();
            seller.setIsActive(false);
            userRepository.save(seller);
            
            // Send rejection notification
            String title = "Seller Application Update";
            String message = "Your seller application requires additional review. " +
                           "Reason: " + adminNotes + ". Please contact support for more information.";
            notificationService.createNotification(seller, title, message, "SELLER_REJECTION");
        }
    }

    public void blockSeller(Long sellerId, String reason) {
        Optional<User> sellerOpt = userRepository.findById(sellerId);
        if (sellerOpt.isPresent()) {
            User seller = sellerOpt.get();
            seller.setIsActive(false);
            userRepository.save(seller);
            
            // Send blocking notification
            String title = "Account Blocked";
            String message = "Your seller account has been blocked. Reason: " + reason + 
                           ". Please contact support for assistance.";
            notificationService.createNotification(seller, title, message, "ACCOUNT_BLOCKED");
        }
    }

    // Product Oversight Methods
    public List<ProductDto> getAllProductsWithSellerInfo() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::convertToProductDto).collect(Collectors.toList());
    }

    public List<ProductDto> getProductsBySeller(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream().map(this::convertToProductDto).collect(Collectors.toList());
    }

    public void removeProduct(Long productId, String reason) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            
            // Send notification to seller before deletion
            String title = "Product Removed";
            String message = "Your product '" + product.getName() + "' has been permanently removed from the platform. Reason: " + reason;
            notificationService.createNotification(product.getSeller(), title, message, "PRODUCT_REMOVAL");
            
            // Delete the product and all related records
            productService.deleteProduct(productId);
        }
    }

    public void updateProductStatus(Long productId, Boolean isActive) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(isActive);
            productRepository.save(product);
            
            // Send notification to seller
            String title = isActive ? "Product Approved" : "Product Suspended";
            String message = isActive ? 
                "Your product '" + product.getName() + "' has been approved and is now live." :
                "Your product '" + product.getName() + "' has been suspended for review.";
            notificationService.createNotification(product.getSeller(), title, message, "PRODUCT_STATUS");
        }
    }

    public void approveProduct(Long productId, String adminNotes) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(true);
            productRepository.save(product);
            
            // Send approval notification
            String title = "Product Approved!";
            String message = "Great news! Your product '" + product.getName() + 
                           "' has been approved and is now live on the marketplace. " +
                           (adminNotes != null ? "Admin notes: " + adminNotes : "");
            notificationService.createNotification(product.getSeller(), title, message, "PRODUCT_APPROVAL");
        }
    }

    public void rejectProduct(Long productId, String reason) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(false);
            productRepository.save(product);
            
            // Send rejection notification
            String title = "Product Needs Review";
            String message = "Your product '" + product.getName() + 
                           "' requires review before it can be approved. Reason: " + reason +
                           ". Please update your product and resubmit.";
            notificationService.createNotification(product.getSeller(), title, message, "PRODUCT_REJECTION");
        }
    }

    public void updateProductEcoData(Long productId, BigDecimal carbonScore, Boolean isEcoFriendly, String adminNotes) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            
            // Store old values for comparison
            BigDecimal oldCarbonScore = product.getCarbonScore();
            Boolean oldEcoFriendly = product.getIsEcoFriendly();
            
            // Update the product
            product.setCarbonScore(carbonScore);
            product.setIsEcoFriendly(isEcoFriendly);
            productRepository.save(product);
            
            // Send notification to seller about the changes
            String title = "Product Updated by Admin";
            StringBuilder messageBuilder = new StringBuilder();
            messageBuilder.append("Your product '").append(product.getName()).append("' has been updated by admin:\n");
            
            if (!carbonScore.equals(oldCarbonScore)) {
                messageBuilder.append("• Carbon Score: ").append(oldCarbonScore).append(" → ").append(carbonScore).append("\n");
            }
            
            if (!isEcoFriendly.equals(oldEcoFriendly)) {
                String ecoStatus = isEcoFriendly ? "Eco-Friendly" : "Not Eco-Friendly";
                messageBuilder.append("• Eco-Friendly Status: ").append(ecoStatus).append("\n");
            }
            
            if (adminNotes != null && !adminNotes.trim().isEmpty()) {
                messageBuilder.append("• Admin Notes: ").append(adminNotes);
            }
            
            notificationService.createNotification(product.getSeller(), title, messageBuilder.toString(), "PRODUCT_UPDATE");
        }
    }

    // Customer Monitoring Methods
    public List<CustomerOrderDto> getAllCustomerOrders() {
        List<Order> orders = orderRepository.findAllOrderByCreatedAtDesc();
        return orders.stream().map(this::convertToCustomerOrderDto).collect(Collectors.toList());
    }

    public List<CustomerOrderDto> getCustomerOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream().map(this::convertToCustomerOrderDto).collect(Collectors.toList());
    }

    // Category Management Methods
    public List<CategoryWithCountDto> getAllCategoriesWithCount() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryWithCountDto> categoryDtos = new ArrayList<>();
        
        for (Category category : categories) {
            Long productCount = productRepository.countByCategoryId(category.getId());
            categoryDtos.add(new CategoryWithCountDto(
                category.getId(), category.getName(), category.getDescription(),
                category.getIsActive(), category.getCreatedAt(), productCount
            ));
        }
        
        return categoryDtos;
    }

    public Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIsActive(true);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long categoryId, String name, String description, Boolean isActive) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            category.setName(name);
            category.setDescription(description);
            category.setIsActive(isActive);
            return categoryRepository.save(category);
        }
        return null;
    }

    public void deleteCategory(Long categoryId) {
        // Check if category has products
        Long productCount = productRepository.countByCategoryId(categoryId);
        if (productCount == 0) {
            categoryRepository.deleteById(categoryId);
        } else {
            throw new RuntimeException("Cannot delete category with existing products. " +
                                     "Please move or remove all products first.");
        }
    }

    // Helper Methods
    private ProductDto convertToProductDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());

        Category category = product.getCategory();
        if (category != null) {
            dto.setCategoryId(category.getId());
            dto.setCategoryName(category.getName());
        }

        User seller = product.getSeller();
        if (seller != null) {
            dto.setSellerId(seller.getId());
            String firstName = seller.getFirstName() != null ? seller.getFirstName() : "";
            String lastName = seller.getLastName() != null ? seller.getLastName() : "";
            dto.setSellerName((firstName + " " + lastName).trim());
        }

        dto.setWeightKg(product.getWeightKg());
        dto.setShippingDistanceKm(product.getShippingDistanceKm());
        dto.setCarbonScore(product.getCarbonScore());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsEcoFriendly(product.getIsEcoFriendly());
        dto.setIsActive(product.getIsActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }

    private CustomerOrderDto convertToCustomerOrderDto(Order order) {
        CustomerOrderDto dto = new CustomerOrderDto();
        dto.setOrderId(order.getId());
        dto.setCustomerId(order.getUser().getId());
        dto.setCustomerName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        dto.setCustomerEmail(order.getUser().getEmail());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setTotalCarbonScore(order.getTotalCarbonScore());
        dto.setStatus(order.getStatus());
        dto.setOrderDate(order.getCreatedAt());
        dto.setShippingAddress(order.getShippingAddress());
        
        // Convert order items if needed
        if (order.getOrderItems() != null) {
            List<OrderItemDetailDto> itemDtos = order.getOrderItems().stream()
                .map(this::convertToOrderItemDetailDto)
                .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }
        
        return dto;
    }

    private OrderItemDetailDto convertToOrderItemDetailDto(OrderItem orderItem) {
        OrderItemDetailDto dto = new OrderItemDetailDto();
        Product p = orderItem.getProduct();
        if (p != null) {
            dto.setProductName(p.getName());
            Category c = p.getCategory();
            if (c != null) {
                dto.setCategoryName(c.getName());
            }
            User s = p.getSeller();
            if (s != null) {
                String firstName = s.getFirstName() != null ? s.getFirstName() : "";
                String lastName = s.getLastName() != null ? s.getLastName() : "";
                dto.setSellerName((firstName + " " + lastName).trim());
            }
            dto.setImageUrl(p.getImageUrl());
        }

        Integer qty = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
        BigDecimal price = orderItem.getPrice() != null ? orderItem.getPrice() : BigDecimal.ZERO;
        dto.setQuantity(qty);
        dto.setPrice(price);
        dto.setTotalPrice(price.multiply(BigDecimal.valueOf(qty)));
        return dto;
    }
}
