package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApplicationStatusRequest {
    @NotNull(message = "permitApplicationOpen status is required")
    private Boolean permitApplicationOpen;
}
