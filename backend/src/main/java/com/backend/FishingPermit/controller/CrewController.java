package com.backend.FishingPermit.controller;

import com.backend.FishingPermit.dto.CrewRequest;
import com.backend.FishingPermit.dto.CrewResponse;
import com.backend.FishingPermit.dto.FishermanSearchResponse;
import com.backend.FishingPermit.service.CrewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CrewController {

    private final CrewService crewService;

    public CrewController(CrewService crewService) {
        this.crewService = crewService;
    }

    @GetMapping("/fishermen/search")
    public ResponseEntity<List<FishermanSearchResponse>> searchFishermen(
            @RequestParam(value = "id", required = false) String id
    ) {
        List<FishermanSearchResponse> response = crewService.searchFishermen(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/permit/crew")
    public ResponseEntity<CrewResponse> addCrewMembers(@Valid @RequestBody CrewRequest request) {
        CrewResponse response = crewService.addCrewMembers(request);
        return ResponseEntity.ok(response);
    }
}
