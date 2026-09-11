package org.example.couriermanagmentsystemweb.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.entity.Role;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.RoleType;
import org.example.couriermanagmentsystemweb.repository.RoleRepository;
import org.example.couriermanagmentsystemweb.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                roleRepository.save(new Role(roleType));
                log.info("Initialized role: {}", roleType);
            }
        }

        if (userRepository.findByEmail("admin@courier.com").isEmpty()) {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@courier.com");
            admin.setPhone("01700000000");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEnabled(true);

            Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN).orElseThrow();
            admin.getRoles().add(adminRole);

            userRepository.save(admin);
            log.info("Initialized default Admin account: admin@courier.com / admin123");
        }

        if (userRepository.findByEmail("customer@test.com").isEmpty()) {
            User customer = new User();
            customer.setFullName("Test Customer");
            customer.setEmail("customer@test.com");
            customer.setPhone("01711111111");
            customer.setPassword(passwordEncoder.encode("password123"));
            customer.setEnabled(true);

            Role userRole = roleRepository.findByName(RoleType.ROLE_USER).orElseThrow();
            customer.getRoles().add(userRole);

            userRepository.save(customer);
            log.info("Initialized default Customer account: customer@test.com / password123");
        }

        if (userRepository.findByEmail("employee@courier.com").isEmpty()) {
            User employee = new User();
            employee.setFullName("Dhaka Hub Agent");
            employee.setEmail("employee@courier.com");
            employee.setPhone("01800000000");
            employee.setPassword(passwordEncoder.encode("employee123"));
            employee.setAssignedZone("Dhaka");
            employee.setEnabled(true);

            Role empRole = roleRepository.findByName(RoleType.ROLE_EMPLOYEE).orElseThrow();
            employee.getRoles().add(empRole);

            userRepository.save(employee);
            log.info("Initialized default Employee account: employee@courier.com / employee123");
        }
    }
}
