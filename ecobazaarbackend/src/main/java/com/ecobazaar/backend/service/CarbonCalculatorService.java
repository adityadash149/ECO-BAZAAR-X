package com.ecobazaar.backend.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CarbonCalculatorService {

    // Carbon emission factors (kg CO2 per kg per km)
    private static final BigDecimal TRUCK_EMISSION_FACTOR = new BigDecimal("0.0001");
    private static final BigDecimal SHIP_EMISSION_FACTOR = new BigDecimal("0.00002");
    private static final BigDecimal AIR_EMISSION_FACTOR = new BigDecimal("0.0005");
    
    // Manufacturing emission factors (kg CO2 per kg of product)
    private static final BigDecimal MANUFACTURING_EMISSION_FACTOR = new BigDecimal("2.5");
    private static final BigDecimal ECO_FRIENDLY_MANUFACTURING_FACTOR = new BigDecimal("1.0");

    public BigDecimal calculateCarbonScore(BigDecimal weightKg, BigDecimal shippingDistanceKm, Boolean isEcoFriendly) {
        if (weightKg == null || shippingDistanceKm == null) {
            return BigDecimal.ZERO;
        }

        // Manufacturing emissions
        BigDecimal manufacturingEmissions = weightKg.multiply(
            isEcoFriendly ? ECO_FRIENDLY_MANUFACTURING_FACTOR : MANUFACTURING_EMISSION_FACTOR
        );

        // Transportation emissions (using truck as default)
        BigDecimal transportationEmissions = weightKg
            .multiply(shippingDistanceKm)
            .multiply(TRUCK_EMISSION_FACTOR);

        // Total carbon score
        BigDecimal totalCarbonScore = manufacturingEmissions.add(transportationEmissions);
        
        return totalCarbonScore.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateShippingEmissions(BigDecimal weightKg, BigDecimal distanceKm, String transportMode) {
        if (weightKg == null || distanceKm == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal emissionFactor;
        switch (transportMode.toLowerCase()) {
            case "ship":
                emissionFactor = SHIP_EMISSION_FACTOR;
                break;
            case "air":
                emissionFactor = AIR_EMISSION_FACTOR;
                break;
            default:
                emissionFactor = TRUCK_EMISSION_FACTOR;
        }

        return weightKg.multiply(distanceKm).multiply(emissionFactor).setScale(2, RoundingMode.HALF_UP);
    }
}
