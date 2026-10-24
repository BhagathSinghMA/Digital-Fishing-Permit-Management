package com.backend.FishingPermit.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBoatOwnerResponse {
    private Long id;
    private String registrationNumber;
    private String boatName;
    private String ownerName;
    private String phoneNumber;
    private String fishermanId;
    private String district;
    private String state;
    private String port;
    private LocalDateTime createdAt;
}
