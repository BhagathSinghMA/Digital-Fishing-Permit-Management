package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBoatOwnerRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Boat name is required")
    private String boatName;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String fishermanId;
    private String district;
    private String state;
    private String port;
}
