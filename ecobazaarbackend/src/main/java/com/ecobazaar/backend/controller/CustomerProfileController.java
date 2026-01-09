package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.dto.CarbonAnalyticsDto;
import com.ecobazaar.backend.dto.CustomerProfileUpdateDto;
import com.ecobazaar.backend.entity.CustomerProfile;
import com.ecobazaar.backend.service.CustomerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/profile")
@CrossOrigin(origins = "*")
public class CustomerProfileController {

    @Autowired
    private CustomerProfileService customerProfileService;

    @GetMapping("/{userId}")
    public ResponseEntity<CustomerProfile> getCustomerProfile(@PathVariable Long userId) {
        try {
            CustomerProfile profile = customerProfileService.getCustomerProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<CustomerProfile> updateCustomerProfile(
            @PathVariable Long userId, 
            @RequestBody CustomerProfileUpdateDto updateDto) {
        try {
            CustomerProfile updatedProfile = customerProfileService.updateCustomerProfile(userId, updateDto);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/carbon-analytics")
    public ResponseEntity<CarbonAnalyticsDto> getCarbonAnalytics(@PathVariable Long userId) {
        try {
            CarbonAnalyticsDto analytics = customerProfileService.getCarbonAnalytics(userId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

        @PostMapping("/{userId}/update-eco-points")
        public ResponseEntity<String> updateEcoPoints(@PathVariable Long userId) {
            try {
                customerProfileService.updateEcoPoints(userId);
                return ResponseEntity.ok("Eco points updated successfully");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error updating eco points: " + e.getMessage());
            }
        }

        @GetMapping("/{userId}/debug-eco-points")
        public ResponseEntity<Map<String, Object>> debugEcoPoints(@PathVariable Long userId) {
            try {
                CustomerProfile profile = customerProfileService.getCustomerProfile(userId);
                Map<String, Object> debug = new java.util.HashMap<>();
                debug.put("userId", userId);
                debug.put("ecoPoints", profile.getEcoPoints());
                debug.put("firstName", profile.getFirstName());
                debug.put("lastName", profile.getLastName());
                debug.put("email", profile.getEmail());
                return ResponseEntity.ok(debug);
            } catch (Exception e) {
                Map<String, Object> error = new java.util.HashMap<>();
                error.put("error", "Error getting debug info: " + e.getMessage());
                return ResponseEntity.badRequest().body(error);
            }
        }

        @PostMapping("/{userId}/award-eco-points")
        public ResponseEntity<Map<String, Object>> awardEcoPoints(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
            try {
                Integer points = Integer.parseInt(request.get("points").toString());
                CustomerProfile profile = customerProfileService.getCustomerProfile(userId);
                
                int currentPoints = profile.getEcoPoints() != null ? profile.getEcoPoints() : 0;
                int newPoints = currentPoints + points;
                profile.setEcoPoints(newPoints);
                
                CustomerProfile savedProfile = customerProfileService.updateCustomerProfile(userId, 
                    new CustomerProfileUpdateDto(
                        profile.getEmail(), profile.getFirstName(), profile.getLastName(),
                        profile.getPhone(), profile.getDateOfBirth(), profile.getStreetAddress(),
                        profile.getCity(), profile.getState(), profile.getZipCode(), profile.getCountry(),
                        profile.getEmailNotifications(), profile.getSmsNotifications(),
                        profile.getNewsletter(), profile.getEcoTips()
                    ));
                
                Map<String, Object> result = new java.util.HashMap<>();
                result.put("success", true);
                result.put("previousPoints", currentPoints);
                result.put("pointsAwarded", points);
                result.put("newTotal", newPoints);
                result.put("message", "Eco points awarded successfully!");
                
                return ResponseEntity.ok(result);
            } catch (Exception e) {
                Map<String, Object> error = new java.util.HashMap<>();
                error.put("success", false);
                error.put("error", "Error awarding eco points: " + e.getMessage());
                return ResponseEntity.badRequest().body(error);
            }
        }
}
