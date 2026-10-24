package com.backend.FishingPermit.exceptions;

import com.backend.FishingPermit.dto.CrewConflictDto;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

@Getter
public class CrewAssignmentConflictException extends RuntimeException {
    private final List<CrewConflictDto> conflicts;

    public CrewAssignmentConflictException(String message, List<CrewConflictDto> conflicts) {
        super(message);
        this.conflicts = conflicts != null ? Collections.unmodifiableList(conflicts) : Collections.emptyList();
    }
}
