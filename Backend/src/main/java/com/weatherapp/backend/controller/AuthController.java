package com.weatherapp.backend.controller;

import com.weatherapp.backend.entity.User;
import com.weatherapp.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) Map<String, Object> credentials) {
        String username = credentials != null ? String.valueOf(credentials.get("username")) : "";
        String password = credentials != null ? String.valueOf(credentials.get("password")) : "";

        if (username == null || username.trim().isEmpty() || "null".equals(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        if (password == null || password.trim().isEmpty() || "null".equals(password)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        // Check against database
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPassword();

            System.out.println("Login attempt: username=" + username + ", input_password='" + password + "', stored_password='" + storedPassword + "'");

            // Check if password matches the stored password (using BCrypt)
            if (passwordEncoder.matches(password, storedPassword)) {
                return ResponseEntity.ok(Map.of("token", "demo-jwt-token-" + System.currentTimeMillis(), "message", "Login successful"));
            } else {
                System.out.println("Password mismatch!");
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody(required = false) Map<String, Object> userData) {
        // Demo mode: accept any registration request (completely unrestricted)
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}