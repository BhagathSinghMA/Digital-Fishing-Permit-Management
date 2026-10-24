package com.backend.FishingPermit.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingPermitResponse {
    private Long id;
    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private int crewCount;
    private String permitDate;
    private String status;
    private String rejectionReason;
    private List<CrewMemberResponse> crewMembers;
}
