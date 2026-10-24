package com.backend.FishingPermit.service;

import com.backend.FishingPermit.config.GlobalExceptionHandler;
import com.backend.FishingPermit.dto.ApiResponse;
import com.backend.FishingPermit.dto.CrewConflictDto;
import com.backend.FishingPermit.dto.PermitRequest;
import com.backend.FishingPermit.entity.BoatOwner;
import com.backend.FishingPermit.entity.Fisherman;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.entity.PermitCrew;
import com.backend.FishingPermit.entity.SystemSetting;
import com.backend.FishingPermit.exceptions.CrewAssignmentConflictException;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import com.backend.FishingPermit.repository.FishermanRepository;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PermitWorkflowConflictTest {

    @Mock
    private PermitRepository permitRepository;

    @Mock
    private PermitCrewRepository permitCrewRepository;

    @Mock
    private BoatOwnerRepository boatOwnerRepository;

    @Mock
    private FishermanRepository fishermanRepository;

    @Mock
    private SystemSettingsService systemSettingsService;

    @Mock
    private CrewValidationService crewValidationService;

    @InjectMocks
    private PermitService permitService;

    @Test
    @DisplayName("PermitService.applyPermit: Triggers crew validation and throws conflict when crew member is active elsewhere")
    void testApplyPermit_CrewValidationTriggered() {
        when(systemSettingsService.getOrCreateSetting()).thenReturn(SystemSetting.builder().permitApplicationOpen(true).build());

        BoatOwner boatB = BoatOwner.builder()
                .id(2L)
                .registrationNumber("TN-09-BOAT-B")
                .boatName("Boat B")
                .ownerName("Owner B")
                .build();
        when(boatOwnerRepository.findByRegistrationNumber("TN-09-BOAT-B")).thenReturn(Optional.of(boatB));
        when(permitRepository.findByRegistrationNumberAndStatusIn("TN-09-BOAT-B", List.of("PENDING", "APPROVED", "ACTIVE")))
                .thenReturn(Collections.emptyList());

        Fisherman f1 = Fisherman.builder().fishermanId("F002").name("Suresh").phoneNumber("9876543210").build();
        when(fishermanRepository.findByFishermanId("F002")).thenReturn(Optional.of(f1));

        doThrow(new CrewAssignmentConflictException(
                "Crew member F002 is already assigned to a ACTIVE permit on boat TN-09-BOAT-A.",
                List.of(CrewConflictDto.builder()
                        .fishermanId("F002")
                        .fishermanName("Suresh")
                        .boatRegistration("TN-09-BOAT-A")
                        .boatName("Boat A")
                        .permitStatus("ACTIVE")
                        .expiresAt("2026-08-21T18:30:00")
                        .build())
        )).when(crewValidationService).validateCrewAvailability(eq(List.of("F002")), isNull());

        PermitRequest request = PermitRequest.builder()
                .registrationNumber("TN-09-BOAT-B")
                .crewMembers(List.of("F002"))
                .build();

        CrewAssignmentConflictException ex = assertThrows(CrewAssignmentConflictException.class, () -> {
            permitService.applyPermit(request);
        });

        assertEquals(1, ex.getConflicts().size());
        assertEquals("TN-09-BOAT-A", ex.getConflicts().get(0).getBoatRegistration());
        // Verify permit was not saved
        verify(permitRepository, never()).save(any(Permit.class));
    }

    @Test
    @DisplayName("GlobalExceptionHandler: Correctly renders HTTP 409 CONFLICT with conflict details")
    void testGlobalExceptionHandler_RendersConflict() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        List<CrewConflictDto> conflicts = List.of(CrewConflictDto.builder()
                .fishermanId("F001")
                .fishermanName("Murugan")
                .boatRegistration("TN-09-1234")
                .boatName("Sea King")
                .permitStatus("ACTIVE")
                .expiresAt("2026-08-21T18:30:00Z")
                .build());

        CrewAssignmentConflictException ex = new CrewAssignmentConflictException(
                "One or more crew members are already assigned to another active permit.",
                conflicts
        );

        ResponseEntity<ApiResponse> response = handler.handleCrewConflictException(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("One or more crew members are already assigned to another active permit.", response.getBody().getMessage());
        assertNotNull(response.getBody().getConflicts());
        assertEquals(1, response.getBody().getConflicts().size());
        assertEquals("F001", response.getBody().getConflicts().get(0).getFishermanId());
        assertEquals("TN-09-1234", response.getBody().getConflicts().get(0).getBoatRegistration());
    }
}
