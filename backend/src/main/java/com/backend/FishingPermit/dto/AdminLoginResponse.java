package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoginResponse {
    private boolean success;
    private String message;
    private String token;
    private String username;
    private String fullName;
    private String email;
    private String role;
}
