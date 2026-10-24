package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.ApplicationStatusResponse;
import com.backend.FishingPermit.dto.SystemSettingsResponse;
import com.backend.FishingPermit.dto.UpdateApplicationStatusRequest;
import com.backend.FishingPermit.service.SystemSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SystemSettingsService systemSettingsService;

    public SettingsController(SystemSettingsService systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }

    @GetMapping("/api/admin/settings")
    public ResponseEntity<SystemSettingsResponse> getAdminSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    @PutMapping("/api/admin/settings/application-status")
    public ResponseEntity<SystemSettingsResponse> updateApplicationStatus(
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            @RequestHeader(value = "X-Admin-User", required = false, defaultValue = "Admin") String adminUser
    ) {
        return ResponseEntity.ok(systemSettingsService.updateApplicationStatus(request, adminUser));
    }

    @GetMapping("/api/app/application-status")
    public ResponseEntity<ApplicationStatusResponse> getMobileAppStatus() {
        return ResponseEntity.ok(systemSettingsService.getMobileAppStatus());
    }
}
