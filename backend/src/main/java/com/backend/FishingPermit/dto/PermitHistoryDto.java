package com.backend.FishingPermit.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitHistoryDto {
    private Long permitId;
    private String tokenNumber;
    private LocalDate permitDate;
    private String registrationNumber;
    private String ownerName;
    private String crewMembers; // JSON string or raw text
    private String fishermanId;
    private String status;
    private LocalDateTime createdAt;
}
