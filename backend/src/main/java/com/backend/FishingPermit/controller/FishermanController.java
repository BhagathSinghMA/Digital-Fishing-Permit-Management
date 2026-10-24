package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.FishermanHomeResponse;
import com.backend.FishingPermit.dto.FishermanLivePermitResponse;
import com.backend.FishingPermit.dto.FishermanPermitHistoryResponse;
import com.backend.FishingPermit.dto.FishermanProfileResponse;
import com.backend.FishingPermit.service.FishermanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fisherman")
@CrossOrigin(origins = "*")
public class FishermanController {

    private final FishermanService fishermanService;

    public FishermanController(FishermanService fishermanService) {
        this.fishermanService = fishermanService;
    }

    @GetMapping("/home")
    public ResponseEntity<FishermanHomeResponse> getHomeData(
            @RequestParam(name = "fishermanId", required = false, defaultValue = "FSH123456") String fishermanId) {
        return ResponseEntity.ok(fishermanService.getHomeData(fishermanId));
    }

    @GetMapping("/permit/live")
    public ResponseEntity<FishermanLivePermitResponse> getLivePermit(
            @RequestParam(name = "fishermanId", required = false, defaultValue = "FSH123456") String fishermanId) {
        return ResponseEntity.ok(fishermanService.getLivePermit(fishermanId));
    }

    @GetMapping("/permits/history")
    public ResponseEntity<List<FishermanPermitHistoryResponse>> getPermitHistory(
            @RequestParam(name = "fishermanId", required = false, defaultValue = "FSH123456") String fishermanId) {
        return ResponseEntity.ok(fishermanService.getPermitHistory(fishermanId));
    }

    @GetMapping("/profile")
    public ResponseEntity<FishermanProfileResponse> getProfile(
            @RequestParam(name = "fishermanId", required = false, defaultValue = "FSH123456") String fishermanId) {
        return ResponseEntity.ok(fishermanService.getProfile(fishermanId));
    }
}
