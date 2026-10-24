package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.service.OfficerDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officers")
@CrossOrigin(origins = "*")
public class OfficerManagementController {

    private final OfficerDetailsService officerDetailsService;

    public OfficerManagementController(OfficerDetailsService officerDetailsService) {
        this.officerDetailsService = officerDetailsService;
    }

    @GetMapping
    public ResponseEntity<List<OfficerResponse>> getAllOfficers(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "harborPort", required = false) String harborPort
    ) {
        List<OfficerResponse> officers = officerDetailsService.getAllOfficers(query, status, harborPort);
        return ResponseEntity.ok(officers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficerResponse> getOfficerById(@PathVariable("id") Long id) {
        OfficerResponse officer = officerDetailsService.getOfficerById(id);
        return ResponseEntity.ok(officer);
    }

    @PostMapping
    public ResponseEntity<OfficerResponse> createOfficer(@Valid @RequestBody OfficerRequest request) {
        OfficerResponse created = officerDetailsService.createOfficer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfficerResponse> updateOfficer(
            @PathVariable("id") Long id,
            @Valid @RequestBody OfficerRequest request
    ) {
        OfficerResponse updated = officerDetailsService.updateOfficer(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteOfficer(@PathVariable("id") Long id) {
        officerDetailsService.deleteOfficer(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Officer account deleted successfully",
                "id", id
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OfficerResponse> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        OfficerResponse updated = officerDetailsService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @PathVariable("id") Long id,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        OfficerResponse updated = officerDetailsService.resetPassword(id, request.getNewPassword());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset successfully for officer: " + updated.getName(),
                "officerId", updated.getOfficerId(),
                "username", updated.getUsername()
        ));
    }
}
