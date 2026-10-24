package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.ApiResponse;
import com.backend.FishingPermit.dto.BoatLoginRequest;
import com.backend.FishingPermit.dto.VerifyOtpRequest;
import com.backend.FishingPermit.entity.BoatOwner;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class BoatAuthService {

    private final BoatOwnerRepository boatOwnerRepository;
    private final OtpService otpService;

    public BoatAuthService(BoatOwnerRepository boatOwnerRepository, OtpService otpService) {
        this.boatOwnerRepository = boatOwnerRepository;
        this.otpService = otpService;
    }

    public ResponseEntity<ApiResponse> sendOtp(BoatLoginRequest request) {
        String regNum = request.getRegistrationNumber().trim().toUpperCase();

        Optional<BoatOwner> boatOwnerOpt = boatOwnerRepository.findByRegistrationNumber(regNum);
        if (boatOwnerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Boat Registration Number not found"));
        }

        BoatOwner boatOwner = boatOwnerOpt.get();
        otpService.generateOtp(regNum);

        Map<String, Object> boatOwnerData = new HashMap<>();
        boatOwnerData.put("id", boatOwner.getId());
        boatOwnerData.put("registrationNumber", boatOwner.getRegistrationNumber());
        boatOwnerData.put("ownerName", boatOwner.getOwnerName());
        boatOwnerData.put("phoneNumber", boatOwner.getPhoneNumber());

        return ResponseEntity.ok(ApiResponse.success("OTP generated successfully", boatOwnerData));
    }

    public ResponseEntity<ApiResponse> verifyOtp(VerifyOtpRequest request) {
        String regNum = request.getRegistrationNumber().trim().toUpperCase();
        String inputOtp = request.getOtp().trim();

        Optional<BoatOwner> boatOwnerOpt = boatOwnerRepository.findByRegistrationNumber(regNum);
        if (boatOwnerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Boat Registration Number not found"));
        }

        OtpService.OtpValidationResult result = otpService.verifyOtp(regNum, inputOtp);

        if (result == OtpService.OtpValidationResult.EXPIRED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("OTP Expired"));
        }

        if (result == OtpService.OtpValidationResult.INVALID) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid OTP"));
        }

        BoatOwner boatOwner = boatOwnerOpt.get();

        Map<String, Object> boatOwnerData = new HashMap<>();
        boatOwnerData.put("id", boatOwner.getId());
        boatOwnerData.put("registrationNumber", boatOwner.getRegistrationNumber());
        boatOwnerData.put("ownerName", boatOwner.getOwnerName());
        boatOwnerData.put("phoneNumber", boatOwner.getPhoneNumber());

        return ResponseEntity.ok(ApiResponse.success("Login successful", boatOwnerData));
    }
}
