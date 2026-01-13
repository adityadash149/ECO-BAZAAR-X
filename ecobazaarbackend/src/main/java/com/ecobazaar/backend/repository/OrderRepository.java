package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.OrderStatus;
import com.ecobazaar.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Seller dashboard methods
    @Query("SELECT o FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.seller.id = :sellerId")
    List<Order> findBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.seller.id = :sellerId")
    Long countBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.seller.id = :sellerId AND o.status = :status")
    Long countBySellerIdAndStatus(@Param("sellerId") Long sellerId, @Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalPrice) FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.seller.id = :sellerId")
    BigDecimal sumTotalAmountBySellerId(@Param("sellerId") Long sellerId);

    // Admin specific queries
    @Query("SELECT SUM(o.totalPrice) FROM Order o")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    Long countOrdersByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.user.id = :userId")
    BigDecimal sumTotalSpentByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllOrderByCreatedAtDesc();

    // --- Added missing methods ---
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);

    @Query("SELECT SUM(oi.price * oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId")
    BigDecimal sumTotalAmountByProductId(@Param("productId") Long productId);
    // -----------------------------

    // Customer profile analytics methods
    List<Order> findByUserIdAndStatusIn(Long userId, List<String> statuses);
    List<Order> findByUserIdAndCreatedAtBetweenAndStatusIn(Long userId, LocalDateTime startDate, LocalDateTime endDate, List<String> statuses);
}

