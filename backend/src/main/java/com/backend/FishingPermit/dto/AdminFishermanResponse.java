package com.backend.FishingPermit.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminFishermanResponse {
    private String fishermanId;
    private String name;
    private String phoneNumber;
    private String port;
    private String village;
    private String address;
    private String district;
    private String state;
    private String status;
    private LocalDateTime createdAt;
}
