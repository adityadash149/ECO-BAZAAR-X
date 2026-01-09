package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.service.EcoPointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eco-points")
@CrossOrigin(origins = "*")
public class EcoPointsController {

    @Autowired
    private EcoPointsService ecoPointsService;

    @Autowired
    private com.ecobazaar.backend.security.UserDetailsServiceImpl userDetailsService;

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance() {
        try {
            Long userId = getCurrentUserId();
            Integer balance = ecoPointsService.getCustomerEcoPoints(userId);
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("balance", balance);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching balance: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/validate-redemption")
    public ResponseEntity<Map<String, Object>> validateRedemption(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getCurrentUserId();
            Integer pointsToRedeem = Integer.parseInt(request.get("pointsToRedeem").toString());
            BigDecimal orderTotal = new BigDecimal(request.get("orderTotal").toString());
            @SuppressWarnings("unchecked")
            List<Long> productIds = (List<Long>) request.get("productIds");
            
            Map<String, Object> result = ecoPointsService.validateRedemption(userId, pointsToRedeem, orderTotal, productIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("valid", false);
            error.put("message", "Error validating redemption: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeemPoints(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getCurrentUserId();
            Integer pointsToRedeem = Integer.parseInt(request.get("pointsToRedeem").toString());
            BigDecimal orderTotal = new BigDecimal(request.get("orderTotal").toString());
            @SuppressWarnings("unchecked")
            List<Long> productIds = (List<Long>) request.get("productIds");
            
            Map<String, Object> result = ecoPointsService.processRedemption(userId, pointsToRedeem, orderTotal, productIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("message", "Error processing redemption: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> getRedemptionRules() {
        try {
            Map<String, Object> rules = ecoPointsService.getRedemptionRules();
            rules.put("success", true);
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching rules: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.getUserIdByUsername(username);
    }
}
