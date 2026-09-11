package org.example.couriermanagmentsystemweb.dto.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.couriermanagmentsystemweb.entity.Role;
import org.example.couriermanagmentsystemweb.entity.User;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String assignedZone;
    private boolean enabled;
    private List<String> roles;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .assignedZone(user.getAssignedZone())
                .enabled(user.isEnabled())
                .roles(user.getRoles() != null ? 
                        user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()) : 
                        List.of())
                .build();
    }
}
