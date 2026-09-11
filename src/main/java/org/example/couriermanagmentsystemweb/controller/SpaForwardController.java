package org.example.couriermanagmentsystemweb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/track",
            "/login",
            "/register",
            "/employee/register",
            "/user/**",
            "/employee/**",
            "/admin/**"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
