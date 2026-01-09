package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.ProductRepository;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.repository.CartRepository;
import com.ecobazaar.backend.repository.WishlistRepository;
import com.ecobazaar.backend.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarbonCalculatorService carbonCalculatorService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public Product getProductById(Long id) {
        // Try to get product with relations first
        Product product = productRepository.findByIdWithRelations(id);
        // If not found, try regular findById as fallback
        if (product == null) {
            product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        }
        return product;
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    public List<Product> getEcoFriendlyProducts() {
        return productRepository.findByIsEcoFriendlyTrueAndIsActiveTrue();
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerIdAndIsActiveTrue(sellerId);
    }

    public Product createProduct(Product product, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        product.setSeller(seller);
        
        // Calculate carbon score
        BigDecimal carbonScore = carbonCalculatorService.calculateCarbonScore(
            product.getWeightKg(),
            product.getShippingDistanceKm(),
            product.getIsEcoFriendly()
        );
        product.setCarbonScore(carbonScore);
        
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setCategory(productDetails.getCategory());
        product.setWeightKg(productDetails.getWeightKg());
        product.setShippingDistanceKm(productDetails.getShippingDistanceKm());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setImageUrl(productDetails.getImageUrl());
        product.setIsEcoFriendly(productDetails.getIsEcoFriendly());
        
        // Recalculate carbon score
        BigDecimal carbonScore = carbonCalculatorService.calculateCarbonScore(
            product.getWeightKg(),
            product.getShippingDistanceKm(),
            product.getIsEcoFriendly()
        );
        product.setCarbonScore(carbonScore);
        
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        
        // Delete all related foreign key records first
        // 1. Delete from cart
        cartRepository.deleteByProductId(id);
        
        // 2. Delete from wishlist
        wishlistRepository.deleteByProductId(id);
        
        // 3. Delete order items (this will affect order totals, but we'll handle that)
        orderItemRepository.deleteByProductId(id);
        
        // 4. Finally delete the product itself
        productRepository.delete(product);
    }
}
