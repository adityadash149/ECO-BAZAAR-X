package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(Long userId, User profileData) {
        User user = findById(userId);
        
        // Update profile fields
        if (profileData.getFirstName() != null) {
            user.setFirstName(profileData.getFirstName());
        }
        if (profileData.getLastName() != null) {
            user.setLastName(profileData.getLastName());
        }
        if (profileData.getEmail() != null) {
            user.setEmail(profileData.getEmail());
        }
        
        return userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
