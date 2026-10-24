package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdminProfileResponse {

    private String username;
    private String fullName;
    private String email;
    private String role;
    private String designation;
    private String department;
}
