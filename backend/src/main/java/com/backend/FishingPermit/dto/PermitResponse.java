package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitResponse {
    private boolean success;
    private String message;
    private Long permitId;
    private String permitNumber;
    private String status;
}
