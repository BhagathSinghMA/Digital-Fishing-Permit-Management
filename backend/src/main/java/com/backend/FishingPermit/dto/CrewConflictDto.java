package com.backend.FishingPermit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CrewConflictDto {
    private String fishermanId;
    private String fishermanName;
    private String boatRegistration;
    private String boatName;
    private String permitStatus;
    private String expiresAt;
}
