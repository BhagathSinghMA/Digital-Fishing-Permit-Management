package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishermanLoginRequest {

    @NotBlank(message = "Fisherman ID cannot be empty")
    private String fishermanId;
}
