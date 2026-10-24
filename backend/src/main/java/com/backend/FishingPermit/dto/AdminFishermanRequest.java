package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminFishermanRequest {

    private String fishermanId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String port;
    private String village;
    private String address;
    private String district;
    private String state;
    private String status;
}
