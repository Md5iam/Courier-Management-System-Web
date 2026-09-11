package org.example.couriermanagmentsystemweb.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.dto.UserRegisterDto;
import org.example.couriermanagmentsystemweb.entity.Role;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.RoleType;
import org.example.couriermanagmentsystemweb.repository.RoleRepository;
import org.example.couriermanagmentsystemweb.repository.UserRepository;
import org.example.couriermanagmentsystemweb.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User registerUser(UserRegisterDto registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new IllegalArgumentException("Email address is already in use.");
        }

        User user = new User();
        user.setFullName(registerDto.getFullName());
        user.setEmail(registerDto.getEmail());
        user.setPhone(registerDto.getPhone());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        RoleType targetRole = RoleType.ROLE_USER;
        if ("EMPLOYEE".equalsIgnoreCase(registerDto.getRoleType())) {
            targetRole = RoleType.ROLE_EMPLOYEE;
            user.setAssignedZone(registerDto.getAssignedZone());
            user.setEnabled(false); // Employee registration requires admin approval
        } else if ("ADMIN".equalsIgnoreCase(registerDto.getRoleType())) {
            targetRole = RoleType.ROLE_ADMIN;
            user.setEnabled(true);
        } else {
            user.setEnabled(true); // Normal customers enabled by default
        }

        final RoleType roleToAssign = targetRole;
        Role role = roleRepository.findByName(roleToAssign)
                .orElseGet(() -> roleRepository.save(new Role(roleToAssign)));
        user.getRoles().add(role);

        User savedUser = userRepository.save(user);
        log.info("Registered new user {} with role {}", savedUser.getEmail(), roleToAssign);
        return savedUser;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getUsersByRole(RoleType roleType) {
        return userRepository.findByRoleName(roleType);
    }

    @Override
    public List<User> getPendingEmployees() {
        return userRepository.findPendingEmployees();
    }

    @Override
    @Transactional
    public void approveEmployee(Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        employee.setEnabled(true);
        userRepository.save(employee);
        log.info("Approved employee account {}", employee.getEmail());
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    @Override
    public long countUsersByRole(RoleType roleType) {
        return userRepository.findByRoleName(roleType).size();
    }
}
