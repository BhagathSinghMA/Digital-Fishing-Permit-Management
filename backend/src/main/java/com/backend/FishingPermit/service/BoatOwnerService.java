package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.BoatProfileResponse;
import com.backend.FishingPermit.entity.BoatOwner;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class BoatOwnerService {

    private final BoatOwnerRepository boatOwnerRepository;

    public BoatOwnerService(BoatOwnerRepository boatOwnerRepository) {
        this.boatOwnerRepository = boatOwnerRepository;
    }

    public BoatProfileResponse getBoatOwnerProfile(String registrationNumber) {
        Optional<BoatOwner> boatOwnerOpt;

        if (registrationNumber != null && !registrationNumber.trim().isEmpty()) {
            boatOwnerOpt = boatOwnerRepository.findByRegistrationNumber(registrationNumber.trim().toUpperCase());
        } else {
            boatOwnerOpt = boatOwnerRepository.findAll().stream().findFirst();
        }

        BoatOwner boatOwner = boatOwnerOpt.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Boat Owner profile not found")
        );

        String currentDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        return BoatProfileResponse.builder()
                .boatName(boatOwner.getBoatName())
                .registrationNumber(boatOwner.getRegistrationNumber())
                .ownerName(boatOwner.getOwnerName())
                .phoneNumber(boatOwner.getPhoneNumber())
                .fishermanId(boatOwner.getFishermanId() != null ? boatOwner.getFishermanId() : "FSH123456")
                .district(boatOwner.getDistrict() != null ? boatOwner.getDistrict() : "Nagapattinam")
                .state(boatOwner.getState() != null ? boatOwner.getState() : "Tamil Nadu")
                .port(boatOwner.getPort() != null ? boatOwner.getPort() : "Nagapattinam Fishing Harbour")
                .date(currentDate)
                .build();
    }
}
