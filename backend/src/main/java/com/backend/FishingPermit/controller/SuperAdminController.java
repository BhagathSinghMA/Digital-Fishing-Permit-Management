package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.config.JwtTokenProvider;
import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.service.OfficerDetailsService;
import com.backend.FishingPermit.service.SuperAdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private final SuperAdminAuthService superAdminAuthService;
    private final OfficerDetailsService officerDetailsService;
    private final JwtTokenProvider jwtTokenProvider;

    public SuperAdminController(SuperAdminAuthService superAdminAuthService,
                                OfficerDetailsService officerDetailsService,
                                JwtTokenProvider jwtTokenProvider) {
        this.superAdminAuthService = superAdminAuthService;
        this.officerDetailsService = officerDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<SuperAdminLoginResponse> login(@Valid @RequestBody SuperAdminLoginRequest request) {
        SuperAdminLoginResponse response = superAdminAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<SuperAdminDashboardStatsResponse> getDashboardStats() {
        SuperAdminDashboardStatsResponse stats = officerDetailsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/profile")
    public ResponseEntity<SuperAdminProfileResponse> getProfile(
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
            targetUsername = "superadmin";
        }
        SuperAdminProfileResponse profile = superAdminAuthService.getProfile(targetUsername);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @Valid @RequestBody SuperAdminChangePasswordRequest request,
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
            targetUsername = "superadmin";
        }
        superAdminAuthService.changePassword(targetUsername, request);
        return ResponseEntity.ok(Map.of("success", true, "message", "Super Admin password changed successfully"));
    }
}
