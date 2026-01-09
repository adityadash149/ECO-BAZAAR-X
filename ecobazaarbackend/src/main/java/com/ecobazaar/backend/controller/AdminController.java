package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.*;
import com.ecobazaar.backend.entity.Category;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.service.AdminService;
import com.ecobazaar.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private NotificationService notificationService;

    // Overview Dashboard Endpoints
    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewDto> getAdminOverview() {
        AdminOverviewDto overview = adminService.getAdminOverview();
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<RecentActivityDto>> getRecentActivity() {
        List<RecentActivityDto> activities = adminService.getRecentActivity();
        return ResponseEntity.ok(activities);
    }

    // User Management Endpoints
    @GetMapping("/users")
    public ResponseEntity<List<UserManagementDto>> getAllUsers() {
        List<UserManagementDto> users = adminService.getAllUsersWithStats();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserManagementDto>> getUsersByRole(@PathVariable String role) {
        Role userRole = Role.valueOf(role.toUpperCase());
        List<UserManagementDto> users = adminService.getUsersByRole(userRole);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<String> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Boolean> request) {
        Boolean isActive = request.get("isActive");
        adminService.updateUserStatus(userId, isActive);
        return ResponseEntity.ok("User status updated successfully");
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<String> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String roleString = request.get("role");
        Role role = Role.valueOf(roleString.toUpperCase());
        adminService.updateUserRole(userId, role);
        return ResponseEntity.ok("User role updated successfully");
    }

    // Seller Management Endpoints
    @GetMapping("/sellers")
    public ResponseEntity<List<SellerWithStatsDto>> getAllSellers() {
        List<SellerWithStatsDto> sellers = adminService.getAllSellersWithStats();
        return ResponseEntity.ok(sellers);
    }

    @PutMapping("/sellers/{sellerId}/approve")
    public ResponseEntity<String> approveSeller(@PathVariable Long sellerId, @RequestBody Map<String, String> request) {
        String adminNotes = request.get("adminNotes");
        adminService.approveSeller(sellerId, adminNotes);
        return ResponseEntity.ok("Seller approved successfully");
    }

    @PutMapping("/sellers/{sellerId}/reject")
    public ResponseEntity<String> rejectSeller(@PathVariable Long sellerId, @RequestBody Map<String, String> request) {
        String adminNotes = request.get("adminNotes");
        adminService.rejectSeller(sellerId, adminNotes);
        return ResponseEntity.ok("Seller rejected successfully");
    }

    @PutMapping("/sellers/{sellerId}/block")
    public ResponseEntity<String> blockSeller(@PathVariable Long sellerId, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        adminService.blockSeller(sellerId, reason != null ? reason : "Policy violation");
        return ResponseEntity.ok("Seller blocked successfully");
    }

    // Product Oversight Endpoints
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<ProductDto> products = adminService.getAllProductsWithSellerInfo();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/seller/{sellerId}")
    public ResponseEntity<List<ProductDto>> getProductsBySeller(@PathVariable Long sellerId) {
        List<ProductDto> products = adminService.getProductsBySeller(sellerId);
        return ResponseEntity.ok(products);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<String> removeProduct(@PathVariable Long productId, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        adminService.removeProduct(productId, reason);
        return ResponseEntity.ok("Product removed successfully");
    }

    @PutMapping("/products/{productId}/status")
    public ResponseEntity<String> updateProductStatus(@PathVariable Long productId, @RequestBody Map<String, Boolean> request) {
        Boolean isActive = request.get("isActive");
        adminService.updateProductStatus(productId, isActive);
        return ResponseEntity.ok("Product status updated successfully");
    }

    @PutMapping("/products/{productId}/approve")
    public ResponseEntity<String> approveProduct(@PathVariable Long productId, @RequestBody Map<String, String> request) {
        String adminNotes = request.get("adminNotes");
        adminService.approveProduct(productId, adminNotes);
        return ResponseEntity.ok("Product approved successfully");
    }

    @PutMapping("/products/{productId}/reject")
    public ResponseEntity<String> rejectProduct(@PathVariable Long productId, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        adminService.rejectProduct(productId, reason != null ? reason : "Does not meet quality standards");
        return ResponseEntity.ok("Product rejected successfully");
    }

    // Admin Product Management - Update Carbon Score and Eco-Friendly Status
    @PutMapping("/products/{productId}/update-eco-data")
    public ResponseEntity<String> updateProductEcoData(@PathVariable Long productId, @RequestBody Map<String, Object> request) {
        BigDecimal carbonScore = new BigDecimal(request.get("carbonScore").toString());
        Boolean isEcoFriendly = Boolean.valueOf(request.get("isEcoFriendly").toString());
        String adminNotes = request.get("adminNotes") != null ? request.get("adminNotes").toString() : "";
        
        adminService.updateProductEcoData(productId, carbonScore, isEcoFriendly, adminNotes);
        return ResponseEntity.ok("Product eco-data updated successfully");
    }

    // Customer Monitoring Endpoints
    @GetMapping("/customers/orders")
    public ResponseEntity<List<CustomerOrderDto>> getAllCustomerOrders() {
        List<CustomerOrderDto> orders = adminService.getAllCustomerOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/customers/{userId}/orders")
    public ResponseEntity<List<CustomerOrderDto>> getCustomerOrders(@PathVariable Long userId) {
        List<CustomerOrderDto> orders = adminService.getCustomerOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // Category Management Endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryWithCountDto>> getAllCategories() {
        List<CategoryWithCountDto> categories = adminService.getAllCategoriesWithCount();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        Category category = adminService.createCategory(name, description);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long categoryId, @RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        Boolean isActive = (Boolean) request.get("isActive");
        Category category = adminService.updateCategory(categoryId, name, description, isActive);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {
        try {
            adminService.deleteCategory(categoryId);
            return ResponseEntity.ok("Category deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Notification Endpoints
    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/{userId}/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/{userId}/count")
    public ResponseEntity<Long> getUnreadNotificationCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadNotificationCount(userId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/notifications/{userId}/read-all")
    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }
}
