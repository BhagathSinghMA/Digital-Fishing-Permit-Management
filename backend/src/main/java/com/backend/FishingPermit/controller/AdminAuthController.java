package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.config.JwtTokenProvider;
import com.backend.FishingPermit.dto.AdminChangePasswordRequest;
import com.backend.FishingPermit.dto.AdminLoginRequest;
import com.backend.FishingPermit.dto.AdminLoginResponse;
import com.backend.FishingPermit.dto.AdminProfileResponse;
import com.backend.FishingPermit.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    public AdminAuthController(AdminAuthService adminAuthService, JwtTokenProvider jwtTokenProvider) {
        this.adminAuthService = adminAuthService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminLoginResponse response = adminAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<AdminProfileResponse> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "username", required = false) String username
    ) {
        String targetUsername = username;
        if (targetUsername == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                targetUsername = jwtTokenProvider.getUsernameFromToken(token);
            }
        }
        if (targetUsername == null) {
            targetUsername = "admin";
        }
        AdminProfileResponse profile = adminAuthService.getProfile(targetUsername);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @Valid @RequestBody AdminChangePasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "username", required = false) String username
    ) {
        String targetUsername = username;
        if (targetUsername == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                targetUsername = jwtTokenProvider.getUsernameFromToken(token);
            }
        }
        if (targetUsername == null) {
            targetUsername = "admin";
        }
        adminAuthService.changePassword(targetUsername, request);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully"));
    }
}
