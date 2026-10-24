package com.backend.FishingPermit.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingsResponse {
    private Boolean permitApplicationOpen;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private String systemVersion;
    private String statusMessage;
}
