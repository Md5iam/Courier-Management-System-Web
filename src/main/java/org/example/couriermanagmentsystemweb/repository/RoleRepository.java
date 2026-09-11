package org.example.couriermanagmentsystemweb.repository;

import org.example.couriermanagmentsystemweb.entity.Role;
import org.example.couriermanagmentsystemweb.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
