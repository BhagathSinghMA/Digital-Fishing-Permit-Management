package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.AdminBoatOwnerRequest;
import com.backend.FishingPermit.dto.AdminBoatOwnerResponse;
import com.backend.FishingPermit.dto.PageResponse;
import com.backend.FishingPermit.service.AdminBoatOwnerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/boat-owners")
@CrossOrigin(origins = "*")
public class AdminBoatOwnerController {

    private final AdminBoatOwnerService adminBoatOwnerService;

    public AdminBoatOwnerController(AdminBoatOwnerService adminBoatOwnerService) {
        this.adminBoatOwnerService = adminBoatOwnerService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<AdminBoatOwnerResponse>> getBoatOwners(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminBoatOwnerService.getBoatOwners(search, page, size));
    }

    @GetMapping("/{registrationNumber}")
    public ResponseEntity<AdminBoatOwnerResponse> getBoatOwner(@PathVariable("registrationNumber") String registrationNumber) {
        return ResponseEntity.ok(adminBoatOwnerService.getBoatOwnerByRegNo(registrationNumber));
    }

    @PostMapping
    public ResponseEntity<AdminBoatOwnerResponse> createBoatOwner(@Valid @RequestBody AdminBoatOwnerRequest request) {
        AdminBoatOwnerResponse response = adminBoatOwnerService.createBoatOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{registrationNumber}")
    public ResponseEntity<AdminBoatOwnerResponse> updateBoatOwner(
            @PathVariable("registrationNumber") String registrationNumber,
            @Valid @RequestBody AdminBoatOwnerRequest request
    ) {
        return ResponseEntity.ok(adminBoatOwnerService.updateBoatOwner(registrationNumber, request));
    }

    @DeleteMapping("/{registrationNumber}")
    public ResponseEntity<Map<String, Object>> deleteBoatOwner(@PathVariable("registrationNumber") String registrationNumber) {
        adminBoatOwnerService.deleteBoatOwner(registrationNumber);
        return ResponseEntity.ok(Map.of("success", true, "message", "Boat owner deleted successfully"));
    }
}
