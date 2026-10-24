package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.CrewConflictDto;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.entity.PermitCrew;
import com.backend.FishingPermit.exceptions.CrewAssignmentConflictException;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CrewValidationServiceTest {

    @Mock
    private PermitCrewRepository permitCrewRepository;

    @Mock
    private PermitRepository permitRepository;

    @InjectMocks
    private CrewValidationService crewValidationService;

    @BeforeEach
    void setUp() {
    }

    @Test
    @DisplayName("Scenario 1: No previous permit assignments -> Validation passes")
    void testNoPreviousAssignments_Passes() {
        when(permitCrewRepository.findByFishermanIdInIgnoreCase(anyList())).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            crewValidationService.validateCrewAvailability(List.of("F001", "F002", "F003"), null);
        });
    }

    @Test
    @DisplayName("Scenario 2: Fisherman in ACTIVE (APPROVED + Not Expired) permit on Boat A -> Blocks Boat B")
    void testActiveApprovedPermitNotExpired_Blocks() {
        PermitCrew crewA = PermitCrew.builder()
                .id(1L)
                .permitId(100L)
                .fishermanId("F002")
                .name("Suresh")
                .phoneNumber("9876543210")
                .build();

        Permit boatAPermit = Permit.builder()
                .id(100L)
                .registrationNumber("TN-09-1234")
                .boatName("Sea Queen")
                .ownerName("Ramesh")
                .status("APPROVED")
                .permitDate(LocalDate.now())
                .expiryDate(LocalDateTime.now().plusHours(12)) // Active and not expired
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F002")))
                .thenReturn(List.of(crewA));
        when(permitRepository.findAllById(List.of(100L)))
                .thenReturn(List.of(boatAPermit));

        CrewAssignmentConflictException ex = assertThrows(CrewAssignmentConflictException.class, () -> {
            crewValidationService.validateCrewAvailability(List.of("F002"), null);
        });

        assertNotNull(ex.getConflicts());
        assertEquals(1, ex.getConflicts().size());

        CrewConflictDto conflict = ex.getConflicts().get(0);
        assertEquals("F002", conflict.getFishermanId());
        assertEquals("TN-09-1234", conflict.getBoatRegistration());
        assertEquals("ACTIVE", conflict.getPermitStatus());
        assertTrue(ex.getMessage().contains("F002"));
    }

    @Test
    @DisplayName("Scenario 3: Permit on Boat A has EXPIRED -> Allows reassignment to Boat B")
    void testExpiredPermit_AllowsReassignment() {
        PermitCrew crewA = PermitCrew.builder()
                .id(1L)
                .permitId(100L)
                .fishermanId("F002")
                .name("Suresh")
                .phoneNumber("9876543210")
                .build();

        Permit expiredPermit = Permit.builder()
                .id(100L)
                .registrationNumber("TN-09-1234")
                .boatName("Sea Queen")
                .status("APPROVED")
                .permitDate(LocalDate.now().minusDays(2))
                .expiryDate(LocalDateTime.now().minusHours(5)) // Expired 5 hours ago
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F002")))
                .thenReturn(List.of(crewA));
        when(permitRepository.findAllById(List.of(100L)))
                .thenReturn(List.of(expiredPermit));

        assertDoesNotThrow(() -> {
            crewValidationService.validateCrewAvailability(List.of("F002"), null);
        });

        // Verifies status was updated to EXPIRED
        verify(permitRepository, atLeastOnce()).save(any(Permit.class));
    }

    @Test
    @DisplayName("Scenario 4: Permit on Boat A was REJECTED -> Allows reassignment to Boat B immediately")
    void testRejectedPermit_AllowsReassignment() {
        PermitCrew crewA = PermitCrew.builder()
                .id(1L)
                .permitId(101L)
                .fishermanId("F002")
                .name("Suresh")
                .build();

        Permit rejectedPermit = Permit.builder()
                .id(101L)
                .registrationNumber("TN-09-1234")
                .boatName("Sea Queen")
                .status("REJECTED")
                .rejectionReason("Incomplete paperwork")
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F002")))
                .thenReturn(List.of(crewA));
        when(permitRepository.findAllById(List.of(101L)))
                .thenReturn(List.of(rejectedPermit));

        assertDoesNotThrow(() -> {
            crewValidationService.validateCrewAvailability(List.of("F002"), null);
        });
    }

    @Test
    @DisplayName("Scenario 5: Permit on Boat A is PENDING -> Blocks duplicate assignment on Boat B")
    void testPendingPermit_BlocksReassignment() {
        PermitCrew crewA = PermitCrew.builder()
                .id(1L)
                .permitId(102L)
                .fishermanId("F002")
                .name("Suresh")
                .build();

        Permit pendingPermit = Permit.builder()
                .id(102L)
                .registrationNumber("TN-09-1234")
                .boatName("Sea Queen")
                .status("PENDING")
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F002")))
                .thenReturn(List.of(crewA));
        when(permitRepository.findAllById(List.of(102L)))
                .thenReturn(List.of(pendingPermit));

        CrewAssignmentConflictException ex = assertThrows(CrewAssignmentConflictException.class, () -> {
            crewValidationService.validateCrewAvailability(List.of("F002"), null);
        });

        assertEquals(1, ex.getConflicts().size());
        assertEquals("PENDING", ex.getConflicts().get(0).getPermitStatus());
    }

    @Test
    @DisplayName("Scenario 6: Permit on Boat A is CANCELLED -> Allows reassignment to Boat B")
    void testCancelledPermit_AllowsReassignment() {
        PermitCrew crewA = PermitCrew.builder()
                .id(1L)
                .permitId(103L)
                .fishermanId("F002")
                .name("Suresh")
                .build();

        Permit cancelledPermit = Permit.builder()
                .id(103L)
                .registrationNumber("TN-09-1234")
                .boatName("Sea Queen")
                .status("CANCELLED")
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F002")))
                .thenReturn(List.of(crewA));
        when(permitRepository.findAllById(List.of(103L)))
                .thenReturn(List.of(cancelledPermit));

        assertDoesNotThrow(() -> {
            crewValidationService.validateCrewAvailability(List.of("F002"), null);
        });
    }

    @Test
    @DisplayName("Scenario 7: Multiple conflicting fishermen in one request -> Returns all conflicts")
    void testMultipleConflictingFishermen_ReturnsAllConflicts() {
        PermitCrew crew1 = PermitCrew.builder()
                .id(1L)
                .permitId(201L)
                .fishermanId("F001")
                .name("Murugan")
                .build();

        PermitCrew crew2 = PermitCrew.builder()
                .id(2L)
                .permitId(202L)
                .fishermanId("F002")
                .name("Suresh")
                .build();

        Permit permit1 = Permit.builder()
                .id(201L)
                .registrationNumber("TN-01-AAA")
                .boatName("Boat One")
                .status("APPROVED")
                .expiryDate(LocalDateTime.now().plusHours(10))
                .build();

        Permit permit2 = Permit.builder()
                .id(202L)
                .registrationNumber("TN-02-BBB")
                .boatName("Boat Two")
                .status("PENDING")
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F001", "F002", "F003")))
                .thenReturn(List.of(crew1, crew2));
        when(permitRepository.findAllById(List.of(201L, 202L)))
                .thenReturn(List.of(permit1, permit2));

        CrewAssignmentConflictException ex = assertThrows(CrewAssignmentConflictException.class, () -> {
            crewValidationService.validateCrewAvailability(List.of("F001", "F002", "F003"), null);
        });

        assertEquals(2, ex.getConflicts().size());
        assertTrue(ex.getConflicts().stream().anyMatch(c -> c.getFishermanId().equals("F001")));
        assertTrue(ex.getConflicts().stream().anyMatch(c -> c.getFishermanId().equals("F002")));
    }

    @Test
    @DisplayName("Scenario 8: Officer approving permit excludes current permit ID, but blocks if other active permit has same crew")
    void testOfficerApproval_ExcludeCurrentPermit_BlocksIfOtherPermitActive() {
        Long currentPermitId = 300L;

        PermitCrew currentCrew = PermitCrew.builder()
                .id(10L)
                .permitId(currentPermitId)
                .fishermanId("F001")
                .name("Murugan")
                .build();

        PermitCrew otherBoatCrew = PermitCrew.builder()
                .id(11L)
                .permitId(301L)
                .fishermanId("F001")
                .name("Murugan")
                .build();

        Permit otherBoatPermit = Permit.builder()
                .id(301L)
                .registrationNumber("TN-08-9999")
                .boatName("Earlier Boat")
                .status("APPROVED")
                .expiryDate(LocalDateTime.now().plusHours(8))
                .build();

        when(permitCrewRepository.findByFishermanIdInIgnoreCase(List.of("F001")))
                .thenReturn(List.of(currentCrew, otherBoatCrew));
        // Note: 300L is excluded, so only 301L is queried
        when(permitRepository.findAllById(List.of(301L)))
                .thenReturn(List.of(otherBoatPermit));

        CrewAssignmentConflictException ex = assertThrows(CrewAssignmentConflictException.class, () -> {
            crewValidationService.validateCrewAvailability(List.of("F001"), currentPermitId);
        });

        assertEquals(1, ex.getConflicts().size());
        assertEquals("TN-08-9999", ex.getConflicts().get(0).getBoatRegistration());
    }
}
