package com.backend.FishingPermit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishermanProfileResponse {

    private Object id;
    private String fishermanId;
    private String name;
    private String phoneNumber;
    private String district;
    private String state;
    private String village;
}
