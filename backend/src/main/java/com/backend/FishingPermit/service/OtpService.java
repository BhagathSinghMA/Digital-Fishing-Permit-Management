package com.backend.FishingPermit.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpData {
        private String otp;
        private LocalDateTime createdTime;
        private LocalDateTime expiryTime;
    }

    private final ConcurrentHashMap<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private static final int OTP_VALIDITY_MINUTES = 5;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate 6-digit OTP (100000 - 999999) and store in memory map
     */
    public String generateOtp(String key) {
        return generateOtp(key, null);
    }

    /**
     * Generate 6-digit OTP with masked phone display in development terminal banner
     */
    public String generateOtp(String key, String phoneNumber) {
        int otpNum = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(otpNum);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusMinutes(OTP_VALIDITY_MINUTES);

        OtpData otpData = new OtpData(otp, now, expiry);
        otpStorage.put(key, otpData);

        String maskedPhone = maskPhoneNumber(phoneNumber);

        System.out.println("========================================");
        System.out.println("FISHERMAN / USER OTP GENERATED");
        System.out.println("Identifier   : " + key);
        if (maskedPhone != null && !maskedPhone.isEmpty()) {
            System.out.println("Phone        : " + maskedPhone);
        }
        System.out.println("OTP          : " + otp);
        System.out.println("Expires      : " + OTP_VALIDITY_MINUTES + " minutes");
        System.out.println("========================================");

        return otp;
    }

    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "******";
        }
        String clean = phone.trim();
        if (clean.length() <= 4) {
            return "******" + clean;
        }
        String last4 = clean.substring(clean.length() - 4);
        return "******" + last4;
    }

    public enum OtpValidationResult {
        SUCCESS,
        INVALID,
        EXPIRED
    }

    /**
     * Verify OTP for a registration number
     */
    public OtpValidationResult verifyOtp(String registrationNumber, String inputOtp) {
        OtpData otpData = otpStorage.get(registrationNumber);

        if (otpData == null) {
            return OtpValidationResult.INVALID;
        }

        if (!otpData.getOtp().equals(inputOtp)) {
            return OtpValidationResult.INVALID;
        }

        if (LocalDateTime.now().isAfter(otpData.getExpiryTime())) {
            otpStorage.remove(registrationNumber);
            return OtpValidationResult.EXPIRED;
        }

        // Single-use OTP: remove on successful validation
        otpStorage.remove(registrationNumber);
        return OtpValidationResult.SUCCESS;
    }

    /**
     * Clear OTP manually if required
     */
    public void clearOtp(String registrationNumber) {
        otpStorage.remove(registrationNumber);
    }
}
