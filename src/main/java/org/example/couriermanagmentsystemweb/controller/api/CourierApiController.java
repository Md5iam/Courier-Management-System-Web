package org.example.couriermanagmentsystemweb.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.dto.CourierBookingDto;
import org.example.couriermanagmentsystemweb.dto.api.ApiResponse;
import org.example.couriermanagmentsystemweb.dto.api.CourierResponseDto;
import org.example.couriermanagmentsystemweb.dto.api.TransactionResponseDto;
import org.example.couriermanagmentsystemweb.dto.api.UserDto;
import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.entity.Transaction;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.service.CourierService;
import org.example.couriermanagmentsystemweb.service.TransactionService;
import org.example.couriermanagmentsystemweb.service.UserService;
import org.example.couriermanagmentsystemweb.service.strategy.PricingStrategy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourierApiController {

    private final CourierService courierService;
    private final UserService userService;
    private final TransactionService transactionService;
    private final PricingStrategy pricingStrategy;

    // ==================== HEALTH / KEEPALIVE PING ====================

    @RequestMapping(value = "/health", method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        long start = System.currentTimeMillis();
        try {
            // Lightweight query to keep Aiven MySQL awake and reset inactivity timer
            long total = courierService.countTotalCouriers();
            long elapsed = System.currentTimeMillis() - start;
            health.put("status", "UP");
            health.put("database", "CONNECTED");
            health.put("totalCouriers", total);
            health.put("latencyMs", elapsed);
            health.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("Database health check ping failed after {}ms: {}", elapsed, e.getMessage());
            health.put("status", "DOWN");
            health.put("database", "DISCONNECTED: " + e.getMessage());
            health.put("latencyMs", elapsed);
            health.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(health);
        }
    }

    // ==================== PUBLIC TRACKING & RATES ====================

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> trackCourier(@PathVariable String trackingNumber) {
        Optional<Courier> courierOpt = courierService.findByTrackingNumber(trackingNumber);
        if (courierOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No courier found with tracking number: " + trackingNumber));
        }

        Courier courier = courierOpt.get();
        Optional<Transaction> transactionOpt = transactionService.getTransactionByCourierId(courier.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("courier", CourierResponseDto.fromEntity(courier));
        data.put("transaction", transactionOpt.map(TransactionResponseDto::fromEntity).orElse(null));

        return ResponseEntity.ok(ApiResponse.ok("Courier found", data));
    }

    @GetMapping("/rates/calculate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateRate(@RequestParam(defaultValue = "1.0") Double weightKg) {
        double fee = pricingStrategy.calculateFee(weightKg);
        Map<String, Object> response = new HashMap<>();
        response.put("baseFee", 60.0);
        response.put("ratePerKg", 25.0);
        response.put("weightKg", weightKg);
        response.put("totalFee", fee);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    @GetMapping("/user/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        List<Courier> userCouriers = courierService.getCouriersBySender(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("user", UserDto.fromEntity(user));
        response.put("totalBookings", userCouriers.size());
        response.put("activeCount", userCouriers.stream()
                .filter(c -> c.getStatus().name().matches("PENDING|PICKED_UP|IN_TRANSIT|OUT_FOR_DELIVERY"))
                .count());
        response.put("deliveredCount", userCouriers.stream()
                .filter(c -> c.getStatus().name().equals("DELIVERED"))
                .count());
        response.put("totalSpent", userCouriers.stream().mapToDouble(Courier::getTotalFee).sum());
        response.put("recentCouriers", userCouriers.stream()
                .limit(5)
                .map(CourierResponseDto::fromEntity)
                .collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/user/couriers")
    public ResponseEntity<ApiResponse<List<CourierResponseDto>>> getUserCouriers(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        List<CourierResponseDto> couriers = courierService.getCouriersBySender(user.getId())
                .stream()
                .map(CourierResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(couriers));
    }

    @PostMapping("/user/book")
    public ResponseEntity<ApiResponse<CourierResponseDto>> bookCourier(@AuthenticationPrincipal UserDetails userDetails,
                                                                       @Valid @RequestBody CourierBookingDto dto) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        try {
            User sender = userService.findByEmail(userDetails.getUsername()).orElseThrow();
            Courier courier = courierService.bookCourier(dto, sender);
            return ResponseEntity.ok(ApiResponse.ok("Courier booked successfully! Tracking ID: " + courier.getTrackingNumber(),
                    CourierResponseDto.fromEntity(courier)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to book courier: " + e.getMessage()));
        }
    }

    @GetMapping("/user/invoice/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInvoice(@AuthenticationPrincipal UserDetails userDetails,
                                                                       @PathVariable Long id) {
        Optional<Courier> courierOpt = courierService.findById(id);
        if (courierOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Courier parcel not found"));
        }

        Courier courier = courierOpt.get();
        Optional<Transaction> transactionOpt = transactionService.getTransactionByCourierId(courier.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("courier", CourierResponseDto.fromEntity(courier));
        data.put("transaction", transactionOpt.map(TransactionResponseDto::fromEntity).orElse(null));

        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/user/cancel/{id}")
    public ResponseEntity<ApiResponse<String>> cancelCourier(@AuthenticationPrincipal UserDetails userDetails,
                                                             @PathVariable Long id) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        try {
            User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
            courierService.cancelCourier(id, user);
            return ResponseEntity.ok(ApiResponse.ok("Courier booking cancelled successfully.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Could not cancel booking: " + e.getMessage()));
        }
    }
}
