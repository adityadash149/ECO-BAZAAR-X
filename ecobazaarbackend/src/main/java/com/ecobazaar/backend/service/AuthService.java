package com.ecobazaar.backend.service;

import com.ecobazaar.backend.dto.LoginRequest;
import com.ecobazaar.backend.dto.LoginResponse;
import com.ecobazaar.backend.dto.RegisterRequest;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.entity.Role;
import com.ecobazaar.backend.entity.CustomerProfile;
import com.ecobazaar.backend.repository.UserRepository;
import com.ecobazaar.backend.repository.CustomerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Password encoder removed for plain text passwords
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    public LoginResponse login(LoginRequest request) {
        // First check if user exists
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Invalid credentials. Please check your username and password."));
        
        // Check if user is blocked before authentication
        if (!user.getIsActive()) {
            if (user.getRole() == Role.SELLER) {
                throw new RuntimeException("Your seller account has been blocked due to policy violations or selling non-compliant products. Please contact support for assistance.");
            } else {
                throw new RuntimeException("Your account has been blocked. Please contact support for assistance.");
            }
        }
        
        // Delegate authentication to AuthenticationManager so the injected field is used
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception ex) {
            throw new RuntimeException("Invalid credentials. Please check your username and password.");
        }
        
        // If seller is not approved yet
        if (user.getRole() == Role.SELLER && !user.getIsActive()) {
            throw new RuntimeException("Your seller application is still pending approval. Please wait for admin approval.");
        }
        
        String token = jwtService.generateToken(user.getUsername());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());
        response.setMessage("Login successful");
        response.setUserId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        
        return response;
    }
    
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Store password as plain text
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        Role role = Role.valueOf(request.getRole().toUpperCase());
        user.setRole(role);

        if (role == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            user.setVerified(adminCount == 0);
        } else {
            user.setVerified(true);
        }

        userRepository.save(user);

        // Ensure a profile exists for the new user
        CustomerProfile profile = new CustomerProfile();
        profile.setUser(user);
        profile.setEmail(user.getEmail());
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        profile.setEcoPoints(0);
        profile.setCarbonSaved(0.0);
        profile.setTreesPlanted(0);
        customerProfileRepository.save(profile);

        String token = jwtService.generateToken(user.getUsername());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());
        response.setMessage("Registration successful");
        
        return response;
    }
}