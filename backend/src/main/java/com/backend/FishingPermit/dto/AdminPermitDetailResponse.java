package com.backend.FishingPermit.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPermitDetailResponse {
    private Long id;
    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private String ownerPhone;
    private String port;
    private String district;
    private String state;
    private String fishermanId;
    private LocalDate permitDate;
    private LocalDateTime expiryDate;
    private String status;
    private String rejectionReason;
    private String submittedTime;
    private String approvedTime;
    private List<CrewMemberResponse> crewMembers;
}
