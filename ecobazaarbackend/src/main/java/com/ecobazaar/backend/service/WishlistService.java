package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.WishlistDto;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.entity.Wishlist;
import com.ecobazaar.backend.repository.ProductRepository;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistService {
    
    @Autowired
    private WishlistRepository wishlistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<WishlistDto> getUserWishlist(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Wishlist> wishlistItems = wishlistRepository.findByUserOrderByAddedAtDesc(user);
        
        return wishlistItems.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    public WishlistDto addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if already in wishlist
        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Product already in wishlist");
        }
        
        Wishlist wishlistItem = new Wishlist(user, product);
        wishlistItem = wishlistRepository.save(wishlistItem);
        
        return convertToDto(wishlistItem);
    }
    
    public void removeFromWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        wishlistRepository.deleteByUserAndProduct(user, product);
    }
    
    public void removeWishlistItem(Long userId, Long wishlistItemId) {
        Wishlist wishlistItem = wishlistRepository.findById(wishlistItemId)
            .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        
        if (!wishlistItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to remove this item");
        }
        
        wishlistRepository.delete(wishlistItem);
    }
    
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    public long getWishlistCount(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }
    
    public void clearWishlist(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Wishlist> userWishlist = wishlistRepository.findByUserOrderByAddedAtDesc(user);
        wishlistRepository.deleteAll(userWishlist);
    }
    
    private WishlistDto convertToDto(Wishlist wishlist) {
        WishlistDto dto = new WishlistDto();
        
        dto.setId(wishlist.getId());
        dto.setUserId(wishlist.getUser().getId());
        dto.setProductId(wishlist.getProduct().getId());
        dto.setProductName(wishlist.getProduct().getName());
        dto.setProductDescription(wishlist.getProduct().getDescription());
        dto.setProductPrice(wishlist.getProduct().getPrice().doubleValue());
        dto.setProductImageUrl(wishlist.getProduct().getImageUrl());
        dto.setCarbonScore(wishlist.getProduct().getCarbonScore().doubleValue());
        dto.setIsEcoFriendly(wishlist.getProduct().getIsEcoFriendly());
        dto.setStockQuantity(wishlist.getProduct().getStockQuantity());
        
        if (wishlist.getProduct().getCategory() != null) {
            dto.setCategoryName(wishlist.getProduct().getCategory().getName());
        }
        
        dto.setAddedAt(wishlist.getAddedAt());
        
        return dto;
    }
}
