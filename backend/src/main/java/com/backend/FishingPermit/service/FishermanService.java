package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.entity.Fisherman;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.entity.PermitCrew;
import com.backend.FishingPermit.repository.FishermanRepository;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FishermanService {

    private static final Logger log = LoggerFactory.getLogger(FishermanService.class);

    private final FishermanRepository fishermanRepository;
    private final PermitCrewRepository permitCrewRepository;
    private final PermitRepository permitRepository;

    public FishermanService(FishermanRepository fishermanRepository,
                            PermitCrewRepository permitCrewRepository,
                            PermitRepository permitRepository) {
        this.fishermanRepository = fishermanRepository;
        this.permitCrewRepository = permitCrewRepository;
        this.permitRepository = permitRepository;
    }

    private String cleanFishermanId(String fishermanId) {
        if (fishermanId == null || fishermanId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman ID is required");
        }
        return fishermanId.trim().toUpperCase();
    }

    private Fisherman getFishermanOrThrow(String fishermanId) {
        String cleanId = cleanFishermanId(fishermanId);
        return fishermanRepository.findByFishermanId(cleanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fisherman ID not found: " + cleanId));
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

            log.info("[FishermanService] Evaluating permit id={}, rawStatus={}, expiry={}, serverTime={}",
                    permit.getId(), rawStatus, expiry, now);

            if (now.isAfter(expiry) || now.isEqual(expiry)) {
                log.info("[FishermanService] Permit id={} has EXPIRED. Updating DB status to EXPIRED.", permit.getId());
                if (!"EXPIRED".equalsIgnoreCase(permit.getStatus())) {
                    permit.setStatus("EXPIRED");
                    try {
                        permitRepository.save(permit);
                    } catch (Exception e) {
                        log.error("[FishermanService] Failed to persist EXPIRED status for permit id={}: {}", permit.getId(), e.getMessage());
                    }
                }
                return "EXPIRED";
            }
            return "APPROVED";
        }

        return rawStatus;
    }

    public FishermanHomeResponse getHomeData(String fishermanId) {
        Fisherman fisherman = getFishermanOrThrow(fishermanId);

        List<PermitCrew> crewEntries = permitCrewRepository.findByFishermanId(fisherman.getFishermanId());
        List<Long> permitIds = crewEntries.stream().map(PermitCrew::getPermitId).distinct().collect(Collectors.toList());

        FishermanHomeResponse.FishermanCurrentPermitDto currentPermitDto = null;

        if (!permitIds.isEmpty()) {
            List<Permit> permits = permitRepository.findByIdInOrderByCreatedAtDesc(permitIds);
            if (!permits.isEmpty()) {
                Permit latestPermit = permits.get(0);
                String resolvedStatus = resolvePermitStatusAndSync(latestPermit);

                DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                String issueStr = latestPermit.getPermitDate() != null ? latestPermit.getPermitDate().format(dateFmt) : LocalDate.now().format(dateFmt);
                String expiryStr = latestPermit.getExpiryDate() != null ? latestPermit.getExpiryDate().toLocalDate().format(dateFmt) : LocalDate.now().plusDays(1).format(dateFmt);

                log.info("[FishermanService] getHomeData: fishermanId={}, permitId={}, status={}",
                        fishermanId, latestPermit.getId(), resolvedStatus);

                currentPermitDto = FishermanHomeResponse.FishermanCurrentPermitDto.builder()
                        .permitNumber(latestPermit.getPermitNumber() != null ? latestPermit.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", latestPermit.getId()))
                        .boatName(latestPermit.getBoatName() != null ? latestPermit.getBoatName() : "Sea King")
                        .registrationNumber(latestPermit.getRegistrationNumber())
                        .ownerName(latestPermit.getOwnerName() != null ? latestPermit.getOwnerName() : "Ramesh")
                        .status(resolvedStatus)
                        .issueDate(issueStr)
                        .expiryDate(expiryStr)
                        .build();
            }
        }

        return FishermanHomeResponse.builder()
                .name(fisherman.getName())
                .fishermanId(fisherman.getFishermanId())
                .currentPermit(currentPermitDto)
                .build();
    }

    public FishermanLivePermitResponse getLivePermit(String fishermanId) {
        Fisherman fisherman = getFishermanOrThrow(fishermanId);

        List<PermitCrew> crewEntries = permitCrewRepository.findByFishermanId(fisherman.getFishermanId());
        List<Long> permitIds = crewEntries.stream().map(PermitCrew::getPermitId).distinct().collect(Collectors.toList());

        if (permitIds.isEmpty()) {
            return FishermanLivePermitResponse.builder()
                    .hasActivePermit(false)
                    .status("NO_PERMIT")
                    .crewMembers(Collections.emptyList())
                    .build();
        }

        List<Permit> permits = permitRepository.findByIdInOrderByCreatedAtDesc(permitIds);
        if (permits.isEmpty()) {
            return FishermanLivePermitResponse.builder()
                    .hasActivePermit(false)
                    .status("NO_PERMIT")
                    .crewMembers(Collections.emptyList())
                    .build();
        }

        Permit latestPermit = permits.get(0);
        String resolvedStatus = resolvePermitStatusAndSync(latestPermit);

        List<PermitCrew> crewList = permitCrewRepository.findByPermitId(latestPermit.getId());
        List<FishermanLivePermitResponse.CrewMemberItemDto> crewMemberDtos = crewList.stream().map(c ->
                FishermanLivePermitResponse.CrewMemberItemDto.builder()
                        .fishermanId(c.getFishermanId())
                        .name(c.getName())
                        .phoneNumber(c.getPhoneNumber())
                        .build()
        ).collect(Collectors.toList());

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        LocalDateTime createdAt = latestPermit.getCreatedAt() != null ? latestPermit.getCreatedAt() : LocalDateTime.now();
        LocalDateTime expiry = latestPermit.getExpiryDate() != null ? latestPermit.getExpiryDate() : createdAt.plusHours(24);
        String issuedStr = createdAt.format(timeFmt);
        String expiryStr = expiry.format(timeFmt);

        boolean hasActive = "APPROVED".equalsIgnoreCase(resolvedStatus) || "ACTIVE".equalsIgnoreCase(resolvedStatus);

        log.info("[FishermanService] getLivePermit: fishermanId={}, permitId={}, status={}, hasActive={}, expiry={}",
                fishermanId, latestPermit.getId(), resolvedStatus, hasActive, expiryStr);

        return FishermanLivePermitResponse.builder()
                .hasActivePermit(hasActive)
                .permitNumber(latestPermit.getPermitNumber() != null ? latestPermit.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", latestPermit.getId()))
                .boatName(latestPermit.getBoatName() != null ? latestPermit.getBoatName() : "Sea King")
                .registrationNumber(latestPermit.getRegistrationNumber())
                .ownerName(latestPermit.getOwnerName() != null ? latestPermit.getOwnerName() : "Ramesh")
                .issuedTime(issuedStr)
                .expiryTime(expiryStr)
                .status(resolvedStatus)
                .crewMembers(crewMemberDtos)
                .build();
    }

    public List<FishermanPermitHistoryResponse> getPermitHistory(String fishermanId) {
        Fisherman fisherman = getFishermanOrThrow(fishermanId);

        List<PermitCrew> crewEntries = permitCrewRepository.findByFishermanId(fisherman.getFishermanId());
        List<Long> permitIds = crewEntries.stream().map(PermitCrew::getPermitId).distinct().collect(Collectors.toList());

        if (permitIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Permit> permits = permitRepository.findByIdInOrderByCreatedAtDesc(permitIds);
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

        return permits.stream().map(p -> {
            String resolvedStatus = resolvePermitStatusAndSync(p);
            String issued = p.getPermitDate() != null ? p.getPermitDate().format(dateFmt) : LocalDate.now().format(dateFmt);
            String expired = p.getExpiryDate() != null ? p.getExpiryDate().toLocalDate().format(dateFmt) : (p.getPermitDate() != null ? p.getPermitDate().plusDays(1).format(dateFmt) : LocalDate.now().plusDays(1).format(dateFmt));

            return FishermanPermitHistoryResponse.builder()
                    .permitNumber(p.getPermitNumber() != null ? p.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", p.getId()))
                    .boatName(p.getBoatName() != null ? p.getBoatName() : "Sea King")
                    .registrationNumber(p.getRegistrationNumber())
                    .ownerName(p.getOwnerName() != null ? p.getOwnerName() : "Ramesh")
                    .issuedDate(issued)
                    .expiryDate(expired)
                    .status(resolvedStatus)
                    .build();
        }).collect(Collectors.toList());
    }

    public FishermanProfileResponse getProfile(String fishermanId) {
        Fisherman fisherman = getFishermanOrThrow(fishermanId);

        return FishermanProfileResponse.builder()
                .id(1)
                .fishermanId(fisherman.getFishermanId())
                .name(fisherman.getName())
                .phoneNumber(fisherman.getPhoneNumber())
                .district(fisherman.getDistrict() != null ? fisherman.getDistrict() : "Nagapattinam")
                .state(fisherman.getState() != null ? fisherman.getState() : "Tamil Nadu")
                .village(fisherman.getVillage() != null ? fisherman.getVillage() : "Akkarapettai")
                .build();
    }
}
