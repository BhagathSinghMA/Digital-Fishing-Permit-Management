package com.backend.FishingPermit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishermanPermitHistoryResponse {

    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private String issuedDate;
    private String expiryDate;
    private String status;
}
