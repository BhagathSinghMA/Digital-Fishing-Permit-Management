package com.backend.FishingPermit.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPermitListItem {
    private Long id;
    private String permitNumber;
    private String boatName;
    private String registrationNumber;
    private String ownerName;
    private int crewCount;
    private String status; // PENDING, APPROVED, REJECTED, EXPIRED
    private String submittedTime;
    private String approvedTime;
    private String port;
    private LocalDate permitDate;
    private LocalDateTime expiryDate;
    private String rejectionReason;
}
