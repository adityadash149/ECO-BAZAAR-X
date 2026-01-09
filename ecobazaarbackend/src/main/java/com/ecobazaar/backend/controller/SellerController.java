package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.DashboardStatsDto;
import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.Profile;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.service.OrderService;
import com.ecobazaar.backend.service.ProductService;
import com.ecobazaar.backend.service.ProfileService;
import com.ecobazaar.backend.service.SellerService;
import com.ecobazaar.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProfileService profileService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        DashboardStatsDto stats = sellerService.getDashboardStats(seller.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getSellerProducts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        List<Product> products = productService.getProductsBySeller(seller.getId());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<Product> addProduct(@RequestParam("name") String name,
                                              @RequestParam("description") String description,
                                              @RequestParam("price") String price,
                                              @RequestParam("categoryId") String categoryId,
                                              @RequestParam("stockQuantity") String stockQuantity,
                                              @RequestParam("weight") String weight,
                                              @RequestParam("shippingDistance") String shippingDistance,
                                              @RequestParam("carbonFootprintScore") String carbonFootprintScore,
                                              @RequestParam("ecoFriendly") String ecoFriendly,
                                              @RequestParam(value = "image", required = false) MultipartFile image,
                                              @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User seller = userService.findByUsername(username);
            
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(new java.math.BigDecimal(price));
            product.setStockQuantity(Integer.parseInt(stockQuantity));
            product.setWeightKg(new java.math.BigDecimal(weight));
            product.setShippingDistanceKm(new java.math.BigDecimal(shippingDistance));
            product.setCarbonScore(new java.math.BigDecimal(carbonFootprintScore));
            product.setIsEcoFriendly(Boolean.parseBoolean(ecoFriendly));
            
            // Handle category
            if (categoryId != null && !categoryId.isEmpty()) {
                com.ecobazaar.backend.entity.Category category = new com.ecobazaar.backend.entity.Category();
                category.setId(Long.parseLong(categoryId));
                product.setCategory(category);
            }
            
            // Handle image upload or URL
            if (image != null && !image.isEmpty()) {
                // Handle file upload
                String uploadedImageUrl = saveUploadedFile(image);
                product.setImageUrl(uploadedImageUrl);
            } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                // Handle URL
                product.setImageUrl(imageUrl.trim());
            }
            
            Product newProduct = productService.createProduct(product, seller.getId());
            return ResponseEntity.ok(newProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    private String saveUploadedFile(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        String uploadDir = "uploads/images";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be null or empty");
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = Paths.get(uploadDir, filename);
        Files.copy(file.getInputStream(), filePath);
        
        // Return URL path
        return "/uploads/images/" + filename;
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestParam("name") String name,
                                                 @RequestParam("description") String description,
                                                 @RequestParam("price") String price,
                                                 @RequestParam("categoryId") String categoryId,
                                                 @RequestParam("stockQuantity") String stockQuantity,
                                                 @RequestParam("weight") String weight,
                                                 @RequestParam("shippingDistance") String shippingDistance,
                                                 @RequestParam("carbonFootprintScore") String carbonFootprintScore,
                                                 @RequestParam("ecoFriendly") String ecoFriendly,
                                                 @RequestParam(value = "image", required = false) MultipartFile image,
                                                 @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        try {
            System.out.println("=== UPDATE PRODUCT DEBUG ===");
            System.out.println("Product ID: " + id);
            System.out.println("Image file: " + (image != null ? image.getOriginalFilename() : "null"));
            System.out.println("Image URL: " + imageUrl);
            System.out.println("=============================");
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User seller = userService.findByUsername(username);
            
            // Verify the product belongs to the seller
            Product existingProduct = productService.getProductById(id);
            if (!existingProduct.getSeller().getId().equals(seller.getId())) {
                return ResponseEntity.badRequest().build();
            }
            
            // Update product details
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(new java.math.BigDecimal(price));
            existingProduct.setStockQuantity(Integer.parseInt(stockQuantity));
            existingProduct.setWeightKg(new java.math.BigDecimal(weight));
            existingProduct.setShippingDistanceKm(new java.math.BigDecimal(shippingDistance));
            existingProduct.setCarbonScore(new java.math.BigDecimal(carbonFootprintScore));
            existingProduct.setIsEcoFriendly(Boolean.parseBoolean(ecoFriendly));
            
            // Handle category
            if (categoryId != null && !categoryId.isEmpty()) {
                com.ecobazaar.backend.entity.Category category = new com.ecobazaar.backend.entity.Category();
                category.setId(Long.parseLong(categoryId));
                existingProduct.setCategory(category);
            }
            
            // Handle image upload or URL update
            if (image != null && !image.isEmpty()) {
                // Handle file upload
                System.out.println("Handling file upload: " + image.getOriginalFilename());
                String uploadedImageUrl = saveUploadedFile(image);
                existingProduct.setImageUrl(uploadedImageUrl);
                System.out.println("Saved file with URL: " + uploadedImageUrl);
            } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                // Handle URL update
                System.out.println("Handling URL update: " + imageUrl.trim());
                existingProduct.setImageUrl(imageUrl.trim());
                System.out.println("Updated image URL to: " + imageUrl.trim());
            } else {
                System.out.println("No image update provided");
            }
            
            Product updatedProduct = productService.updateProduct(id, existingProduct);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        // Verify the product belongs to the seller
        Product existingProduct = productService.getProductById(id);
        if (!existingProduct.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.badRequest().build();
        }
        
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getSellerOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        List<Order> orders = orderService.getSellerOrders(seller.getId());
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/confirm")
    public ResponseEntity<Order> confirmOrder(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        Order order = orderService.confirmOrder(id, seller.getId());
        return ResponseEntity.ok(order);
    }

    @PutMapping("/orders/{id}/ship")
    public ResponseEntity<Order> markAsShipped(@PathVariable Long id, @RequestParam(required = false) String trackingNumber) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        Order order = orderService.markAsShipped(id, seller.getId(), trackingNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/profile")
    public ResponseEntity<Profile> getSellerProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        Profile profile = profileService.getProfileByUserId(seller.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Profile> updateSellerProfile(@RequestBody Profile profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User seller = userService.findByUsername(username);
        
        Profile updatedProfile = profileService.updateProfile(seller.getId(), profileData);
        return ResponseEntity.ok(updatedProfile);
    }
}
