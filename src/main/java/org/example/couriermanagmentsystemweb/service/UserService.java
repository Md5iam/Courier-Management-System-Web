package org.example.couriermanagmentsystemweb.service;

import org.example.couriermanagmentsystemweb.dto.UserRegisterDto;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.RoleType;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(UserRegisterDto registerDto);
    Optional<User> findByEmail(String email);
    List<User> getUsersByRole(RoleType roleType);
    List<User> getPendingEmployees();
    void approveEmployee(Long employeeId);
    void toggleUserStatus(Long userId);
    long countUsersByRole(RoleType roleType);
}
