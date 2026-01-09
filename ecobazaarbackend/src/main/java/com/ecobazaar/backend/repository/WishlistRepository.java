package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Wishlist;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUserOrderByAddedAtDesc(User user);
    
    List<Wishlist> findByUserIdOrderByAddedAtDesc(Long userId);
    
    Optional<Wishlist> findByUserAndProduct(User user, Product product);
    
    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);
    
    boolean existsByUserAndProduct(User user, Product product);
    
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByUserAndProduct(User user, Product product);
    
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByProductId(Long productId);
    
    long countByUserId(Long userId);
}
