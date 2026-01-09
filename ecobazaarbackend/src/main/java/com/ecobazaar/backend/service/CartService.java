package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.CartItemDto;
import com.ecobazaar.backend.entity.Cart;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.CartRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import com.ecobazaar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        return cartRepository.findByUserIdAndProductId(userId, productId)
            .map(cart -> {
                cart.setQuantity(cart.getQuantity() + quantity);
                return cartRepository.save(cart);
            })
            .orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUser(user);
                newCart.setProduct(product);
                newCart.setQuantity(quantity);
                return cartRepository.save(newCart);
            });
    }

    public List<Cart> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public void removeFromCart(Long cartItemId) {
        removeCartItem(cartItemId);
    }

    public void removeCartItem(Long cartId) {
        if (cartRepository.existsById(cartId)) {
            cartRepository.deleteById(cartId);
        } else {
            throw new RuntimeException("Cart item not found with id: " + cartId);
        }
    }

    public List<CartItemDto> getUserCartDetails(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        List<CartItemDto> cartDetails = new ArrayList<>();

        for (Cart item : cartItems) {
            Long productId = item.getProduct() != null ? item.getProduct().getId() : null;
            if (productId == null) {
                throw new RuntimeException("Cart item " + item.getId() + " is missing product reference");
            }

            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found id: " + productId));

            CartItemDto dto = new CartItemDto(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice() != null ? product.getPrice().doubleValue() : 0.0,
                item.getQuantity(),
                product.getEcoPoints(),
                product.getCarbonReduction()
            );

            cartDetails.add(dto);
        }
        return cartDetails;
    }
}
