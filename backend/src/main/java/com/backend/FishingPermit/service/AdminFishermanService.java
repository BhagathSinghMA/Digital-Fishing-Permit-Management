package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.AdminFishermanRequest;
import com.backend.FishingPermit.dto.AdminFishermanResponse;
import com.backend.FishingPermit.dto.PageResponse;
import com.backend.FishingPermit.entity.Fisherman;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import com.backend.FishingPermit.repository.CrewRepository;
import com.backend.FishingPermit.repository.FishermanRepository;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminFishermanService {

    private final FishermanRepository fishermanRepository;
    private final BoatOwnerRepository boatOwnerRepository;
    private final CrewRepository crewRepository;
    private final PermitCrewRepository permitCrewRepository;
    private final PermitHistoryRepository permitHistoryRepository;

    public AdminFishermanService(
            FishermanRepository fishermanRepository,
            BoatOwnerRepository boatOwnerRepository,
            CrewRepository crewRepository,
            PermitCrewRepository permitCrewRepository,
            PermitHistoryRepository permitHistoryRepository) {
        this.fishermanRepository = fishermanRepository;
        this.boatOwnerRepository = boatOwnerRepository;
        this.crewRepository = crewRepository;
        this.permitCrewRepository = permitCrewRepository;
        this.permitHistoryRepository = permitHistoryRepository;
    }

    public PageResponse<AdminFishermanResponse> getFishermen(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("createdAt").nullsLast(), Sort.Order.desc("fishermanId")));
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Fisherman> pageResult = (searchParam != null)
                ? fishermanRepository.searchFishermen(searchParam, pageRequest)
                : fishermanRepository.findAll(pageRequest);

        List<AdminFishermanResponse> list = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<AdminFishermanResponse>builder()
                .content(list)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .isLast(pageResult.isLast())
                .build();
    }

    public AdminFishermanResponse getFishermanById(String fishermanId) {
        Fisherman f = fishermanRepository.findByFishermanId(fishermanId.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Fisherman not found with ID: " + fishermanId));
        return mapToResponse(f);
    }

    @Transactional
    public AdminFishermanResponse createFisherman(AdminFishermanRequest request) {
        if (request.getFishermanId() == null || request.getFishermanId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman ID is required");
        }
        String fId = request.getFishermanId().trim().toUpperCase();
        if (fishermanRepository.existsByFishermanId(fId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Fisherman with ID " + fId + " already exists.");
        }
        if (fishermanRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Fisherman with phone number " + request.getPhoneNumber().trim() + " already exists.");
        }

        Fisherman fisherman = Fisherman.builder()
                .fishermanId(fId)
                .name(request.getName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .district(request.getDistrict())
                .port(request.getPort() != null && !request.getPort().trim().isEmpty() ? request.getPort().trim()
                        : request.getVillage())
                .village(request.getVillage())
                .address(request.getAddress())
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty()
                        ? request.getStatus().trim()
                        : "ACTIVE")
                .state(request.getState() != null ? request.getState() : "Tamil Nadu")
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                .build();

        Fisherman saved = fishermanRepository.save(fisherman);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminFishermanResponse updateFisherman(String fishermanId, AdminFishermanRequest request) {
        Fisherman fisherman = fishermanRepository.findByFishermanId(fishermanId.trim().toUpperCase())
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fisherman not found: " + fishermanId));

        fisherman.setName(request.getName().trim());
        fisherman.setPhoneNumber(request.getPhoneNumber().trim());
        fisherman.setDistrict(request.getDistrict());
        if (request.getPort() != null) {
            fisherman.setPort(request.getPort().trim());
        }
        fisherman.setVillage(request.getVillage());
        fisherman.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            fisherman.setStatus(request.getStatus().trim());
        }
        if (request.getState() != null) {
            fisherman.setState(request.getState());
        }

        Fisherman saved = fishermanRepository.save(fisherman);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFisherman(String fishermanId) {
        String fId = fishermanId.trim().toUpperCase();
        Fisherman fisherman = fishermanRepository.findByFishermanId(fId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fisherman not found with ID: " + fId));

        if (boatOwnerRepository.existsByFishermanId(fId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete fisherman '" + fId
                            + "': This fisherman is registered as a Boat Owner. Please remove or update the boat ownership record first.");
        }

        // Clean up crew assignments and permit records
        crewRepository.deleteByFishermanId(fId);
        permitCrewRepository.deleteByFishermanIdIgnoreCase(fId);
        permitHistoryRepository.deleteByFisherman_FishermanId(fId);

        fishermanRepository.delete(fisherman);
    }

    private AdminFishermanResponse mapToResponse(Fisherman f) {
        return AdminFishermanResponse.builder()
                .fishermanId(f.getFishermanId())
                .name(f.getName())
                .phoneNumber(f.getPhoneNumber())
                .district(f.getDistrict())
                .port(f.getPort() != null ? f.getPort() : f.getVillage())
                .village(f.getVillage())
                .address(f.getAddress())
                .status(f.getStatus() != null ? f.getStatus() : "ACTIVE")
                .state(f.getState())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
