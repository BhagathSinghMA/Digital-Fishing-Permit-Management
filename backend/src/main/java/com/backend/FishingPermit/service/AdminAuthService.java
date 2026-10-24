package com.backend.FishingPermit.service;

import com.backend.FishingPermit.config.JwtTokenProvider;
import com.backend.FishingPermit.dto.AdminChangePasswordRequest;
import com.backend.FishingPermit.dto.AdminLoginRequest;
import com.backend.FishingPermit.dto.AdminLoginResponse;
import com.backend.FishingPermit.dto.AdminProfileResponse;
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
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final com.backend.FishingPermit.repository.OfficerDetailsRepository officerDetailsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AdminAuthService(AdminUserRepository adminUserRepository,
                            com.backend.FishingPermit.repository.OfficerDetailsRepository officerDetailsRepository,
                            PasswordEncoder passwordEncoder,
                            JwtTokenProvider jwtTokenProvider) {
        this.adminUserRepository = adminUserRepository;
        this.officerDetailsRepository = officerDetailsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostConstruct
    public void initDefaultAdmin() {
        if (!adminUserRepository.existsByUsername("admin")) {
            AdminUser defaultAdmin = AdminUser.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("Principal Fisheries Officer")
                    .email("admin.fisheries@tn.gov.in")
                    .role("ROLE_SUPER_ADMIN")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            adminUserRepository.save(defaultAdmin);
        }
    }

    public AdminLoginResponse login(AdminLoginRequest request) {
        // 1. Check AdminUser table
        var adminOpt = adminUserRepository.findByUsername(request.getUsername());
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
            }
            String token = jwtTokenProvider.generateToken(admin.getUsername(), admin.getRole());
            return AdminLoginResponse.builder()
                    .success(true)
                    .message("Login successful")
                    .token(token)
                    .username(admin.getUsername())
                    .fullName(admin.getFullName())
                    .email(admin.getEmail())
                    .role(admin.getRole())
                    .build();
        }

        // 2. Check OfficerDetails table
        var officerOpt = officerDetailsRepository.findByUsername(request.getUsername());
        if (officerOpt.isPresent()) {
            var officer = officerOpt.get();
            if (!"ACTIVE".equalsIgnoreCase(officer.getStatus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your officer account is INACTIVE. Please contact the Super Admin.");
            }
            if (!passwordEncoder.matches(request.getPassword(), officer.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
            }
            String token = jwtTokenProvider.generateToken(officer.getUsername(), "ROLE_" + officer.getRole());
            return AdminLoginResponse.builder()
                    .success(true)
                    .message("Login successful")
                    .token(token)
                    .username(officer.getUsername())
                    .fullName(officer.getName())
                    .email(officer.getUsername() + "@fisheries.tn.gov.in")
                    .role("ROLE_" + officer.getRole())
                    .build();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    public AdminProfileResponse getProfile(String username) {
        var adminOpt = adminUserRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            return AdminProfileResponse.builder()
                    .username(admin.getUsername())
                    .fullName(admin.getFullName())
                    .email(admin.getEmail())
                    .role(admin.getRole())
                    .build();
        }

        var officerOpt = officerDetailsRepository.findByUsername(username);
        if (officerOpt.isPresent()) {
            var officer = officerOpt.get();
            return AdminProfileResponse.builder()
                    .username(officer.getUsername())
                    .fullName(officer.getName())
                    .email(officer.getUsername() + "@fisheries.tn.gov.in")
                    .role("ROLE_" + officer.getRole())
                    .build();
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    @Transactional
    public void changePassword(String username, AdminChangePasswordRequest request) {
        var adminOpt = adminUserRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match");
            }
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
            admin.setUpdatedAt(LocalDateTime.now());
            adminUserRepository.save(admin);
            return;
        }

        var officerOpt = officerDetailsRepository.findByUsername(username);
        if (officerOpt.isPresent()) {
            var officer = officerOpt.get();
            if (!passwordEncoder.matches(request.getCurrentPassword(), officer.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match");
            }
            officer.setPassword(passwordEncoder.encode(request.getNewPassword()));
            officer.setUpdatedAt(LocalDateTime.now());
            officerDetailsRepository.save(officer);
            return;
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
}
