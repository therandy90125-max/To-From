package com.toandfrom.toandfrom.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "✅ ToAndFrom Backend is running successfully!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "✅ ToAndFrom Backend is healthy!";
    }

}

