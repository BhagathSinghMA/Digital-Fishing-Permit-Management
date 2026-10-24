package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfileResponse {
    private String username;
    private String fullName;
    private String email;
    private String role;
}
