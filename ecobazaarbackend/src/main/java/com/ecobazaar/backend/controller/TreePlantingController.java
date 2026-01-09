package com.ecobazaar.backend.controller;

import com.ecobazaar.backend.entity.TreePlantingSubmission;
import com.ecobazaar.backend.service.TreePlantingService;
import com.ecobazaar.backend.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tree-planting")
@CrossOrigin(origins = "*")
public class TreePlantingController {
    
    @Autowired
    private TreePlantingService treePlantingService;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitTreePlanting(
            @RequestParam("orderId") Long orderId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "description", required = false) String description) {
        try {
            Long userId = getCurrentUserId();
            TreePlantingSubmission submission = treePlantingService.submitTreePlanting(userId, orderId, image, description);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/my-submissions")
    public ResponseEntity<List<TreePlantingSubmission>> getMySubmissions() {
        try {
            Long userId = getCurrentUserId();
            List<TreePlantingSubmission> submissions = treePlantingService.getUserSubmissions(userId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<TreePlantingSubmission>> getAllSubmissions() {
        try {
            List<TreePlantingSubmission> submissions = treePlantingService.getAllSubmissions();
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<TreePlantingSubmission>> getPendingSubmissions() {
        try {
            List<TreePlantingSubmission> submissions = treePlantingService.getPendingSubmissions();
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/review/{submissionId}")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> request) {
        try {
            Long adminId = getCurrentUserId();
            boolean approved = (Boolean) request.get("approved");
            String adminNotes = (String) request.get("adminNotes");
            
            TreePlantingSubmission submission = treePlantingService.reviewSubmission(submissionId, approved, adminNotes, adminId);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            Long pendingCount = treePlantingService.getPendingSubmissionsCount();
            Long approvedCount = treePlantingService.getApprovedSubmissionsCount();
            
            return ResponseEntity.ok(Map.of(
                "pendingSubmissions", pendingCount,
                "approvedSubmissions", approvedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.getUserIdByUsername(username);
    }
}
