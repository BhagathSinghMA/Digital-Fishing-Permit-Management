package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.AdminBoatOwnerRequest;
import com.backend.FishingPermit.dto.AdminBoatOwnerResponse;
import com.backend.FishingPermit.dto.PageResponse;
import com.backend.FishingPermit.entity.BoatOwner;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import com.backend.FishingPermit.repository.CrewRepository;
import com.backend.FishingPermit.repository.FishermanRepository;
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
public class AdminBoatOwnerService {

    private final BoatOwnerRepository boatOwnerRepository;
    private final FishermanRepository fishermanRepository;
    private final CrewRepository crewRepository;
    private final PermitHistoryRepository permitHistoryRepository;

    public AdminBoatOwnerService(
            BoatOwnerRepository boatOwnerRepository,
            FishermanRepository fishermanRepository,
            CrewRepository crewRepository,
            PermitHistoryRepository permitHistoryRepository
    ) {
        this.boatOwnerRepository = boatOwnerRepository;
        this.fishermanRepository = fishermanRepository;
        this.crewRepository = crewRepository;
        this.permitHistoryRepository = permitHistoryRepository;
    }

    public PageResponse<AdminBoatOwnerResponse> getBoatOwners(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<BoatOwner> boatOwnerPage = (searchParam != null)
                ? boatOwnerRepository.searchBoatOwners(searchParam, pageRequest)
                : boatOwnerRepository.findAll(pageRequest);

        List<AdminBoatOwnerResponse> list = boatOwnerPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<AdminBoatOwnerResponse>builder()
                .content(list)
                .pageNumber(boatOwnerPage.getNumber())
                .pageSize(boatOwnerPage.getSize())
                .totalElements(boatOwnerPage.getTotalElements())
                .totalPages(boatOwnerPage.getTotalPages())
                .isLast(boatOwnerPage.isLast())
                .build();
    }

    public AdminBoatOwnerResponse getBoatOwnerByRegNo(String registrationNumber) {
        BoatOwner owner = boatOwnerRepository.findByRegistrationNumber(registrationNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boat owner not found for registration number: " + registrationNumber));
        return mapToResponse(owner);
    }

    @Transactional
    public AdminBoatOwnerResponse createBoatOwner(AdminBoatOwnerRequest request) {
        String regNo = request.getRegistrationNumber().trim().toUpperCase();
        if (boatOwnerRepository.existsByRegistrationNumber(regNo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Boat owner with registration number " + regNo + " already exists.");
        }

        String fId = request.getFishermanId() != null ? request.getFishermanId().trim().toUpperCase() : null;
        if (fId == null || fId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fisherman ID is required to register a boat owner.");
        }

        com.backend.FishingPermit.entity.Fisherman fisherman = fishermanRepository.findByFishermanId(fId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fisherman ID '" + fId + "' does not exist in registry. Please add the fisherman first."));

        String ownerName = (request.getOwnerName() != null && !request.getOwnerName().trim().isEmpty())
                ? request.getOwnerName().trim()
                : fisherman.getName();
        String phoneNumber = (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty())
                ? request.getPhoneNumber().trim()
                : fisherman.getPhoneNumber();

        BoatOwner owner = BoatOwner.builder()
                .registrationNumber(regNo)
                .boatName(request.getBoatName().trim())
                .ownerName(ownerName)
                .phoneNumber(phoneNumber)
                .fishermanId(fId)
                .district(request.getDistrict() != null && !request.getDistrict().trim().isEmpty() ? request.getDistrict() : fisherman.getDistrict())
                .state(request.getState() != null ? request.getState() : (fisherman.getState() != null ? fisherman.getState() : "Tamil Nadu"))
                .port(request.getPort())
                .build();

        BoatOwner saved = boatOwnerRepository.save(owner);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminBoatOwnerResponse updateBoatOwner(String registrationNumber, AdminBoatOwnerRequest request) {
        BoatOwner owner = boatOwnerRepository.findByRegistrationNumber(registrationNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boat owner not found: " + registrationNumber));

        if (request.getFishermanId() != null && !request.getFishermanId().trim().isEmpty()) {
            String fId = request.getFishermanId().trim().toUpperCase();
            if (!fishermanRepository.existsByFishermanId(fId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fisherman ID '" + fId + "' does not exist in registry.");
            }
            owner.setFishermanId(fId);
        }

        owner.setBoatName(request.getBoatName().trim());
        owner.setOwnerName(request.getOwnerName().trim());
        owner.setPhoneNumber(request.getPhoneNumber().trim());
        owner.setDistrict(request.getDistrict());
        if (request.getState() != null) {
            owner.setState(request.getState());
        }
        owner.setPort(request.getPort());

        BoatOwner saved = boatOwnerRepository.save(owner);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteBoatOwner(String registrationNumber) {
        String regNo = registrationNumber.trim().toUpperCase();
        BoatOwner owner = boatOwnerRepository.findByRegistrationNumber(regNo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boat owner not found: " + regNo));

        // Clean up crew members associated with this vessel
        crewRepository.deleteByRegistrationNumber(regNo);

        // Clean up permits associated with this vessel
        permitHistoryRepository.deleteByBoatOwner_RegistrationNumber(regNo);

        boatOwnerRepository.delete(owner);
    }

    private AdminBoatOwnerResponse mapToResponse(BoatOwner b) {
        return AdminBoatOwnerResponse.builder()
                .id(b.getId())
                .registrationNumber(b.getRegistrationNumber())
                .boatName(b.getBoatName())
                .ownerName(b.getOwnerName())
                .phoneNumber(b.getPhoneNumber())
                .fishermanId(b.getFishermanId())
                .district(b.getDistrict())
                .state(b.getState())
                .port(b.getPort())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
