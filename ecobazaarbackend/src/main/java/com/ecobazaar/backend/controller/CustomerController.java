package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.CustomerProfileUpdateDto;
import com.ecobazaar.backend.dto.WishlistDto;
import com.ecobazaar.backend.entity.CustomerProfile;
import com.ecobazaar.backend.security.UserDetailsServiceImpl;
import com.ecobazaar.backend.service.CustomerProfileService;
import com.ecobazaar.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerController {
    
    @Autowired
    private CustomerProfileService customerProfileService;
    
    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    // Profile endpoints
    @GetMapping("/profile")
    public ResponseEntity<CustomerProfile> getProfile() {
        Long userId = getCurrentUserId();
        CustomerProfile profile = customerProfileService.getCustomerProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<CustomerProfile> updateProfile(@RequestBody CustomerProfileUpdateDto profileDto) {
        Long userId = getCurrentUserId();
        CustomerProfile updatedProfile = customerProfileService.updateCustomerProfile(userId, profileDto);
        return ResponseEntity.ok(updatedProfile);
    }
    
    // Wishlist endpoints
    @GetMapping("/wishlist")
    public ResponseEntity<List<WishlistDto>> getWishlist() {
        Long userId = getCurrentUserId();
        List<WishlistDto> wishlist = wishlistService.getUserWishlist(userId);
        return ResponseEntity.ok(wishlist);
    }
    
    @PostMapping("/wishlist")
    public ResponseEntity<WishlistDto> addToWishlist(@RequestBody Map<String, Long> request) {
        Long userId = getCurrentUserId();
        Long productId = request.get("productId");
        
        try {
            WishlistDto wishlistItem = wishlistService.addToWishlist(userId, productId);
            return ResponseEntity.ok(wishlistItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @DeleteMapping("/wishlist/product/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/wishlist/{wishlistItemId}")
    public ResponseEntity<Void> removeWishlistItem(@PathVariable Long wishlistItemId) {
        Long userId = getCurrentUserId();
        wishlistService.removeWishlistItem(userId, wishlistItemId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/wishlist/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlistStatus(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
        return ResponseEntity.ok(Map.of("isInWishlist", isInWishlist));
    }
    
    @GetMapping("/wishlist/count")
    public ResponseEntity<Map<String, Long>> getWishlistCount() {
        Long userId = getCurrentUserId();
        long count = wishlistService.getWishlistCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @DeleteMapping("/wishlist")
    public ResponseEntity<Void> clearWishlist() {
        Long userId = getCurrentUserId();
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok().build();
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.getUserIdByUsername(username);
    }
}
