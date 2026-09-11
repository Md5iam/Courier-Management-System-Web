package org.example.couriermanagmentsystemweb.dto.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardDto {
    private UserDto employee;
    private int pendingZoneCount;
    private long pickupTaskCount;
    private int incomingCount;
    private long deliveryTaskCount;
    private List<CourierResponseDto> recentTasks;
}
