package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.service.OfficerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@CrossOrigin(origins = "*")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    @GetMapping("/permits/pending")
    public ResponseEntity<List<PendingPermitResponse>> getPendingPermits() {
        List<PendingPermitResponse> pendingList = officerService.getPendingPermits();
        return ResponseEntity.ok(pendingList);
    }

    @GetMapping("/permit/{id}")
    public ResponseEntity<PendingPermitResponse> getPermitDetails(@PathVariable("id") Long id) {
        PendingPermitResponse response = officerService.getPermitDetails(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/permit/{id}/approve")
    public ResponseEntity<PermitResponse> approvePermit(
            @PathVariable("id") Long id,
            @RequestBody(required = false) OfficerApprovalRequest request
    ) {
        PermitResponse response = officerService.approvePermit(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/permit/{id}/reject")
    public ResponseEntity<PermitResponse> rejectPermit(
            @PathVariable("id") Long id,
            @RequestBody(required = false) OfficerRejectRequest request
    ) {
        PermitResponse response = officerService.rejectPermit(id, request);
        return ResponseEntity.ok(response);
    }
}
