package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitHistoryResponse {
    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String issuedDate;
    private String expiryDate;
    private int crewCount;
    private String status; // Completed, Expired, Cancelled
}
