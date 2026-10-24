package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrewMemberResponse {
    private String fishermanId;
    private String name;
    private String phoneNumber;
}
