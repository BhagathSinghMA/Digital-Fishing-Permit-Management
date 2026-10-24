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
public class ApiResponse {

    private boolean success;
    private String message;
    private Object boatOwner;
    private Object fisherman;
    private java.util.List<CrewConflictDto> conflicts;

    public static ApiResponse success(String message) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .build();
    }

    public static ApiResponse success(String message, Object data) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .boatOwner(data)
                .build();
    }

    public static ApiResponse successFisherman(String message, Object fisherman) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .fisherman(fisherman)
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

    public static ApiResponse errorWithConflicts(String message, java.util.List<CrewConflictDto> conflicts) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .conflicts(conflicts)
                .build();
    }
}
