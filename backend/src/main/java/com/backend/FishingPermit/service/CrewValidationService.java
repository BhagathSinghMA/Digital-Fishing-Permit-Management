package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.CrewConflictDto;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.entity.PermitCrew;
import com.backend.FishingPermit.exceptions.CrewAssignmentConflictException;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CrewValidationService {

    private static final Logger log = LoggerFactory.getLogger(CrewValidationService.class);

    private final PermitCrewRepository permitCrewRepository;
    private final PermitRepository permitRepository;

    public CrewValidationService(PermitCrewRepository permitCrewRepository,
            PermitRepository permitRepository) {
        this.permitCrewRepository = permitCrewRepository;
        this.permitRepository = permitRepository;
    }

    /**
     * Inspects active/pending permits across the entire system to find any
     * assignment conflicts
     * for the provided fishermen IDs.
     *
     * @param fishermanIds    List of fisherman IDs to validate
     * @param excludePermitId Optional permit ID to exclude from conflict checks
     *                        (e.g. current permit being approved)
     * @return List of CrewConflictDto describing any conflicts found
     */
    @Transactional
    public List<CrewConflictDto> findCrewConflicts(List<String> fishermanIds, Long excludePermitId) {
        if (fishermanIds == null || fishermanIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> normalizedIds = fishermanIds.stream()
                .filter(id -> id != null && !id.trim().isEmpty())
                .map(id -> id.trim().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

        if (normalizedIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<PermitCrew> permitCrewEntries = permitCrewRepository.findByFishermanIdInIgnoreCase(normalizedIds);
        if (permitCrewEntries.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> permitIds = permitCrewEntries.stream()
                .map(PermitCrew::getPermitId)
                .filter(id -> id != null && (excludePermitId == null || !id.equals(excludePermitId)))
                .distinct()
                .collect(Collectors.toList());

        if (permitIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Permit> permits = permitRepository.findAllById(permitIds);
        Map<Long, Permit> permitMap = permits.stream()
                .collect(Collectors.toMap(Permit::getId, p -> p, (existing, replacing) -> existing));

        LocalDateTime now = LocalDateTime.now();
        List<CrewConflictDto> conflicts = new ArrayList<>();
        Set<String> seenConflictKeys = new HashSet<>();

        for (PermitCrew crew : permitCrewEntries) {
            Long pId = crew.getPermitId();
            if (pId == null || (excludePermitId != null && excludePermitId.equals(pId))) {
                continue;
            }

            Permit permit = permitMap.get(pId);
            if (permit == null) {
                continue;
            }

            String rawStatus = permit.getStatus() != null ? permit.getStatus().toUpperCase() : "PENDING";

            if ("APPROVED".equals(rawStatus) || "ACTIVE".equals(rawStatus)) {
                LocalDateTime created = permit.getCreatedAt() != null ? permit.getCreatedAt()
                        : (permit.getPermitDate() != null ? permit.getPermitDate().atStartOfDay() : now);
                LocalDateTime expiry = permit.getExpiryDate() != null ? permit.getExpiryDate() : created.plusHours(24);

                if (now.isAfter(expiry) || now.isEqual(expiry)) {
                    // Permit has expired - automatically sync status to EXPIRED
                    log.info("[CrewValidationService] Permit id={} is EXPIRED (expiry: {}). Allowing reassignment.",
                            permit.getId(), expiry);
                    if (!"EXPIRED".equalsIgnoreCase(permit.getStatus())) {
                        permit.setStatus("EXPIRED");
                        try {
                            permitRepository.save(permit);
                        } catch (Exception ignored) {
                        }
                    }
                    continue;
                }

                // Still active / approved and not expired -> BLOCK
                String conflictKey = crew.getFishermanId().toUpperCase() + "_" + permit.getId();
                if (seenConflictKeys.add(conflictKey)) {
                    conflicts.add(CrewConflictDto.builder()
                            .fishermanId(crew.getFishermanId())
                            .fishermanName(crew.getName())
                            .boatRegistration(permit.getRegistrationNumber())
                            .boatName(permit.getBoatName())
                            .permitStatus("ACTIVE")
                            .expiresAt(expiry.toString())
                            .build());
                }
            } else if ("PENDING".equals(rawStatus)) {
                // Pending permit waiting for officer approval -> BLOCK
                String conflictKey = crew.getFishermanId().toUpperCase() + "_" + permit.getId();
                if (seenConflictKeys.add(conflictKey)) {
                    conflicts.add(CrewConflictDto.builder()
                            .fishermanId(crew.getFishermanId())
                            .fishermanName(crew.getName())
                            .boatRegistration(permit.getRegistrationNumber())
                            .boatName(permit.getBoatName())
                            .permitStatus("PENDING")
                            .expiresAt(null)
                            .build());
                }
            }
            // REJECTED, EXPIRED, CANCELLED -> Allowed
        }

        return conflicts;
    }

    /**
     * Validates that none of the given fishermen are currently assigned to another
     * ACTIVE or PENDING permit.
     * Throws {@link CrewAssignmentConflictException} if any conflict is detected.
     *
     * @param fishermanIds    List of fisherman IDs to check
     * @param excludePermitId Optional permit ID to exclude (used during permit
     *                        approval)
     */
    @Transactional
    public void validateCrewAvailability(List<String> fishermanIds, Long excludePermitId) {
        List<CrewConflictDto> conflicts = findCrewConflicts(fishermanIds, excludePermitId);

        if (!conflicts.isEmpty()) {
            StringBuilder msg = new StringBuilder();
            if (conflicts.size() == 1) {
                CrewConflictDto c = conflicts.get(0);
                String namePart = (c.getFishermanName() != null && !c.getFishermanName().trim().isEmpty())
                        ? " (" + c.getFishermanName() + ")"
                        : "";
                msg.append("Crew member ").append(c.getFishermanId()).append(namePart)
                        .append(" is already assigned to a ").append(c.getPermitStatus())
                        .append(" permit on boat ").append(c.getBoatRegistration()).append(".");
            } else {
                msg.append("One or more crew members are already assigned to another active permit: ");
                String details = conflicts.stream()
                        .map(c -> c.getFishermanId() + " on " + c.getBoatRegistration() + " (" + c.getPermitStatus()
                                + ")")
                        .collect(Collectors.joining(", "));
                msg.append(details).append(".");
            }

            log.warn("[CrewValidationService] Validation failed: {}", msg);
            throw new CrewAssignmentConflictException(msg.toString(), conflicts);
        }
    }
}
