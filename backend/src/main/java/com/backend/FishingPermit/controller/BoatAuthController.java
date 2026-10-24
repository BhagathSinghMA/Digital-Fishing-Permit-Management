package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.ApiResponse;
import com.backend.FishingPermit.dto.BoatLoginRequest;
import com.backend.FishingPermit.dto.VerifyOtpRequest;
import com.backend.FishingPermit.service.BoatAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/boat")
@CrossOrigin(origins = "*")
public class BoatAuthController {

    private final BoatAuthService boatAuthService;

    public BoatAuthController(BoatAuthService boatAuthService) {
        this.boatAuthService = boatAuthService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody BoatLoginRequest request) {
        return boatAuthService.sendOtp(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return boatAuthService.verifyOtp(request);
    }
}
