package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.ApiResponse;
import com.backend.FishingPermit.dto.FishermanLoginRequest;
import com.backend.FishingPermit.dto.VerifyOtpRequest;
import com.backend.FishingPermit.service.FishermanAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/fisherman")
@CrossOrigin(origins = "*")
public class FishermanAuthController {

    private final FishermanAuthService fishermanAuthService;

    public FishermanAuthController(FishermanAuthService fishermanAuthService) {
        this.fishermanAuthService = fishermanAuthService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody FishermanLoginRequest request) {
        return fishermanAuthService.sendOtp(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return fishermanAuthService.verifyOtp(request);
    }
}
