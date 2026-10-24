package com.backend.FishingPermit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishermanLivePermitResponse {

    private boolean hasActivePermit;
    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private String issuedTime;
    private String expiryTime;
    private String status;
    private List<CrewMemberItemDto> crewMembers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CrewMemberItemDto {
        private String fishermanId;
        private String name;
        private String phoneNumber;
    }
}
