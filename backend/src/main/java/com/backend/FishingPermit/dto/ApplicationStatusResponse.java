package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusResponse {
    private boolean permitApplicationOpen;
    private String title;
    private String message;
}
