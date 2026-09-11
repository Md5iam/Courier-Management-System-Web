package org.example.couriermanagmentsystemweb.controller.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.dto.api.ApiResponse;
import org.example.couriermanagmentsystemweb.dto.api.CourierResponseDto;
import org.example.couriermanagmentsystemweb.dto.api.EmployeeDashboardDto;
import org.example.couriermanagmentsystemweb.dto.api.UserDto;
import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.CourierStatus;
import org.example.couriermanagmentsystemweb.service.CourierService;
import org.example.couriermanagmentsystemweb.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeApiController {

    private final UserService userService;
    private final CourierService courierService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<EmployeeDashboardDto>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        String zone = employee.getAssignedZone() != null ? employee.getAssignedZone() : "";

        List<Courier> pickupTasks = courierService.getCouriersByPickupEmployee(employee.getId());
        List<Courier> pendingZonePickups = courierService.getCouriersByPickupZoneAndStatus(zone, CourierStatus.PENDING);
        List<Courier> incomingParcels = courierService.getCouriersByDeliveryZoneAndStatus(zone, CourierStatus.IN_TRANSIT);
        List<Courier> deliveryTasks = courierService.getCouriersByDeliveryEmployee(employee.getId());

        EmployeeDashboardDto dto = EmployeeDashboardDto.builder()
                .employee(UserDto.fromEntity(employee))
                .pendingZoneCount(pendingZonePickups.size())
                .pickupTaskCount(pickupTasks.stream().filter(c -> c.getStatus() == CourierStatus.PICKED_UP).count())
                .incomingCount(incomingParcels.size())
                .deliveryTaskCount(deliveryTasks.stream().filter(c -> c.getStatus() == CourierStatus.OUT_FOR_DELIVERY).count())
                .recentTasks(pickupTasks.stream().limit(5).map(CourierResponseDto::fromEntity).collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/pickups")
    public ResponseEntity<ApiResponse<List<CourierResponseDto>>> getPickups(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        String zone = employee.getAssignedZone() != null ? employee.getAssignedZone() : "";
        List<CourierResponseDto> pickups = courierService.getCouriersByPickupZoneAndStatus(zone, CourierStatus.PENDING)
                .stream()
                .map(CourierResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(pickups));
    }

    @PostMapping("/claim-pickup")
    public ResponseEntity<ApiResponse<String>> claimPickup(@AuthenticationPrincipal UserDetails userDetails,
                                                           @RequestBody Map<String, Long> payload) {
        Long courierId = payload.get("courierId");
        if (courierId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Courier ID is required"));
        }
        try {
            User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
            courierService.updateCourierStatus(courierId, CourierStatus.PICKED_UP, employee);
            return ResponseEntity.ok(ApiResponse.ok("Parcel claimed for pickup successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/send-transit")
    public ResponseEntity<ApiResponse<String>> sendToTransit(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestBody Map<String, Long> payload) {
        Long courierId = payload.get("courierId");
        if (courierId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Courier ID is required"));
        }
        try {
            User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
            courierService.updateCourierStatus(courierId, CourierStatus.IN_TRANSIT, employee);
            return ResponseEntity.ok(ApiResponse.ok("Parcel dispatched to hub (IN TRANSIT)!", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/incoming")
    public ResponseEntity<ApiResponse<List<CourierResponseDto>>> getIncoming(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        String zone = employee.getAssignedZone() != null ? employee.getAssignedZone() : "";
        List<CourierResponseDto> incoming = courierService.getCouriersByDeliveryZoneAndStatus(zone, CourierStatus.IN_TRANSIT)
                .stream()
                .map(CourierResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(incoming));
    }

    @PostMapping("/claim-delivery")
    public ResponseEntity<ApiResponse<String>> claimDelivery(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestBody Map<String, Long> payload) {
        Long courierId = payload.get("courierId");
        if (courierId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Courier ID is required"));
        }
        try {
            User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
            courierService.updateCourierStatus(courierId, CourierStatus.OUT_FOR_DELIVERY, employee);
            return ResponseEntity.ok(ApiResponse.ok("Parcel claimed for delivery! Marked OUT FOR DELIVERY.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/mark-delivered")
    public ResponseEntity<ApiResponse<String>> markDelivered(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestBody Map<String, Long> payload) {
        Long courierId = payload.get("courierId");
        if (courierId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Courier ID is required"));
        }
        try {
            User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();
            courierService.updateCourierStatus(courierId, CourierStatus.DELIVERED, employee);
            return ResponseEntity.ok(ApiResponse.ok("Parcel successfully marked as DELIVERED! Payment marked as PAID.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<Map<String, List<CourierResponseDto>>>> getDeliveries(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User employee = userService.findByEmail(userDetails.getUsername()).orElseThrow();

        List<CourierResponseDto> pickupTasks = courierService.getCouriersByPickupEmployee(employee.getId())
                .stream()
                .map(CourierResponseDto::fromEntity)
                .collect(Collectors.toList());

        List<CourierResponseDto> deliveryTasks = courierService.getCouriersByDeliveryEmployee(employee.getId())
                .stream()
                .map(CourierResponseDto::fromEntity)
                .collect(Collectors.toList());

        Map<String, List<CourierResponseDto>> result = new HashMap<>();
        result.put("pickupTasks", pickupTasks);
        result.put("deliveryTasks", deliveryTasks);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
