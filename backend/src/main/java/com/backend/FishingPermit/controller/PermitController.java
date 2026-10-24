package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.LivePermitResponse;
import com.backend.FishingPermit.dto.PermitHistoryResponse;
import com.backend.FishingPermit.service.PermitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PermitController {

    private final PermitService permitService;

    public PermitController(PermitService permitService) {
        this.permitService = permitService;
    }

    @PostMapping("/permit/apply")
    public ResponseEntity<com.backend.FishingPermit.dto.PermitResponse> applyPermit(
            @jakarta.validation.Valid @RequestBody com.backend.FishingPermit.dto.PermitRequest request
    ) {
        com.backend.FishingPermit.dto.PermitResponse response = permitService.applyPermit(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/permits/history")
    public ResponseEntity<List<PermitHistoryResponse>> getPermitHistory(
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber
    ) {
        List<PermitHistoryResponse> history = permitService.getPermitHistory(registrationNumber);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/permit/live")
    public ResponseEntity<LivePermitResponse> getLivePermit(
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber
    ) {
        LivePermitResponse response = permitService.getLivePermit(registrationNumber);
        return ResponseEntity.ok(response);
    }
}
