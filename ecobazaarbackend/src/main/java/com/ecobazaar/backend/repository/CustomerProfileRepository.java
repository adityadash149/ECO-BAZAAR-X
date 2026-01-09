package com.ecobazaar.backend.repository;

import com.ecobazaar.backend.entity.CustomerProfile;
import com.ecobazaar.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {
    
    Optional<CustomerProfile> findByUser(User user);
    
    Optional<CustomerProfile> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
}
