package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    List<Product> findBySellerIdAndIsActiveTrue(Long sellerId);
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    List<Product> findByIsEcoFriendlyTrueAndIsActiveTrue();
    
    // Seller dashboard methods
    Long countBySellerId(Long sellerId);
    Long countBySellerIdAndIsActiveTrue(Long sellerId);
    
    @Query("SELECT SUM(p.carbonScore) FROM Product p WHERE p.seller.id = :sellerId")
    BigDecimal sumCarbonScoreBySellerId(@Param("sellerId") Long sellerId);
    
    // Admin specific queries
    List<Product> findBySellerId(Long sellerId);
    Long countByCategoryId(Long categoryId);
    
    @Query("SELECT SUM(p.carbonScore) FROM Product p WHERE p.isActive = true")
    BigDecimal sumTotalCarbonScore();
    
    @Query("SELECT p FROM Product p ORDER BY p.createdAt DESC")
    List<Product> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.seller WHERE p.id = :id")
    Product findByIdWithRelations(@Param("id") Long id);
}
