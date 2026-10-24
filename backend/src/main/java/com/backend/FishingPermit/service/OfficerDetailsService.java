package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.*;
import com.backend.FishingPermit.entity.OfficerDetails;
import com.backend.FishingPermit.repository.OfficerDetailsRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OfficerDetailsService {

    private final OfficerDetailsRepository officerRepository;
    private final PermitRepository permitRepository;
    private final PasswordEncoder passwordEncoder;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public OfficerDetailsService(OfficerDetailsRepository officerRepository,
                                 PermitRepository permitRepository,
                                 PasswordEncoder passwordEncoder) {
        this.officerRepository = officerRepository;
        this.permitRepository = permitRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initDefaultOfficers() {
        if (officerRepository.count() == 0) {
            List<OfficerDetails> sampleOfficers = List.of(
                    OfficerDetails.builder()
                            .officerId("OFF-CHE-001")
                            .name("K. Saravanan")
                            .phoneNumber("9840123456")
                            .harborPort("Chennai Harbour (Kasimedu)")
                            .username("officer.chennai")
                            .password(passwordEncoder.encode("Officer@123"))
                            .role("OFFICER")
                            .status("ACTIVE")
                            .createdBy("Super Admin")
                            .createdAt(LocalDateTime.now().minusDays(30))
                            .updatedAt(LocalDateTime.now().minusDays(30))
                            .build(),
                    OfficerDetails.builder()
                            .officerId("OFF-TUT-002")
                            .name("M. Muthukumar")
                            .phoneNumber("9841234567")
                            .harborPort("Tuticorin Port (VOC)")
                            .username("officer.tuticorin")
                            .password(passwordEncoder.encode("Officer@123"))
                            .role("OFFICER")
                            .status("ACTIVE")
                            .createdBy("Super Admin")
                            .createdAt(LocalDateTime.now().minusDays(20))
                            .updatedAt(LocalDateTime.now().minusDays(20))
                            .build(),
                    OfficerDetails.builder()
                            .officerId("OFF-NAG-003")
                            .name("S. Jayaraman")
                            .phoneNumber("9842345678")
                            .harborPort("Nagapattinam Port")
                            .username("officer.nagapattinam")
                            .password(passwordEncoder.encode("Officer@123"))
                            .role("OFFICER")
                            .status("ACTIVE")
                            .createdBy("Super Admin")
                            .createdAt(LocalDateTime.now().minusDays(15))
                            .updatedAt(LocalDateTime.now().minusDays(15))
                            .build(),
                    OfficerDetails.builder()
                            .officerId("OFF-CUD-004")
                            .name("R. Venkatesh")
                            .phoneNumber("9843456789")
                            .harborPort("Cuddalore Port")
                            .username("officer.cuddalore")
                            .password(passwordEncoder.encode("Officer@123"))
                            .role("ADMIN")
                            .status("ACTIVE")
                            .createdBy("Super Admin")
                            .createdAt(LocalDateTime.now().minusDays(10))
                            .updatedAt(LocalDateTime.now().minusDays(10))
                            .build(),
                    OfficerDetails.builder()
                            .officerId("OFF-RAM-005")
                            .name("T. Arumugam")
                            .phoneNumber("9844567890")
                            .harborPort("Rameswaram Port")
                            .username("officer.rameswaram")
                            .password(passwordEncoder.encode("Officer@123"))
                            .role("OFFICER")
                            .status("INACTIVE")
                            .createdBy("Super Admin")
                            .createdAt(LocalDateTime.now().minusDays(5))
                            .updatedAt(LocalDateTime.now().minusDays(2))
                            .build()
            );
            officerRepository.saveAll(sampleOfficers);
        }
    }

    public List<OfficerResponse> getAllOfficers(String query, String status, String harborPort) {
        List<OfficerDetails> list;
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL");
        boolean hasPort = harborPort != null && !harborPort.trim().isEmpty() && !harborPort.equalsIgnoreCase("ALL");

        if (hasQuery || hasStatus || hasPort) {
            list = officerRepository.searchOfficers(
                    hasQuery ? query.trim() : null,
                    hasStatus ? status.trim() : null,
                    hasPort ? harborPort.trim() : null
            );
        } else {
            list = officerRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public OfficerResponse getOfficerById(Long id) {
        OfficerDetails officer = officerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found with id: " + id));
        return mapToResponse(officer);
    }

    @Transactional
    public OfficerResponse createOfficer(OfficerRequest request) {
        // Validation: Unique Officer ID
        if (officerRepository.existsByOfficerId(request.getOfficerId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Officer ID '" + request.getOfficerId() + "' already exists");
        }

        // Validation: Unique Username
        if (officerRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username '" + request.getUsername() + "' is already taken");
        }

        // Validation: Password required and min 8 chars
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required and must be at least 8 characters long");
        }

        // Validation: Password match
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        OfficerDetails officer = OfficerDetails.builder()
                .officerId(request.getOfficerId().trim().toUpperCase())
                .name(request.getName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .harborPort(request.getHarborPort().trim())
                .username(request.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole().trim().toUpperCase() : "OFFICER")
                .status(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE")
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "Super Admin")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        OfficerDetails saved = officerRepository.save(officer);
        return mapToResponse(saved);
    }

    @Transactional
    public OfficerResponse updateOfficer(Long id, OfficerRequest request) {
        OfficerDetails officer = officerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found with id: " + id));

        // Check if officerId changed and is taken by another record
        if (request.getOfficerId() != null && !request.getOfficerId().equalsIgnoreCase(officer.getOfficerId())) {
            if (officerRepository.existsByOfficerIdAndIdNot(request.getOfficerId().trim().toUpperCase(), id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Officer ID '" + request.getOfficerId() + "' is already taken");
            }
            officer.setOfficerId(request.getOfficerId().trim().toUpperCase());
        }

        // Check if username changed and is taken by another record
        if (request.getUsername() != null && !request.getUsername().equalsIgnoreCase(officer.getUsername())) {
            if (officerRepository.existsByUsernameAndIdNot(request.getUsername().trim().toLowerCase(), id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username '" + request.getUsername() + "' is already taken");
            }
            officer.setUsername(request.getUsername().trim().toLowerCase());
        }

        if (request.getName() != null) {
            officer.setName(request.getName().trim());
        }
        if (request.getPhoneNumber() != null) {
            officer.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getHarborPort() != null) {
            officer.setHarborPort(request.getHarborPort().trim());
        }
        if (request.getRole() != null) {
            officer.setRole(request.getRole().trim().toUpperCase());
        }
        if (request.getStatus() != null) {
            officer.setStatus(request.getStatus().trim().toUpperCase());
        }

        // If password is provided during update
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getPassword().length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
            }
            if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
            }
            officer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        officer.setUpdatedAt(LocalDateTime.now());
        OfficerDetails updated = officerRepository.save(officer);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteOfficer(Long id) {
        if (!officerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found with id: " + id);
        }
        officerRepository.deleteById(id);
    }

    @Transactional
    public OfficerResponse updateStatus(Long id, String status) {
        OfficerDetails officer = officerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found with id: " + id));

        String normalizedStatus = status.trim().toUpperCase();
        if (!normalizedStatus.equals("ACTIVE") && !normalizedStatus.equals("INACTIVE")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status. Must be ACTIVE or INACTIVE");
        }

        officer.setStatus(normalizedStatus);
        officer.setUpdatedAt(LocalDateTime.now());
        OfficerDetails updated = officerRepository.save(officer);
        return mapToResponse(updated);
    }

    @Transactional
    public OfficerResponse resetPassword(Long id, String newPassword) {
        OfficerDetails officer = officerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found with id: " + id));

        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters long");
        }

        officer.setPassword(passwordEncoder.encode(newPassword.trim()));
        officer.setUpdatedAt(LocalDateTime.now());
        OfficerDetails updated = officerRepository.save(officer);
        return mapToResponse(updated);
    }

    public SuperAdminDashboardStatsResponse getDashboardStats() {
        long totalOfficers = officerRepository.count();
        long activeOfficers = officerRepository.countByStatus("ACTIVE");
        long inactiveOfficers = officerRepository.countByStatus("INACTIVE");

        long totalPermits = permitRepository.count();
        long approvedPermits = permitRepository.countByStatus("APPROVED");
        long pendingPermits = permitRepository.countByStatus("PENDING");

        List<OfficerResponse> recentlyAdded = officerRepository.findTop5ByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());

        // Officers grouped by Harbor Port
        List<OfficerDetails> all = officerRepository.findAll();
        Map<String, Long> byPort = all.stream()
                .collect(Collectors.groupingBy(OfficerDetails::getHarborPort, Collectors.counting()));

        // Recent system activities
        List<Map<String, Object>> activities = new ArrayList<>();
        for (OfficerResponse o : recentlyAdded) {
            activities.add(Map.of(
                    "id", o.getId(),
                    "type", "OFFICER_CREATED",
                    "title", "New Officer Registered",
                    "description", o.getName() + " (" + o.getOfficerId() + ") assigned to " + o.getHarborPort(),
                    "timestamp", o.getFormattedCreatedAt() != null ? o.getFormattedCreatedAt() : "Recently",
                    "status", o.getStatus()
            ));
        }

        return SuperAdminDashboardStatsResponse.builder()
                .totalOfficers(totalOfficers)
                .activeOfficers(activeOfficers)
                .inactiveOfficers(inactiveOfficers)
                .totalPermits(totalPermits)
                .approvedPermits(approvedPermits)
                .pendingPermits(pendingPermits)
                .recentlyAddedOfficers(recentlyAdded)
                .recentActivity(activities)
                .officersByPort(byPort)
                .build();
    }

    private OfficerResponse mapToResponse(OfficerDetails o) {
        return OfficerResponse.builder()
                .id(o.getId())
                .officerId(o.getOfficerId())
                .name(o.getName())
                .phoneNumber(o.getPhoneNumber())
                .harborPort(o.getHarborPort())
                .username(o.getUsername())
                .role(o.getRole())
                .status(o.getStatus())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .createdBy(o.getCreatedBy())
                .formattedCreatedAt(o.getCreatedAt() != null ? o.getCreatedAt().format(dateFormatter) : "N/A")
                .build();
    }
}
