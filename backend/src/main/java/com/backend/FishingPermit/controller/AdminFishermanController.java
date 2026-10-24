package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.AdminFishermanRequest;
import com.backend.FishingPermit.dto.AdminFishermanResponse;
import com.backend.FishingPermit.dto.PageResponse;
import com.backend.FishingPermit.service.AdminFishermanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/fishermen")
@CrossOrigin(origins = "*")
public class AdminFishermanController {

    private final AdminFishermanService adminFishermanService;

    public AdminFishermanController(AdminFishermanService adminFishermanService) {
        this.adminFishermanService = adminFishermanService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<AdminFishermanResponse>> getFishermen(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminFishermanService.getFishermen(search, page, size));
    }

    @GetMapping("/{fishermanId}")
    public ResponseEntity<AdminFishermanResponse> getFisherman(@PathVariable("fishermanId") String fishermanId) {
        return ResponseEntity.ok(adminFishermanService.getFishermanById(fishermanId));
    }

    @PostMapping
    public ResponseEntity<AdminFishermanResponse> createFisherman(@Valid @RequestBody AdminFishermanRequest request) {
        AdminFishermanResponse response = adminFishermanService.createFisherman(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{fishermanId}")
    public ResponseEntity<AdminFishermanResponse> updateFisherman(
            @PathVariable("fishermanId") String fishermanId,
            @Valid @RequestBody AdminFishermanRequest request
    ) {
        return ResponseEntity.ok(adminFishermanService.updateFisherman(fishermanId, request));
    }

    @DeleteMapping("/{fishermanId}")
    public ResponseEntity<Map<String, Object>> deleteFisherman(@PathVariable("fishermanId") String fishermanId) {
        adminFishermanService.deleteFisherman(fishermanId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Fisherman deleted successfully"));
    }
}
