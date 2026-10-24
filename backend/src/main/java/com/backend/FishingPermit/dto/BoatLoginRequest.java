package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoatLoginRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;
}
