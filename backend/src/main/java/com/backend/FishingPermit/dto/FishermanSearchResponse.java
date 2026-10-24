package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FishermanSearchResponse {
    private Object id;
    private String fishermanId;
    private String name;
    private String phoneNumber;
}
