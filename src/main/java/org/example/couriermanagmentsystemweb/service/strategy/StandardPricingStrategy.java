package org.example.couriermanagmentsystemweb.service.strategy;

import org.springframework.stereotype.Component;

@Component
public class StandardPricingStrategy implements PricingStrategy {

    private static final double BASE_FEE = 60.0; // Base charge BDT 60
    private static final double RATE_PER_KG = 25.0; // BDT 25 per kg

    @Override
    public double calculateFee(double weightKg) {
        if (weightKg <= 0) {
            return BASE_FEE;
        }
        return BASE_FEE + (weightKg * RATE_PER_KG);
    }
}
