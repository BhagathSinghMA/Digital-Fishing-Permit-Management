package com.backend.FishingPermit.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivePermitResponse {
    private boolean hasActivePermit;
    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private String issuedTime;
    private String expiryTime;
    private int crewCount;
    private String status; // ACTIVE, PENDING, APPROVED, REJECTED, EXPIRED, NO_PERMIT
    private String rejectionReason;
    private List<CrewMemberResponse> crewMembers;
}
