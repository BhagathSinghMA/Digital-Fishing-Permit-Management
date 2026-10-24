package com.backend.FishingPermit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerRequest {

    @NotBlank(message = "Officer Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Officer ID is required")
    @Size(min = 3, max = 50, message = "Officer ID must be between 3 and 50 characters")
    private String officerId;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Harbor / Port is required")
    private String harborPort;

    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    private String username;

    private String password;

    private String confirmPassword;

    private String role; // OFFICER, ADMIN, SUPER_ADMIN

    private String status; // ACTIVE, INACTIVE

    private String createdBy;
}
