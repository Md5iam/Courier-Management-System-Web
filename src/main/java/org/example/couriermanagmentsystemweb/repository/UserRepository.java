package org.example.couriermanagmentsystemweb.repository;

import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleType")
    List<User> findByRoleName(RoleType roleType);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_EMPLOYEE' AND u.enabled = false")
    List<User> findPendingEmployees();
}
