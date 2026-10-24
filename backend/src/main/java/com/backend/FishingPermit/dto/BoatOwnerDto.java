package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoatOwnerDto {
    private String registrationNumber;
    private String boatName;
    private String state;
    private String port;
    private String district;
    private String ownerName;
    private String phoneNumber;
    private String fishermanId;
}
