package com.ecobazaar.backend.service;

import com.ecobazaar.backend.entity.Profile;
import com.ecobazaar.backend.entity.User;
import com.ecobazaar.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create a new profile if it doesn't exist
                    Profile newProfile = new Profile();
                    User user = new User();
                    user.setId(userId);
                    newProfile.setUser(user);
                    return profileRepository.save(newProfile);
                });
    }

    public Profile updateProfile(Long userId, Profile profileData) {
        Profile existingProfile = getProfileByUserId(userId);
        
        // Update profile fields
        if (profileData.getBusinessName() != null) {
            existingProfile.setBusinessName(profileData.getBusinessName());
        }
        if (profileData.getBusinessDescription() != null) {
            existingProfile.setBusinessDescription(profileData.getBusinessDescription());
        }
        if (profileData.getBusinessEmail() != null) {
            existingProfile.setBusinessEmail(profileData.getBusinessEmail());
        }
        if (profileData.getBusinessPhone() != null) {
            existingProfile.setBusinessPhone(profileData.getBusinessPhone());
        }
        if (profileData.getBusinessAddress() != null) {
            existingProfile.setBusinessAddress(profileData.getBusinessAddress());
        }
        if (profileData.getWebsite() != null) {
            existingProfile.setWebsite(profileData.getWebsite());
        }
        if (profileData.getBusinessLicense() != null) {
            existingProfile.setBusinessLicense(profileData.getBusinessLicense());
        }
        if (profileData.getTaxId() != null) {
            existingProfile.setTaxId(profileData.getTaxId());
        }
        if (profileData.getEcoCertification() != null) {
            existingProfile.setEcoCertification(profileData.getEcoCertification());
        }
        
        return profileRepository.save(existingProfile);
    }

    public Profile save(Profile profile) {
        return profileRepository.save(profile);
    }
}
