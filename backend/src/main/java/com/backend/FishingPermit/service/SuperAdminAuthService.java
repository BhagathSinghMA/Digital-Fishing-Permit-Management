package com.backend.FishingPermit.service;

import com.backend.FishingPermit.config.JwtTokenProvider;
import com.backend.FishingPermit.dto.SuperAdminChangePasswordRequest;
import com.backend.FishingPermit.dto.SuperAdminLoginRequest;
import com.backend.FishingPermit.dto.SuperAdminLoginResponse;
import com.backend.FishingPermit.dto.SuperAdminProfileResponse;
import com.backend.FishingPermit.entity.AdminUser;
import com.backend.FishingPermit.repository.AdminUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class SuperAdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public SuperAdminAuthService(AdminUserRepository adminUserRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtTokenProvider jwtTokenProvider) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostConstruct
    public void initSuperAdmin() {
        if (!adminUserRepository.existsByUsername("superadmin")) {
            AdminUser superAdmin = AdminUser.builder()
                    .username("superadmin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("Director of Fisheries & Port Authority")
                    .email("director.fisheries@tn.gov.in")
                    .role("SUPER_ADMIN")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            adminUserRepository.save(superAdmin);
        }
    }

    public SuperAdminLoginResponse login(SuperAdminLoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Super Admin credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Super Admin credentials");
        }

        String token = jwtTokenProvider.generateToken(admin.getUsername(), admin.getRole());

        return SuperAdminLoginResponse.builder()
                .success(true)
                .message("Super Admin authenticated successfully")
                .token(token)
                .username(admin.getUsername())
                .fullName(admin.getFullName())
                .role(admin.getRole())
                .build();
    }

    public SuperAdminProfileResponse getProfile(String username) {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return SuperAdminProfileResponse.builder()
                .username(admin.getUsername())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .role(admin.getRole())
                .designation("State Fisheries Commissioner & Super Administrator")
                .department("Department of Fisheries and Fishermen Welfare, Govt of Tamil Nadu")
                .build();
    }

    @Transactional
    public void changePassword(String username, SuperAdminChangePasswordRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        admin.setUpdatedAt(LocalDateTime.now());
        adminUserRepository.save(admin);
    }
}
