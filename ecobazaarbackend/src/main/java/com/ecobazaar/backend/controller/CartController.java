package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.CartItemDto;
import com.ecobazaar.backend.entity.Cart;
import com.ecobazaar.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/{userId}/add")
    public ResponseEntity<Cart> addToCart(
        @PathVariable Long userId,
        @RequestParam Long productId,
        @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(userId, productId, quantity));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CartItemDto>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getUserCartDetails(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Cart>> getCartRaw(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCartItem(@PathVariable Long id) {
        cartService.removeCartItem(id);
        return ResponseEntity.ok("Item removed successfully");
    }

    @DeleteMapping("/{userId}/remove/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long userId, @PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok().build();
    }
}
