package com.backend.FishingPermit.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerResponse {

    private Long id;
    private String officerId;
    private String name;
    private String phoneNumber;
    private String harborPort;
    private String username;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String formattedCreatedAt;
}
