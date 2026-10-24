package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrewRequest {

    @NotNull(message = "Registration number is required")
    private String registrationNumber;

    @NotEmpty(message = "At least one crew member is required before clicking Apply.")
    private List<String> crewMembers;
}
