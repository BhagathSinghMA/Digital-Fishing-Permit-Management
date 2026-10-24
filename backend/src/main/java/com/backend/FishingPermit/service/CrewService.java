package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.CrewRequest;
import com.backend.FishingPermit.dto.CrewResponse;
import com.backend.FishingPermit.dto.FishermanSearchResponse;
import com.backend.FishingPermit.entity.BoatOwner;
import com.backend.FishingPermit.entity.Crew;
import com.backend.FishingPermit.entity.Fisherman;
import com.backend.FishingPermit.entity.PermitHistory;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import com.backend.FishingPermit.repository.CrewRepository;
import com.backend.FishingPermit.repository.FishermanRepository;
import com.backend.FishingPermit.repository.PermitHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CrewService {

    private final FishermanRepository fishermanRepository;
    private final BoatOwnerRepository boatOwnerRepository;
    private final CrewRepository crewRepository;
    private final PermitHistoryRepository permitHistoryRepository;
    private final CrewValidationService crewValidationService;

    public CrewService(FishermanRepository fishermanRepository,
                       BoatOwnerRepository boatOwnerRepository,
                       CrewRepository crewRepository,
                       PermitHistoryRepository permitHistoryRepository,
                       CrewValidationService crewValidationService) {
        this.fishermanRepository = fishermanRepository;
        this.boatOwnerRepository = boatOwnerRepository;
        this.crewRepository = crewRepository;
        this.permitHistoryRepository = permitHistoryRepository;
        this.crewValidationService = crewValidationService;
    }

    public List<FishermanSearchResponse> searchFishermen(String id) {
        if (id == null || id.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String searchId = id.trim();
        List<Fisherman> fishermen = fishermanRepository.findByFishermanIdContainingIgnoreCase(searchId);

        return fishermen.stream().map(f -> FishermanSearchResponse.builder()
                .id(f.getFishermanId())
                .fishermanId(f.getFishermanId())
                .name(f.getName())
                .phoneNumber(f.getPhoneNumber())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public CrewResponse addCrewMembers(CrewRequest request) {
        if (request.getRegistrationNumber() == null || request.getRegistrationNumber().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration number is required");
        }

        List<String> crewMembers = request.getCrewMembers();
        if (crewMembers == null || crewMembers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one crew member is required before clicking Apply.");
        }

        // Check for duplicates within the request list
        Set<String> uniqueSet = new HashSet<>();
        for (String id : crewMembers) {
            if (id == null || id.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman ID is required.");
            }
            String cleanId = id.trim();
            if (!uniqueSet.add(cleanId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate crew members are not allowed: " + cleanId);
            }
        }

        String regNum = request.getRegistrationNumber().trim().toUpperCase();

        // Verify Boat Owner exists
        BoatOwner boatOwner = boatOwnerRepository.findByRegistrationNumber(regNum)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boat Owner not found for registration number: " + regNum));

        // Verify all fishermen exist
        List<Fisherman> fishermanEntities = new ArrayList<>();
        for (String fId : uniqueSet) {
            Fisherman f = fishermanRepository.findByFishermanId(fId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman does not exist: " + fId));
            fishermanEntities.add(f);
        }

        // Validate crew availability across all active permits
        crewValidationService.validateCrewAvailability(new ArrayList<>(uniqueSet), null);

        // Save crew members to CrewRepository
        for (String fId : uniqueSet) {
            Crew crew = Crew.builder()
                    .registrationNumber(regNum)
                    .fishermanId(fId)
                    .build();
            crewRepository.save(crew);
        }

        // Optionally create a permit history entry for this submission
        try {
            StringBuilder crewJson = new StringBuilder("[");
            for (int i = 0; i < fishermanEntities.size(); i++) {
                Fisherman f = fishermanEntities.get(i);
                crewJson.append("{\"fishermanId\":\"").append(f.getFishermanId())
                        .append("\",\"name\":\"").append(f.getName()).append("\"}");
                if (i < fishermanEntities.size() - 1) crewJson.append(",");
            }
            crewJson.append("]");

            PermitHistory history = PermitHistory.builder()
                    .permitDate(LocalDate.now())
                    .boatOwner(boatOwner)
                    .ownerName(boatOwner.getOwnerName())
                    .fisherman(fishermanEntities.get(0))
                    .crewMembers(crewJson.toString())
                    .status("APPROVED")
                    .build();
            permitHistoryRepository.save(history);
        } catch (Exception e) {
            // Ignore permit history sync error if sequence or constraints trigger
        }

        return CrewResponse.builder()
                .success(true)
                .message("Crew members added successfully")
                .build();
    }
}
