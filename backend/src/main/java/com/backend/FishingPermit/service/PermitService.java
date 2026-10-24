package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.entity.*;
import com.backend.FishingPermit.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PermitService {

    private static final Logger log = LoggerFactory.getLogger(PermitService.class);

    private final PermitRepository permitRepository;
    private final PermitCrewRepository permitCrewRepository;
    private final BoatOwnerRepository boatOwnerRepository;
    private final FishermanRepository fishermanRepository;
    private final SystemSettingsService systemSettingsService;
    private final CrewValidationService crewValidationService;

    public PermitService(PermitRepository permitRepository,
                         PermitCrewRepository permitCrewRepository,
                         BoatOwnerRepository boatOwnerRepository,
                         FishermanRepository fishermanRepository,
                         SystemSettingsService systemSettingsService,
                         CrewValidationService crewValidationService) {
        this.permitRepository = permitRepository;
        this.permitCrewRepository = permitCrewRepository;
        this.boatOwnerRepository = boatOwnerRepository;
        this.fishermanRepository = fishermanRepository;
        this.systemSettingsService = systemSettingsService;
        this.crewValidationService = crewValidationService;
    }

    /**
     * Resolves the real-time permit status against server clock and synchronizes to database if expired.
     */
    public String resolvePermitStatusAndSync(Permit permit) {
        if (permit == null) return "NO_PERMIT";

        String rawStatus = permit.getStatus() != null ? permit.getStatus().toUpperCase() : "PENDING";

        if ("APPROVED".equals(rawStatus) || "ACTIVE".equals(rawStatus)) {
            LocalDateTime created = permit.getCreatedAt() != null ? permit.getCreatedAt() : (permit.getPermitDate() != null ? permit.getPermitDate().atStartOfDay() : LocalDateTime.now());
            LocalDateTime expiry = permit.getExpiryDate() != null ? permit.getExpiryDate() : created.plusHours(24);
            LocalDateTime now = LocalDateTime.now();

            log.info("[PermitService] Evaluating permit id={}, regNum={}, rawStatus={}, expiry={}, serverTime={}",
                    permit.getId(), permit.getRegistrationNumber(), rawStatus, expiry, now);

            if (now.isAfter(expiry) || now.isEqual(expiry)) {
                log.info("[PermitService] Permit id={} has EXPIRED. Updating DB status to EXPIRED.", permit.getId());
                if (!"EXPIRED".equalsIgnoreCase(permit.getStatus())) {
                    permit.setStatus("EXPIRED");
                    try {
                        permitRepository.save(permit);
                    } catch (Exception e) {
                        log.error("[PermitService] Failed to persist EXPIRED status for permit id={}: {}", permit.getId(), e.getMessage());
                    }
                }
                return "EXPIRED";
            }
            return "APPROVED";
        }

        return rawStatus;
    }

    @Transactional
    public PermitResponse applyPermit(PermitRequest request) {
        if (!Boolean.TRUE.equals(systemSettingsService.getOrCreateSetting().getPermitApplicationOpen())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Today's fishing permit applications are currently closed. Please try again later.");
        }

        if (request.getRegistrationNumber() == null || request.getRegistrationNumber().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration number is required");
        }

        List<String> crewMembers = request.getCrewMembers();
        if (crewMembers == null || crewMembers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one crew member is required.");
        }

        // Check duplicate crew members in request
        Set<String> uniqueCrew = new HashSet<>();
        for (String id : crewMembers) {
            if (id == null || id.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman ID is required");
            }
            String cleanId = id.trim().toUpperCase();
            if (!uniqueCrew.add(cleanId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate crew members are not allowed: " + cleanId);
            }
        }

        String regNum = request.getRegistrationNumber().trim().toUpperCase();

        // Check if boat owner exists
        BoatOwner boatOwner = boatOwnerRepository.findByRegistrationNumber(regNum)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boat Owner not found: " + regNum));

        // Validation: Only one active/pending permit allowed within 24 hours
        List<Permit> activeOrPending = permitRepository.findByRegistrationNumberAndStatusIn(regNum, List.of("PENDING", "APPROVED", "ACTIVE"));
        for (Permit p : activeOrPending) {
            String resolved = resolvePermitStatusAndSync(p);
            if ("PENDING".equalsIgnoreCase(resolved)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A permit application is already pending officer approval for this boat.");
            }
            if ("APPROVED".equalsIgnoreCase(resolved) || "ACTIVE".equalsIgnoreCase(resolved)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already have an active approved permit. A new permit cannot be submitted while an active permit is valid.");
            }
        }

        // Validate all fishermen exist
        List<Fisherman> fishermanList = new ArrayList<>();
        for (String fId : uniqueCrew) {
            Fisherman f = fishermanRepository.findByFishermanId(fId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman does not exist: " + fId));
            fishermanList.add(f);
        }

        // CRITICAL BUSINESS RULE: Validate that no crew member is currently assigned to another ACTIVE or PENDING permit
        crewValidationService.validateCrewAvailability(new ArrayList<>(uniqueCrew), null);

        // Save Permit with status PENDING
        Permit permit = Permit.builder()
                .registrationNumber(regNum)
                .boatName(boatOwner.getBoatName())
                .ownerName(boatOwner.getOwnerName())
                .boatOwnerId(boatOwner.getId())
                .permitDate(LocalDate.now())
                .status("PENDING")
                .build();
        Permit savedPermit = permitRepository.save(permit);

        // Save PermitCrew entries
        for (Fisherman f : fishermanList) {
            PermitCrew crew = PermitCrew.builder()
                    .permitId(savedPermit.getId())
                    .fishermanId(f.getFishermanId())
                    .name(f.getName())
                    .phoneNumber(f.getPhoneNumber())
                    .build();
            permitCrewRepository.save(crew);
        }

        return PermitResponse.builder()
                .success(true)
                .message("Permit application submitted successfully. Pending officer approval.")
                .permitId(savedPermit.getId())
                .status("PENDING")
                .build();
    }

    public LivePermitResponse getLivePermit(String registrationNumber) {
        String regNum = (registrationNumber != null && !registrationNumber.trim().isEmpty())
                ? registrationNumber.trim().toUpperCase()
                : "TN-09-MM-1234";

        Optional<Permit> latestPermitOpt = permitRepository.findFirstByRegistrationNumberOrderByCreatedAtDesc(regNum);

        if (latestPermitOpt.isEmpty()) {
            Optional<BoatOwner> boatOwnerOpt = boatOwnerRepository.findByRegistrationNumber(regNum);
            return LivePermitResponse.builder()
                    .hasActivePermit(false)
                    .registrationNumber(regNum)
                    .ownerName(boatOwnerOpt.map(BoatOwner::getOwnerName).orElse("Ramesh"))
                    .boatName(boatOwnerOpt.map(BoatOwner::getBoatName).orElse("Sea King"))
                    .status("NO_PERMIT")
                    .crewMembers(Collections.emptyList())
                    .build();
        }

        Permit permit = latestPermitOpt.get();
        String currentStatus = resolvePermitStatusAndSync(permit);

        List<PermitCrew> crewList = permitCrewRepository.findByPermitId(permit.getId());
        List<CrewMemberResponse> crewMemberResponses = crewList.stream().map(c ->
                CrewMemberResponse.builder()
                        .fishermanId(c.getFishermanId())
                        .name(c.getName())
                        .phoneNumber(c.getPhoneNumber())
                        .build()
        ).collect(Collectors.toList());

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        LocalDateTime createdAt = permit.getCreatedAt() != null ? permit.getCreatedAt() : LocalDateTime.now();
        LocalDateTime expiry = permit.getExpiryDate() != null ? permit.getExpiryDate() : createdAt.plusHours(24);
        String issuedStr = createdAt.format(dateFmt);
        String expiryStr = expiry.format(dateFmt);

        boolean hasActive = "APPROVED".equalsIgnoreCase(currentStatus) || "ACTIVE".equalsIgnoreCase(currentStatus);

        log.info("[PermitService] getLivePermit result: regNum={}, status={}, hasActive={}, expiry={}",
                regNum, currentStatus, hasActive, expiryStr);

        return LivePermitResponse.builder()
                .hasActivePermit(hasActive)
                .permitNumber(permit.getPermitNumber() != null ? permit.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", permit.getId()))
                .boatName(permit.getBoatName())
                .registrationNumber(permit.getRegistrationNumber())
                .ownerName(permit.getOwnerName())
                .issuedTime(issuedStr)
                .expiryTime(expiryStr)
                .crewCount(crewMemberResponses.size())
                .status(currentStatus)
                .rejectionReason(permit.getRejectionReason())
                .crewMembers(crewMemberResponses)
                .build();
    }

    public List<PermitHistoryResponse> getPermitHistory(String registrationNumber) {
        List<Permit> permitList;

        if (registrationNumber != null && !registrationNumber.trim().isEmpty()) {
            String regNum = registrationNumber.trim().toUpperCase();
            permitList = permitRepository.findByRegistrationNumberOrderByCreatedAtDesc(regNum);
        } else {
            permitList = permitRepository.findAll();
        }

        if (permitList.isEmpty()) {
            return Collections.emptyList();
        }

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return permitList.stream().map(p -> {
            String resolvedStatus = resolvePermitStatusAndSync(p);
            List<PermitCrew> crew = permitCrewRepository.findByPermitId(p.getId());
            LocalDateTime created = p.getCreatedAt() != null ? p.getCreatedAt() : (p.getPermitDate() != null ? p.getPermitDate().atStartOfDay() : LocalDateTime.now());
            LocalDateTime expiry = p.getExpiryDate() != null ? p.getExpiryDate() : created.plusHours(24);
            String issued = created.format(dateFmt);
            String expired = expiry.format(dateFmt);

            return PermitHistoryResponse.builder()
                    .permitNumber(p.getPermitNumber() != null ? p.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", p.getId()))
                    .boatName(p.getBoatName())
                    .registrationNumber(p.getRegistrationNumber())
                    .issuedDate(issued)
                    .expiryDate(expired)
                    .crewCount(crew.size())
                    .status(resolvedStatus)
                    .build();
        }).collect(Collectors.toList());
    }
}
