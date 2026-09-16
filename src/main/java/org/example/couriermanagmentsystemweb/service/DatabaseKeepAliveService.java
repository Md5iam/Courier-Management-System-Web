package org.example.couriermanagmentsystemweb.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseKeepAliveService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Periodic background ping to keep the database connection warm
     * and prevent Aiven MySQL from shutting down due to inactivity.
     * Runs every 4 minutes (240,000 ms).
     */
    @Scheduled(fixedRate = 240000, initialDelay = 60000)
    public void pingDatabase() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.debug("Internal database keep-alive heartbeat successful: {}", result);
        } catch (Exception e) {
            log.warn("Internal database keep-alive heartbeat failed: {}", e.getMessage());
        }
    }
}
