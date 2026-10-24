package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.AdminPermitListItem;
import com.backend.FishingPermit.dto.DashboardStatsResponse;
import com.backend.FishingPermit.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/dashboard", "/api/super-admin/dashboard"})
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(value = "harbor", required = false) String harbor) {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats(harbor));
    }

    @GetMapping("/recent-permits")
    public ResponseEntity<List<AdminPermitListItem>> getRecentPermits(
            @RequestParam(value = "harbor", required = false) String harbor,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminDashboardService.getRecentPermits(harbor, limit));
    }
}
