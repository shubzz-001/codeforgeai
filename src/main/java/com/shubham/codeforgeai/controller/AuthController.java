package com.shubham.codeforgeai.controller;

import com.shubham.codeforgeai.dto.LoginRequest;
import com.shubham.codeforgeai.dto.SignUpRequest;
import com.shubham.codeforgeai.model.Role;
import com.shubham.codeforgeai.model.User;
import com.shubham.codeforgeai.repository.UserRepository;
import com.shubham.codeforgeai.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody SignUpRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error : Email already exists, try using another one");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException(" Error : User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException(" Error : Wrong password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String,Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", user.getEmail());
        response.put("role", user.getRole() != null ? user.getRole() : Role.ROLE_USER);

        return ResponseEntity.ok(response);
    }

}
