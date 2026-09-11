package org.example.couriermanagmentsystemweb.dto.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalCouriers;
    private long deliveredCouriers;
    private long totalCustomers;
    private long totalEmployees;
    private int pendingEmployeesCount;
    private Double totalRevenue;
    private Double totalCOD;
    private Double totalVolume;
    private Map<String, Long> statusDistribution;
    private List<CourierResponseDto> recentCouriers;
}
