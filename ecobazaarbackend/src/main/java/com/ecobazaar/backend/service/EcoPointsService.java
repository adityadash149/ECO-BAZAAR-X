package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.CustomerProfile;
import com.ecobazaar.backend.entity.Product;
import com.ecobazaar.backend.repository.CustomerProfileRepository;
import com.ecobazaar.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class EcoPointsService {

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private ProductRepository productRepository;


    // Constants for eco-points system
    private static final int MIN_REDEMPTION_POINTS = 100;
    private static final double MAX_REDEMPTION_PERCENTAGE = 0.40; // 40% max
    private static final double ECO_BOOST_MULTIPLIER = 3.0; // 3x for eco-friendly products
    private static final double POINTS_TO_RUPEE_RATIO = 1.0; // 1 point = ₹1

    /**
     * Calculate eco points earned for a purchase
     */
    public Integer calculateEcoPointsEarned(BigDecimal totalPrice, BigDecimal carbonScore) {
        // Only eco-friendly products (carbon score <= 3) earn points
        if (carbonScore.compareTo(BigDecimal.valueOf(3)) <= 0) {
            // 10% of total price as eco points
            return totalPrice.multiply(BigDecimal.valueOf(0.10)).intValue();
        }
        return 0;
    }

    /**
     * Validate eco points redemption request
     */
    public Map<String, Object> validateRedemption(Long userId, Integer pointsToRedeem, BigDecimal orderTotal, List<Long> productIds) {
        Map<String, Object> result = new java.util.HashMap<>();
        
        try {
            // Get customer profile
            CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Customer profile not found"));

            // Check minimum threshold
            if (pointsToRedeem < MIN_REDEMPTION_POINTS) {
                result.put("valid", false);
                result.put("message", "Minimum " + MIN_REDEMPTION_POINTS + " eco points required for redemption");
                return result;
            }

            // Check if customer has enough points
            if (profile.getEcoPoints() < pointsToRedeem) {
                result.put("valid", false);
                result.put("message", "Insufficient eco points. You have " + profile.getEcoPoints() + " points");
                return result;
            }

            // Check if all products are eco-friendly
            boolean allEcoFriendly = true;
            for (Long productId : productIds) {
                Product product = productRepository.findById(productId).orElse(null);
                if (product == null || product.getCarbonScore().compareTo(BigDecimal.valueOf(3)) > 0) {
                    allEcoFriendly = false;
                    break;
                }
            }

            // Calculate redemption value
            BigDecimal redemptionValue = BigDecimal.valueOf(pointsToRedeem).multiply(BigDecimal.valueOf(POINTS_TO_RUPEE_RATIO));
            
            // Apply eco-boost multiplier if all products are eco-friendly
            if (allEcoFriendly) {
                redemptionValue = redemptionValue.multiply(BigDecimal.valueOf(ECO_BOOST_MULTIPLIER));
            }

            // Check maximum redemption cap (40% of order value)
            BigDecimal maxRedemption = orderTotal.multiply(BigDecimal.valueOf(MAX_REDEMPTION_PERCENTAGE));
            if (redemptionValue.compareTo(maxRedemption) > 0) {
                redemptionValue = maxRedemption;
                // Recalculate points needed for max redemption
                pointsToRedeem = redemptionValue.divide(BigDecimal.valueOf(POINTS_TO_RUPEE_RATIO), 0, java.math.RoundingMode.DOWN).intValue();
                if (allEcoFriendly) {
                    pointsToRedeem = pointsToRedeem / 3; // Adjust for 3x multiplier
                }
            }

            result.put("valid", true);
            result.put("pointsToRedeem", pointsToRedeem);
            result.put("redemptionValue", redemptionValue);
            result.put("ecoBoost", allEcoFriendly);
            result.put("finalDiscount", redemptionValue);

            return result;

        } catch (Exception e) {
            result.put("valid", false);
            result.put("message", "Error validating redemption: " + e.getMessage());
            return result;
        }
    }

    /**
     * Process eco points redemption
     */
    public Map<String, Object> processRedemption(Long userId, Integer pointsToRedeem, BigDecimal orderTotal, List<Long> productIds) {
        Map<String, Object> result = validateRedemption(userId, pointsToRedeem, orderTotal, productIds);
        
        if (!(Boolean) result.get("valid")) {
            return result;
        }

        try {
            // Get customer profile
            CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Customer profile not found"));

            // Deduct points from customer account
            profile.setEcoPoints(profile.getEcoPoints() - (Integer) result.get("pointsToRedeem"));
            customerProfileRepository.save(profile);

            result.put("success", true);
            result.put("remainingPoints", profile.getEcoPoints());
            result.put("message", "Eco points redeemed successfully!");

            return result;

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error processing redemption: " + e.getMessage());
            return result;
        }
    }

    /**
     * Get customer's eco points balance
     */
    public Integer getCustomerEcoPoints(Long userId) {
        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        return profile.getEcoPoints();
    }

    /**
     * Add eco points to customer account (after successful purchase)
     */
    public void addEcoPoints(Long userId, Integer points) {
        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        
        profile.setEcoPoints(profile.getEcoPoints() + points);
        customerProfileRepository.save(profile);
    }

    /**
     * Get redemption rules for display
     */
    public Map<String, Object> getRedemptionRules() {
        Map<String, Object> rules = new java.util.HashMap<>();
        rules.put("minPoints", MIN_REDEMPTION_POINTS);
        rules.put("maxPercentage", MAX_REDEMPTION_PERCENTAGE); // Return as decimal (0.4)
        rules.put("maxPercentageDisplay", MAX_REDEMPTION_PERCENTAGE * 100); // For display (40)
        rules.put("ecoBoostMultiplier", ECO_BOOST_MULTIPLIER);
        rules.put("pointsToRupeeRatio", POINTS_TO_RUPEE_RATIO);
        return rules;
    }
}
