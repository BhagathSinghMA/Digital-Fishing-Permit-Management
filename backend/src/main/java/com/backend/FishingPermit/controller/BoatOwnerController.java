package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.BoatProfileResponse;
import com.backend.FishingPermit.service.BoatOwnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/boat-owner")
@CrossOrigin(origins = "*")
public class BoatOwnerController {

    private final BoatOwnerService boatOwnerService;

    public BoatOwnerController(BoatOwnerService boatOwnerService) {
        this.boatOwnerService = boatOwnerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<BoatProfileResponse> getBoatOwnerProfile(
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber
    ) {
        BoatProfileResponse response = boatOwnerService.getBoatOwnerProfile(registrationNumber);
        return ResponseEntity.ok(response);
    }
}
