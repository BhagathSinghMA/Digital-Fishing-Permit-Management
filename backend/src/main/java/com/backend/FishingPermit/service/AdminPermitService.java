package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.entity.BoatOwner;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.entity.PermitCrew;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminPermitService {

    private final PermitRepository permitRepository;
    private final PermitCrewRepository permitCrewRepository;
    private final BoatOwnerRepository boatOwnerRepository;
    private final CrewValidationService crewValidationService;

    public AdminPermitService(PermitRepository permitRepository,
            PermitCrewRepository permitCrewRepository,
            BoatOwnerRepository boatOwnerRepository,
            CrewValidationService crewValidationService) {
        this.permitRepository = permitRepository;
        this.permitCrewRepository = permitCrewRepository;
        this.boatOwnerRepository = boatOwnerRepository;
        this.crewValidationService = crewValidationService;
    }

    private String resolvePermitStatusAndSync(Permit permit) {
        if (permit == null)
            return "NO_PERMIT";
        String rawStatus = permit.getStatus() != null ? permit.getStatus().toUpperCase() : "PENDING";
        if ("APPROVED".equals(rawStatus) || "ACTIVE".equals(rawStatus)) {
            LocalDateTime created = permit.getCreatedAt() != null ? permit.getCreatedAt()
                    : (permit.getPermitDate() != null ? permit.getPermitDate().atStartOfDay() : LocalDateTime.now());
            LocalDateTime expiry = permit.getExpiryDate() != null ? permit.getExpiryDate() : created.plusHours(24);
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(expiry) || now.isEqual(expiry)) {
                if (!"EXPIRED".equalsIgnoreCase(permit.getStatus())) {
                    permit.setStatus("EXPIRED");
                    try {
                        permitRepository.save(permit);
                    } catch (Exception ignored) {
                    }
                }
                return "EXPIRED";
            }
            return "APPROVED";
        }
        return rawStatus;
    }

    public PageResponse<AdminPermitListItem> getPermits(String status, String search, int page, int size) {
        return getPermits(status, search, null, page, size);
    }

    public PageResponse<AdminPermitListItem> getPermits(String status, String search, String date, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        String statusFilter = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL"))
                ? status.trim().toUpperCase()
                : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        java.time.LocalDate filterDate = null;
        if (date != null && !date.trim().isEmpty()) {
            try {
                filterDate = java.time.LocalDate.parse(date.trim());
            } catch (Exception ignored) {
            }
        }

        Page<Permit> permitPage;
        if (filterDate != null) {
            if (statusFilter != null && searchParam != null) {
                permitPage = permitRepository.findByPermitDateAndStatusAndSearch(filterDate, statusFilter, searchParam, pageRequest);
            } else if (statusFilter != null) {
                permitPage = permitRepository.findByPermitDateAndStatus(filterDate, statusFilter, pageRequest);
            } else if (searchParam != null) {
                permitPage = permitRepository.findByPermitDateAndSearch(filterDate, searchParam, pageRequest);
            } else {
                permitPage = permitRepository.findByPermitDate(filterDate, pageRequest);
            }
        } else {
            if (statusFilter != null && searchParam != null) {
                permitPage = permitRepository.findByStatusAndSearch(statusFilter, searchParam, pageRequest);
            } else if (statusFilter != null) {
                permitPage = permitRepository.findByStatus(statusFilter, pageRequest);
            } else if (searchParam != null) {
                permitPage = permitRepository.findBySearchOnly(searchParam, pageRequest);
            } else {
                permitPage = permitRepository.findAll(pageRequest);
            }
        }

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        List<AdminPermitListItem> list = permitPage.getContent().stream().map(p -> {
            String resolvedStatus = resolvePermitStatusAndSync(p);
            int crewCount = permitCrewRepository.countByPermitId(p.getId());
            Optional<BoatOwner> boatOwner = boatOwnerRepository.findByRegistrationNumber(p.getRegistrationNumber());

            String approvedTimeStr = null;
            if ("APPROVED".equalsIgnoreCase(resolvedStatus) || "ACTIVE".equalsIgnoreCase(resolvedStatus) || "EXPIRED".equalsIgnoreCase(resolvedStatus)) {
                LocalDateTime approvedAt = p.getExpiryDate() != null ? p.getExpiryDate().minusHours(24) : p.getUpdatedAt();
                if (approvedAt == null) approvedAt = p.getCreatedAt();
                if (approvedAt != null) {
                    approvedTimeStr = approvedAt.format(timeFmt);
                }
            }

            return AdminPermitListItem.builder()
                    .id(p.getId())
                    .permitNumber(p.getPermitNumber() != null ? p.getPermitNumber()
                            : "TN-FP-2026-" + String.format("%06d", p.getId()))
                    .boatName(p.getBoatName() != null ? p.getBoatName() : boatOwner.map(BoatOwner::getBoatName).orElse("Sea King"))
                    .registrationNumber(p.getRegistrationNumber())
                    .ownerName(p.getOwnerName() != null ? p.getOwnerName() : boatOwner.map(BoatOwner::getOwnerName).orElse("Unknown"))
                    .port(boatOwner.map(BoatOwner::getPort).orElse("Tamil Nadu"))
                    .crewCount(crewCount)
                    .status(resolvedStatus)
                    .submittedTime(p.getCreatedAt() != null ? p.getCreatedAt().format(timeFmt)
                            : (p.getPermitDate() != null ? p.getPermitDate().toString() : "N/A"))
                    .approvedTime(approvedTimeStr)
                    .permitDate(p.getPermitDate())
                    .expiryDate(p.getExpiryDate())
                    .rejectionReason(p.getRejectionReason())
                    .build();
        }).collect(Collectors.toList());

        return PageResponse.<AdminPermitListItem>builder()
                .content(list)
                .pageNumber(permitPage.getNumber())
                .pageSize(permitPage.getSize())
                .totalElements(permitPage.getTotalElements())
                .totalPages(permitPage.getTotalPages())
                .isLast(permitPage.isLast())
                .build();
    }

    public AdminPermitDetailResponse getPermitDetails(Long id) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permit not found with ID: " + id));

        String resolvedStatus = resolvePermitStatusAndSync(permit);
        Optional<BoatOwner> boatOwner = boatOwnerRepository.findByRegistrationNumber(permit.getRegistrationNumber());

        List<PermitCrew> crewList = permitCrewRepository.findByPermitId(permit.getId());
        List<CrewMemberResponse> crewMembers = crewList.stream().map(c -> CrewMemberResponse.builder()
                .fishermanId(c.getFishermanId())
                .name(c.getName())
                .phoneNumber(c.getPhoneNumber())
                .build()).collect(Collectors.toList());

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        String approvedTimeStr = null;
        if ("APPROVED".equalsIgnoreCase(resolvedStatus) || "ACTIVE".equalsIgnoreCase(resolvedStatus) || "EXPIRED".equalsIgnoreCase(resolvedStatus)) {
            LocalDateTime approvedAt = permit.getExpiryDate() != null ? permit.getExpiryDate().minusHours(24) : permit.getUpdatedAt();
            if (approvedAt == null) approvedAt = permit.getCreatedAt();
            if (approvedAt != null) {
                approvedTimeStr = approvedAt.format(timeFmt);
            }
        }

        return AdminPermitDetailResponse.builder()
                .id(permit.getId())
                .permitNumber(permit.getPermitNumber() != null ? permit.getPermitNumber()
                        : "TN-FP-2026-" + String.format("%06d", permit.getId()))
                .boatName(permit.getBoatName() != null ? permit.getBoatName()
                        : (boatOwner.map(BoatOwner::getBoatName).orElse("Sea King")))
                .registrationNumber(permit.getRegistrationNumber())
                .ownerName(permit.getOwnerName() != null ? permit.getOwnerName()
                        : (boatOwner.map(BoatOwner::getOwnerName).orElse("Unknown")))
                .ownerPhone(boatOwner.map(BoatOwner::getPhoneNumber).orElse("N/A"))
                .port(boatOwner.map(BoatOwner::getPort).orElse("Chennai Fishing Harbour"))
                .district(boatOwner.map(BoatOwner::getDistrict).orElse("Chennai"))
                .state(boatOwner.map(BoatOwner::getState).orElse("Tamil Nadu"))
                .fishermanId(boatOwner.map(BoatOwner::getFishermanId).orElse("N/A"))
                .permitDate(permit.getPermitDate())
                .expiryDate(permit.getExpiryDate())
                .status(resolvedStatus)
                .rejectionReason(permit.getRejectionReason())
                .submittedTime(permit.getCreatedAt() != null ? permit.getCreatedAt().format(timeFmt)
                        : (permit.getPermitDate() != null ? permit.getPermitDate().toString() : "N/A"))
                .approvedTime(approvedTimeStr)
                .crewMembers(crewMembers)
                .build();
    }

    @Transactional
    public PermitResponse approvePermit(Long id) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permit not found with ID: " + id));

        // Validate that no crew member in this permit is currently assigned to another
        // ACTIVE permit
        List<PermitCrew> crewList = permitCrewRepository.findByPermitId(permit.getId());
        List<String> crewFishermanIds = crewList.stream()
                .map(PermitCrew::getFishermanId)
                .collect(Collectors.toList());
        crewValidationService.validateCrewAvailability(crewFishermanIds, permit.getId());

        String generatedPermitNumber = "TN-FP-2026-" + String.format("%06d", permit.getId());
        permit.setStatus("APPROVED");
        permit.setPermitNumber(generatedPermitNumber);
        permit.setExpiryDate(LocalDateTime.now().plusHours(24));
        permit.setRejectionReason(null);
        permitRepository.save(permit);

        return PermitResponse.builder()
                .success(true)
                .message("Permit Approved Successfully")
                .permitId(permit.getId())
                .permitNumber(permit.getPermitNumber())
                .status("APPROVED")
                .build();
    }

    @Transactional
    public PermitResponse rejectPermit(Long id, String reason) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permit not found with ID: " + id));

        String finalReason = (reason != null && !reason.trim().isEmpty())
                ? reason.trim()
                : "Did not meet maritime safety guidelines and crew verification requirements.";

        permit.setStatus("REJECTED");
        permit.setRejectionReason(finalReason);
        permit.setExpiryDate(null);
        permitRepository.save(permit);

        return PermitResponse.builder()
                .success(true)
                .message("Permit Rejected")
                .permitId(permit.getId())
                .permitNumber(permit.getPermitNumber())
                .status("REJECTED")
                .build();
    }
}
