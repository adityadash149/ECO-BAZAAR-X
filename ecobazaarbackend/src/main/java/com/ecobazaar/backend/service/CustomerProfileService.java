package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.CarbonAnalyticsDto;
import com.ecobazaar.backend.dto.CustomerProfileUpdateDto;
import com.ecobazaar.backend.entity.CustomerProfile;
import com.ecobazaar.backend.entity.Order;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.CustomerProfileRepository;
import com.ecobazaar.backend.repository.OrderRepository;
import com.ecobazaar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CustomerProfileService {
    
    @Autowired
    private CustomerProfileRepository customerProfileRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;


    public CustomerProfile getCustomerProfile(Long userId) {
        return getOrCreateProfile(userId);
    }

    public CustomerProfile updateCustomerProfile(Long userId, CustomerProfileUpdateDto updateDto) {
        CustomerProfile profile = getOrCreateProfile(userId);

        // Update profile fields
        if (updateDto.getEmail() != null) {
            profile.setEmail(updateDto.getEmail());
        }
        if (updateDto.getFirstName() != null) {
            profile.setFirstName(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null) {
            profile.setLastName(updateDto.getLastName());
        }
        if (updateDto.getPhone() != null) {
            profile.setPhone(updateDto.getPhone());
        }
        if (updateDto.getDateOfBirth() != null) {
            profile.setDateOfBirth(updateDto.getDateOfBirth());
        }
        if (updateDto.getStreetAddress() != null) {
            profile.setStreetAddress(updateDto.getStreetAddress());
        }
        if (updateDto.getCity() != null) {
            profile.setCity(updateDto.getCity());
        }
        if (updateDto.getState() != null) {
            profile.setState(updateDto.getState());
        }
        if (updateDto.getZipCode() != null) {
            profile.setZipCode(updateDto.getZipCode());
        }
        if (updateDto.getCountry() != null) {
            profile.setCountry(updateDto.getCountry());
        }
        if (updateDto.getEmailNotifications() != null) {
            profile.setEmailNotifications(updateDto.getEmailNotifications());
        }
        if (updateDto.getSmsNotifications() != null) {
            profile.setSmsNotifications(updateDto.getSmsNotifications());
        }
        if (updateDto.getNewsletter() != null) {
            profile.setNewsletter(updateDto.getNewsletter());
        }
        if (updateDto.getEcoTips() != null) {
            profile.setEcoTips(updateDto.getEcoTips());
        }

        return customerProfileRepository.save(profile);
    }

    public CarbonAnalyticsDto getCarbonAnalytics(Long userId) {
        List<Order> orders = orderRepository.findByUserIdAndStatusIn(userId, 
            java.util.Arrays.asList("CONFIRMED", "SHIPPED", "DELIVERED"));

        BigDecimal totalCarbonEmitted = orders.stream()
                .map(Order::getTotalCarbonScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate carbon saved (assuming eco-friendly products save carbon)
        BigDecimal totalCarbonSaved = orders.stream()
                .filter(order -> order.getTotalCarbonScore().compareTo(BigDecimal.valueOf(3)) <= 0)
                .map(order -> BigDecimal.valueOf(5).subtract(order.getTotalCarbonScore()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalOrders = orders.size();
        Integer ecoFriendlyOrders = (int) orders.stream()
                .filter(order -> order.getTotalCarbonScore().compareTo(BigDecimal.valueOf(3)) <= 0)
                .count();

        BigDecimal averageCarbonPerOrder = totalOrders > 0 ? 
                totalCarbonEmitted.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;

        // Get eco points from customer profile (stored balance)
        CustomerProfile profile = getOrCreateProfile(userId);
        Integer ecoPoints = profile.getEcoPoints() != null ? profile.getEcoPoints() : 0;
        
        // Debug logging
        System.out.println("=== CARBON ANALYTICS DEBUG ===");
        System.out.println("User ID: " + userId);
        System.out.println("Profile eco_points: " + profile.getEcoPoints());
        System.out.println("Returning eco_points: " + ecoPoints);
        System.out.println("=============================");

        // Calculate trees equivalent (1 tree = 22 kg CO2)
        Integer treesEquivalent = totalCarbonSaved.divide(BigDecimal.valueOf(22), 0, RoundingMode.HALF_UP).intValue();

        // Get order history
        List<CarbonAnalyticsDto.OrderCarbonDto> orderHistory = orders.stream()
                .map(order -> {
                    BigDecimal carbonScore = order.getTotalCarbonScore();
                    Integer ecoPointsEarned = 0;
                    // Only eco-friendly products (carbon score <= 3) earn points
                    if (carbonScore.compareTo(BigDecimal.valueOf(3)) <= 0) {
                        // 10% of total price as eco points
                        ecoPointsEarned = order.getTotalPrice().multiply(BigDecimal.valueOf(0.10)).intValue();
                    }

                    return new CarbonAnalyticsDto.OrderCarbonDto(
                            order.getId(),
                            order.getTotalPrice(),
                            order.getTotalCarbonScore(),
                            order.getStatus().toString(),
                            order.getCreatedAt(),
                            ecoPointsEarned
                    );
                })
                .collect(java.util.stream.Collectors.toList());

        // Get monthly data (last 6 months)
        List<CarbonAnalyticsDto.MonthlyCarbonDto> monthlyData = getMonthlyCarbonData(userId);

        return new CarbonAnalyticsDto(
                totalCarbonSaved,
                totalCarbonEmitted,
                totalOrders,
                ecoFriendlyOrders,
                averageCarbonPerOrder,
                orderHistory,
                monthlyData,
                ecoPoints,
                treesEquivalent
        );
    }

    private List<CarbonAnalyticsDto.MonthlyCarbonDto> getMonthlyCarbonData(Long userId) {
        List<CarbonAnalyticsDto.MonthlyCarbonDto> monthlyData = new ArrayList<>();
        
        // Get last 6 months of data
        for (int i = 5; i >= 0; i--) {
            LocalDateTime startDate = LocalDateTime.now().minusMonths(i).withDayOfMonth(1);
            LocalDateTime endDate = startDate.plusMonths(1).minusDays(1);
            
            List<Order> monthlyOrders = orderRepository.findByUserIdAndCreatedAtBetweenAndStatusIn(
                userId, startDate, endDate, java.util.Arrays.asList("CONFIRMED", "SHIPPED", "DELIVERED"));
            
            BigDecimal monthlyCarbonEmitted = monthlyOrders.stream()
                    .map(Order::getTotalCarbonScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal monthlyCarbonSaved = monthlyOrders.stream()
                    .filter(order -> order.getTotalCarbonScore().compareTo(BigDecimal.valueOf(3)) <= 0)
                    .map(order -> BigDecimal.valueOf(5).subtract(order.getTotalCarbonScore()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Integer monthlyEcoPoints = monthlyOrders.stream()
                    .mapToInt(order -> {
                        BigDecimal carbonScore = order.getTotalCarbonScore();
                        // Only eco-friendly products (carbon score <= 3) earn points
                        if (carbonScore.compareTo(BigDecimal.valueOf(3)) <= 0) {
                            // 10% of total price as eco points
                            return order.getTotalPrice().multiply(BigDecimal.valueOf(0.10)).intValue();
                        }
                        return 0;
                    })
                    .sum();
            
            String monthName = startDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            
            monthlyData.add(new CarbonAnalyticsDto.MonthlyCarbonDto(
                    monthName,
                    monthlyCarbonSaved,
                    monthlyCarbonEmitted,
                    monthlyOrders.size(),
                    monthlyEcoPoints
            ));
        }
        
        return monthlyData;
    }

    public void updateEcoPoints(Long userId) {
        CustomerProfile profile = getOrCreateProfile(userId);

        // Calculate eco points from order history (only for new orders)
        List<Order> orders = orderRepository.findByUserIdAndStatusIn(userId, 
            java.util.Arrays.asList("CONFIRMED", "SHIPPED", "DELIVERED"));
        
        Integer calculatedEcoPoints = orders.stream()
                .mapToInt(order -> {
                    BigDecimal carbonScore = order.getTotalCarbonScore();
                    // Only eco-friendly products (carbon score <= 3) earn points
                    if (carbonScore.compareTo(BigDecimal.valueOf(3)) <= 0) {
                        // 10% of total price as eco points (1 point = ₹1)
                        return order.getTotalPrice().multiply(BigDecimal.valueOf(0.10)).intValue();
                    }
                    return 0;
                })
                .sum();
        
        // Only update if the calculated points are higher than current balance
        // This prevents overwriting manually set balances
        if (calculatedEcoPoints > (profile.getEcoPoints() != null ? profile.getEcoPoints() : 0)) {
            profile.setEcoPoints(calculatedEcoPoints);
            customerProfileRepository.save(profile);
        }
    }

    private CustomerProfile getOrCreateProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return customerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));
    }

    private CustomerProfile createDefaultProfile(User user) {
        CustomerProfile profile = new CustomerProfile();
        profile.setUser(user);
        profile.setEmail(user.getEmail());
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        profile.setEcoPoints(0);
        profile.setCarbonSaved(0.0);
        profile.setTreesPlanted(0);
        return customerProfileRepository.save(profile);
    }
}