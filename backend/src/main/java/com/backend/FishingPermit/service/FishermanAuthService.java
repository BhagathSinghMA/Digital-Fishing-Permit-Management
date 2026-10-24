package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.ApiResponse;
import com.backend.FishingPermit.dto.FishermanLoginRequest;
import com.backend.FishingPermit.dto.FishermanResponse;
import com.backend.FishingPermit.dto.VerifyOtpRequest;
import com.backend.FishingPermit.entity.Fisherman;
import com.backend.FishingPermit.repository.FishermanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FishermanAuthService {

    private final FishermanRepository fishermanRepository;
    private final OtpService otpService;

    public FishermanAuthService(FishermanRepository fishermanRepository, OtpService otpService) {
        this.fishermanRepository = fishermanRepository;
        this.otpService = otpService;
    }

    public ResponseEntity<ApiResponse> sendOtp(FishermanLoginRequest request) {
        if (request.getFishermanId() == null || request.getFishermanId().trim().isEmpty()) {
            System.out.println("[FISHERMAN OTP] Request rejected: Fisherman ID is empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Fisherman ID cannot be empty"));
        }

        String fishermanId = request.getFishermanId().trim().toUpperCase();
        System.out.println("[FISHERMAN OTP] Request received for ID: " + fishermanId);
        System.out.println("[FISHERMAN OTP] Database lookup started");

        Optional<Fisherman> fishermanOpt = fishermanRepository.findByFishermanId(fishermanId);
        if (fishermanOpt.isEmpty()) {
            System.out.println("[FISHERMAN OTP] Fisherman found: false");
            System.out.println("[FISHERMAN OTP] OTP NOT generated");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Fisherman ID not found"));
        }

        Fisherman fisherman = fishermanOpt.get();
        System.out.println("[FISHERMAN OTP] Fisherman found: true");

        if (fisherman.getPhoneNumber() == null || fisherman.getPhoneNumber().trim().isEmpty()) {
            System.out.println("[FISHERMAN OTP] Request rejected: No registered phone number found for fisherman");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Registered phone number not found for this Fisherman ID"));
        }

        otpService.generateOtp(fishermanId, fisherman.getPhoneNumber());

        FishermanResponse fishermanResponse = FishermanResponse.builder()
                .id(1)
                .fishermanId(fisherman.getFishermanId())
                .name(fisherman.getName())
                .phoneNumber(fisherman.getPhoneNumber())
                .build();

        return ResponseEntity.ok(ApiResponse.successFisherman("OTP generated successfully", fishermanResponse));
    }

    public ResponseEntity<ApiResponse> verifyOtp(VerifyOtpRequest request) {
        String fishermanIdKey = request.getFishermanId() != null && !request.getFishermanId().trim().isEmpty()
                ? request.getFishermanId().trim().toUpperCase()
                : (request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim().toUpperCase() : "");

        if (fishermanIdKey.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Fisherman ID cannot be empty"));
        }

        String inputOtp = request.getOtp() != null ? request.getOtp().trim() : "";

        Optional<Fisherman> fishermanOpt = fishermanRepository.findByFishermanId(fishermanIdKey);
        if (fishermanOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Fisherman ID not found"));
        }

        OtpService.OtpValidationResult result = otpService.verifyOtp(fishermanIdKey, inputOtp);

        if (result == OtpService.OtpValidationResult.EXPIRED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("OTP Expired"));
        }

        if (result == OtpService.OtpValidationResult.INVALID) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid OTP"));
        }

        Fisherman fisherman = fishermanOpt.get();

        FishermanResponse fishermanResponse = FishermanResponse.builder()
                .id(1)
                .fishermanId(fisherman.getFishermanId())
                .name(fisherman.getName())
                .phoneNumber(fisherman.getPhoneNumber())
                .build();

        return ResponseEntity.ok(ApiResponse.successFisherman("Login Successful", fishermanResponse));
    }
}
