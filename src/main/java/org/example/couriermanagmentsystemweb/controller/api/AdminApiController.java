package org.example.couriermanagmentsystemweb.controller.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.dto.api.AdminDashboardDto;
import org.example.couriermanagmentsystemweb.dto.api.ApiResponse;
import org.example.couriermanagmentsystemweb.dto.api.CourierResponseDto;
import org.example.couriermanagmentsystemweb.dto.api.TransactionResponseDto;
import org.example.couriermanagmentsystemweb.dto.api.UserDto;
import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.enums.CourierStatus;
import org.example.couriermanagmentsystemweb.enums.RoleType;
import org.example.couriermanagmentsystemweb.service.CourierService;
import org.example.couriermanagmentsystemweb.service.TransactionService;
import org.example.couriermanagmentsystemweb.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApiController {

    private final UserService userService;
    private final CourierService courierService;
    private final TransactionService transactionService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        List<Courier> allCouriers = courierService.getAllCouriers();

        Map<String, Long> statusDistribution = new HashMap<>();
        for (CourierStatus status : CourierStatus.values()) {
            long count = allCouriers.stream().filter(c -> c.getStatus() == status).count();
            statusDistribution.put(status.name(), count);
        }

        AdminDashboardDto dto = AdminDashboardDto.builder()
                .totalCouriers(courierService.countTotalCouriers())
                .deliveredCouriers(courierService.countDeliveredCouriers())
                .totalCustomers(userService.countUsersByRole(RoleType.ROLE_USER))
                .totalEmployees(userService.countUsersByRole(RoleType.ROLE_EMPLOYEE))
                .pendingEmployeesCount(userService.getPendingEmployees().size())
                .totalRevenue(transactionService.getTotalRevenue())
                .totalCOD(transactionService.getTotalCOD())
                .totalVolume(transactionService.getTotalTransactionValue())
                .statusDistribution(statusDistribution)
                .recentCouriers(allCouriers.stream().limit(10).map(CourierResponseDto::fromEntity).collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/staff-approval")
    public ResponseEntity<ApiResponse<List<UserDto>>> getPendingStaff() {
        List<UserDto> pending = userService.getPendingEmployees().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(pending));
    }

    @PostMapping("/approve-staff/{id}")
    public ResponseEntity<ApiResponse<String>> approveStaff(@PathVariable Long id) {
        try {
            userService.approveEmployee(id);
            return ResponseEntity.ok(ApiResponse.ok("Employee account approved successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, List<UserDto>>>> getUsersDirectory() {
        List<UserDto> customers = userService.getUsersByRole(RoleType.ROLE_USER).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());

        List<UserDto> employees = userService.getUsersByRole(RoleType.ROLE_EMPLOYEE).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());

        Map<String, List<UserDto>> result = new HashMap<>();
        result.put("customers", customers);
        result.put("employees", employees);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/toggle-user-status/{id}")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long id) {
        try {
            userService.toggleUserStatus(id);
            return ResponseEntity.ok(ApiResponse.ok("User status toggled successfully.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactions() {
        List<TransactionResponseDto> txList = transactionService.getAllTransactions().stream()
                .map(TransactionResponseDto::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("transactions", txList);
        result.put("totalRevenue", transactionService.getTotalRevenue());
        result.put("totalCOD", transactionService.getTotalCOD());
        result.put("totalVolume", transactionService.getTotalTransactionValue());

        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
