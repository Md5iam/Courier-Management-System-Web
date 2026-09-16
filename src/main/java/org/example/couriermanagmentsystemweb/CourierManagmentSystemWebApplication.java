package org.example.couriermanagmentsystemweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CourierManagmentSystemWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourierManagmentSystemWebApplication.class, args);
    }

}
