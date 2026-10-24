package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoatProfileResponse {
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private String phoneNumber;
    private String fishermanId;
    private String district;
    private String state;
    private String port;
    private String date;
}
