package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.AdminPermitDetailResponse;
import com.backend.FishingPermit.dto.AdminPermitListItem;
import com.backend.FishingPermit.dto.OfficerRejectRequest;
import com.backend.FishingPermit.dto.PageResponse;
import com.backend.FishingPermit.dto.PermitResponse;
import com.backend.FishingPermit.service.AdminPermitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/permits")
@CrossOrigin(origins = "*")
public class AdminPermitController {

    private final AdminPermitService adminPermitService;

    public AdminPermitController(AdminPermitService adminPermitService) {
        this.adminPermitService = adminPermitService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<AdminPermitListItem>> getPermits(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size) {
        return ResponseEntity.ok(adminPermitService.getPermits(status, search, date, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminPermitDetailResponse> getPermitDetails(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminPermitService.getPermitDetails(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<PermitResponse> approvePermit(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminPermitService.approvePermit(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<PermitResponse> rejectPermit(
            @PathVariable("id") Long id,
            @RequestBody(required = false) OfficerRejectRequest request) {
        String reason = (request != null) ? request.getReason() : null;
        return ResponseEntity.ok(adminPermitService.rejectPermit(id, reason));
    }
}
