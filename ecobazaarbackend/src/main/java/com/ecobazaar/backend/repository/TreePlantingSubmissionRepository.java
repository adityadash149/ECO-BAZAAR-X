package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.TreePlantingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreePlantingSubmissionRepository extends JpaRepository<TreePlantingSubmission, Long> {
    
    List<TreePlantingSubmission> findByUserIdOrderBySubmittedAtDesc(Long userId);
    
    List<TreePlantingSubmission> findByOrderId(Long orderId);
    
    List<TreePlantingSubmission> findByStatusOrderBySubmittedAtDesc(TreePlantingSubmission.SubmissionStatus status);
    
    List<TreePlantingSubmission> findAllByOrderBySubmittedAtDesc();
    
    Optional<TreePlantingSubmission> findByUserIdAndOrderId(Long userId, Long orderId);
    
    @Query("SELECT t FROM TreePlantingSubmission t WHERE t.user.id = :userId AND t.status = :status ORDER BY t.submittedAt DESC")
    List<TreePlantingSubmission> findByUserIdAndStatus(Long userId, TreePlantingSubmission.SubmissionStatus status);
    
    @Query("SELECT COUNT(t) FROM TreePlantingSubmission t WHERE t.user.id = :userId AND t.status = 'APPROVED'")
    Long countApprovedSubmissionsByUserId(Long userId);
    
    @Query("SELECT COUNT(t) FROM TreePlantingSubmission t WHERE t.status = :status")
    Long countByStatus(TreePlantingSubmission.SubmissionStatus status);
}
