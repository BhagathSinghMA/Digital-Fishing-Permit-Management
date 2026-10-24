package com.backend.FishingPermit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishermanHomeResponse {

    private String name;
    private String fishermanId;
    private FishermanCurrentPermitDto currentPermit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FishermanCurrentPermitDto {
        private String permitNumber;
        private String boatName;
        private String registrationNumber;
        private String ownerName;
        private String status;
        private String issueDate;
        private String expiryDate;
    }
}
