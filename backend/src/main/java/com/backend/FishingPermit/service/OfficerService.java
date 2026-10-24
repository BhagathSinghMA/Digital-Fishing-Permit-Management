package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.entity.PermitCrew;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfficerService {

    private final PermitRepository permitRepository;
    private final PermitCrewRepository permitCrewRepository;
    private final CrewValidationService crewValidationService;

    public OfficerService(PermitRepository permitRepository,
                          PermitCrewRepository permitCrewRepository,
                          CrewValidationService crewValidationService) {
        this.permitRepository = permitRepository;
        this.permitCrewRepository = permitCrewRepository;
        this.crewValidationService = crewValidationService;
    }

    public List<PendingPermitResponse> getPendingPermits() {
        List<Permit> pendingList = permitRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return pendingList.stream().map(p -> {
            List<PermitCrew> crew = permitCrewRepository.findByPermitId(p.getId());
            return PendingPermitResponse.builder()
                    .id(p.getId())
                    .permitNumber(p.getPermitNumber() != null ? p.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", p.getId()))
                    .boatName(p.getBoatName())
                    .registrationNumber(p.getRegistrationNumber())
                    .ownerName(p.getOwnerName())
                    .crewCount(crew.size())
                    .permitDate(p.getCreatedAt() != null ? p.getCreatedAt().format(dateFmt) : p.getPermitDate().toString())
                    .status(p.getStatus())
                    .rejectionReason(p.getRejectionReason())
                    .build();
        }).collect(Collectors.toList());
    }

    public PendingPermitResponse getPermitDetails(Long id) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permit not found with id: " + id));

        List<PermitCrew> crewList = permitCrewRepository.findByPermitId(permit.getId());
        List<CrewMemberResponse> crewMemberResponses = crewList.stream().map(c ->
                CrewMemberResponse.builder()
                        .fishermanId(c.getFishermanId())
                        .name(c.getName())
                        .phoneNumber(c.getPhoneNumber())
                        .build()
        ).collect(Collectors.toList());

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return PendingPermitResponse.builder()
                .id(permit.getId())
                .permitNumber(permit.getPermitNumber() != null ? permit.getPermitNumber() : "TN-FP-2026-" + String.format("%06d", permit.getId()))
                .boatName(permit.getBoatName())
                .registrationNumber(permit.getRegistrationNumber())
                .ownerName(permit.getOwnerName())
                .crewCount(crewMemberResponses.size())
                .permitDate(permit.getCreatedAt() != null ? permit.getCreatedAt().format(dateFmt) : permit.getPermitDate().toString())
                .status(permit.getStatus())
                .rejectionReason(permit.getRejectionReason())
                .crewMembers(crewMemberResponses)
                .build();
    }

    @Transactional
    public PermitResponse approvePermit(Long id) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permit not found with id: " + id));

        // Validate that no crew member in this permit is currently assigned to another ACTIVE permit
        List<PermitCrew> crewList = permitCrewRepository.findByPermitId(permit.getId());
        List<String> crewFishermanIds = crewList.stream()
                .map(PermitCrew::getFishermanId)
                .collect(Collectors.toList());
        crewValidationService.validateCrewAvailability(crewFishermanIds, permit.getId());

        permit.setStatus("APPROVED");
        permit.setPermitNumber("TN-FP-2026-" + String.format("%06d", permit.getId()));
        permit.setExpiryDate(LocalDateTime.now().plusHours(24));
        permit.setRejectionReason(null);
        permitRepository.save(permit);

        return PermitResponse.builder()
                .success(true)
                .message("Permit Approved")
                .permitId(permit.getId())
                .permitNumber(permit.getPermitNumber())
                .status("APPROVED")
                .build();
    }

    @Transactional
    public PermitResponse rejectPermit(Long id, OfficerRejectRequest request) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permit not found with id: " + id));

        String reason = (request != null && request.getReason() != null && !request.getReason().trim().isEmpty())
                ? request.getReason().trim()
                : "Did not meet maritime safety and compliance requirements.";

        permit.setStatus("REJECTED");
        permit.setRejectionReason(reason);
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
