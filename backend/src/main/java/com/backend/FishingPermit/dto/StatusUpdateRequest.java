package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status must be either ACTIVE or INACTIVE")
    private String status;
}
