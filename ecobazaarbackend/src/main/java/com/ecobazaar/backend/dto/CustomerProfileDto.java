package com.ecobazaar.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CustomerProfileDto {
    
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean newsletter;
    private Boolean ecoTips;
    private Double carbonSaved;
    private Integer ecoPoints;
    private Integer treesPlanted;
    private LocalDateTime memberSince;
    
    // Constructors
    public CustomerProfileDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getStreetAddress() {
        return streetAddress;
    }
    
    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getZipCode() {
        return zipCode;
    }
    
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public Boolean getEmailNotifications() {
        return emailNotifications;
    }
    
    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }
    
    public Boolean getSmsNotifications() {
        return smsNotifications;
    }
    
    public void setSmsNotifications(Boolean smsNotifications) {
        this.smsNotifications = smsNotifications;
    }
    
    public Boolean getNewsletter() {
        return newsletter;
    }
    
    public void setNewsletter(Boolean newsletter) {
        this.newsletter = newsletter;
    }
    
    public Boolean getEcoTips() {
        return ecoTips;
    }
    
    public void setEcoTips(Boolean ecoTips) {
        this.ecoTips = ecoTips;
    }
    
    public Double getCarbonSaved() {
        return carbonSaved;
    }
    
    public void setCarbonSaved(Double carbonSaved) {
        this.carbonSaved = carbonSaved;
    }
    
    public Integer getEcoPoints() {
        return ecoPoints;
    }
    
    public void setEcoPoints(Integer ecoPoints) {
        this.ecoPoints = ecoPoints;
    }
    
    public Integer getTreesPlanted() {
        return treesPlanted;
    }
    
    public void setTreesPlanted(Integer treesPlanted) {
        this.treesPlanted = treesPlanted;
    }
    
    public LocalDateTime getMemberSince() {
        return memberSince;
    }
    
    public void setMemberSince(LocalDateTime memberSince) {
        this.memberSince = memberSince;
    }
}
