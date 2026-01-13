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

    // --- Overview Dashboard Methods ---
    public AdminOverviewDto getAdminOverview() {
        Long totalUsers = userRepository.count();
        Long totalSellers = userRepository.countByRole(Role.SELLER);
        Long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        Long activeSellers = userRepository.countByRoleAndIsActiveTrue(Role.SELLER);
        Long totalProducts = productRepository.count();

        BigDecimal totalCarbonImpact = productRepository.sumTotalCarbonScore();
        if (totalCarbonImpact == null) totalCarbonImpact = BigDecimal.ZERO;

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

        return activities.stream()
                        .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                        .limit(10)
                        .collect(Collectors.toList());
    }

    // --- User Management Methods ---
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

    // --- Pending Admins & Approvals ---
    public List<User> getPendingAdmins() {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        return admins.stream()
                .filter(u -> !u.getIsActive())
                .collect(Collectors.toList());
    }

    public void approveAdmin(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(true);
            userRepository.save(user);
            notificationService.createNotification(user, "Admin Access Approved",
                "Your request for Admin access has been approved.", "ACCESS_APPROVED");
        }
    }

    public void rejectUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(false);
            userRepository.save(user);
            notificationService.createNotification(user, "Account Status Update",
                "Your account request was rejected or access revoked.", "ACCOUNT_REJECTED");
        }
    }

    public void updateUserStatus(Long userId, Boolean isActive) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(isActive);
            userRepository.save(user);

            String title = isActive ? "Account Activated" : "Account Deactivated";
            String message = isActive ?
                "Your account has been activated." :
                "Your account has been deactivated. Contact support.";
            notificationService.createNotification(user, title, message, "ACCOUNT_STATUS");
        }
    }

    public void updateUserRole(Long userId, Role role) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(role);
            userRepository.save(user);
            notificationService.createNotification(user, "Role Updated",
                "Your account role is now " + role, "ROLE_UPDATE");
        }
    }

    // --- Seller Management ---
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
                totalRevenue, totalOrders, BigDecimal.valueOf(4.5)
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
            notificationService.createNotification(seller, "Seller Approved",
                "Your seller account is approved!", "SELLER_APPROVAL");
        }
    }

    public void rejectSeller(Long sellerId, String adminNotes) {
        Optional<User> sellerOpt = userRepository.findById(sellerId);
        if (sellerOpt.isPresent()) {
            User seller = sellerOpt.get();
            seller.setIsActive(false);
            userRepository.save(seller);
            notificationService.createNotification(seller, "Seller Application Rejected",
                "Reason: " + adminNotes, "SELLER_REJECTION");
        }
    }

    public void blockSeller(Long sellerId, String reason) {
        Optional<User> sellerOpt = userRepository.findById(sellerId);
        if (sellerOpt.isPresent()) {
            User seller = sellerOpt.get();
            seller.setIsActive(false);
            userRepository.save(seller);
            notificationService.createNotification(seller, "Account Blocked",
                "Reason: " + reason, "ACCOUNT_BLOCKED");
        }
    }

    // --- Product Oversight ---
    public List<ProductDto> getAllProductsWithSellerInfo() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::convertToProductDto).collect(Collectors.toList());
    }

    public List<ProductDto> getProductsBySeller(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream().map(this::convertToProductDto).collect(Collectors.toList());
    }

    public List<ProductDto> getPendingProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsActive()))
                .map(this::convertToProductDto)
                .collect(Collectors.toList());
    }

    public void removeProduct(Long productId, String reason) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            notificationService.createNotification(product.getSeller(), "Product Removed",
                "Your product '" + product.getName() + "' was removed. Reason: " + reason, "PRODUCT_REMOVAL");
            productService.deleteProduct(productId);
        }
    }

    public void updateProductStatus(Long productId, Boolean isActive) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(isActive);
            productRepository.save(product);

            String status = isActive ? "Approved" : "Suspended";
            notificationService.createNotification(product.getSeller(), "Product " + status,
                "Product: " + product.getName(), "PRODUCT_STATUS");
        }
    }

    public void approveProduct(Long productId, String adminNotes) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(true);
            productRepository.save(product);
            notificationService.createNotification(product.getSeller(), "Product Approved",
                "Your product '" + product.getName() + "' is live.", "PRODUCT_APPROVAL");
        }
    }

    public void rejectProduct(Long productId, String reason) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(false);
            productRepository.save(product);
            notificationService.createNotification(product.getSeller(), "Product Rejected",
                "Reason: " + reason, "PRODUCT_REJECTION");
        }
    }

    public void updateProductEcoData(Long productId, BigDecimal carbonScore, Boolean isEcoFriendly, String adminNotes) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setCarbonScore(carbonScore);
            product.setIsEcoFriendly(isEcoFriendly);
            productRepository.save(product);
            notificationService.createNotification(product.getSeller(), "Product Updated",
                "Admin updated eco-data for '" + product.getName() + "'", "PRODUCT_UPDATE");
        }
    }

    // --- Customer Monitoring ---
    public List<CustomerOrderDto> getAllCustomerOrders() {
        List<Order> orders = orderRepository.findAllOrderByCreatedAtDesc();
        return orders.stream().map(this::convertToCustomerOrderDto).collect(Collectors.toList());
    }

    public List<CustomerOrderDto> getCustomerOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream().map(this::convertToCustomerOrderDto).collect(Collectors.toList());
    }

    // --- Category Management ---
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
        Long productCount = productRepository.countByCategoryId(categoryId);
        if (productCount == 0) {
            categoryRepository.deleteById(categoryId);
        } else {
            throw new RuntimeException("Cannot delete category with products.");
        }
    }

    // --- HELPER METHODS ---
    private ProductDto convertToProductDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());

        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        if (product.getSeller() != null) {
            dto.setSellerId(product.getSeller().getId());
            String fName = product.getSeller().getFirstName() == null ? "" : product.getSeller().getFirstName();
            String lName = product.getSeller().getLastName() == null ? "" : product.getSeller().getLastName();
            dto.setSellerName((fName + " " + lName).trim());
        }

        dto.setWeightKg(product.getWeightKg());
        dto.setShippingDistanceKm(product.getShippingDistanceKm());
        dto.setCarbonScore(product.getCarbonScore());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setEcoPoints(product.getEcoPoints());
        dto.setCarbonReduction(product.getCarbonReduction());
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
            if (p.getCategory() != null) dto.setCategoryName(p.getCategory().getName());
            if (p.getSeller() != null) {
                 String f = p.getSeller().getFirstName();
                 String l = p.getSeller().getLastName();
                 dto.setSellerName(f + " " + l);
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
