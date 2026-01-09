package com.ecobazaar.backend.dto;
import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private String message;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
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
	@Override
	public String toString() {
		return "LoginResponse [token=" + token + ", username=" + username + ", role=" + role + ", message=" + message
				+ "]";
	}
	public LoginResponse(String token, String username, String role, String message) {
		super();
		this.token = token;
		this.username = username;
		this.role = role;
		this.message = message;
	}
	public LoginResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
    
}
