package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.AdminPermitListItem;
import com.backend.FishingPermit.dto.DashboardStatsResponse;
import com.backend.FishingPermit.entity.Permit;
import com.backend.FishingPermit.repository.BoatOwnerRepository;
import com.backend.FishingPermit.repository.FishermanRepository;
import com.backend.FishingPermit.repository.PermitCrewRepository;
import com.backend.FishingPermit.repository.PermitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final BoatOwnerRepository boatOwnerRepository;
    private final FishermanRepository fishermanRepository;
    private final PermitRepository permitRepository;
    private final PermitCrewRepository permitCrewRepository;
    private final SystemSettingsService systemSettingsService;

    public AdminDashboardService(BoatOwnerRepository boatOwnerRepository,
                                 FishermanRepository fishermanRepository,
                                 PermitRepository permitRepository,
                                 PermitCrewRepository permitCrewRepository,
                                 SystemSettingsService systemSettingsService) {
        this.boatOwnerRepository = boatOwnerRepository;
        this.fishermanRepository = fishermanRepository;
        this.permitRepository = permitRepository;
        this.permitCrewRepository = permitCrewRepository;
        this.systemSettingsService = systemSettingsService;
    }

    public DashboardStatsResponse getDashboardStats(String harbor) {
        return getDashboardStats();
    }

    public DashboardStatsResponse getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        long totalBoatOwners = boatOwnerRepository.count();
        long totalFishermen = fishermanRepository.count();
        long todayPermitRequests = permitRepository.countTodayRequests(today);
        long todayApprovedPermits = permitRepository.countTodayApproved(today);
        long todayRejectedPermits = permitRepository.countTodayRejected(today);
        long pendingPermitRequests = permitRepository.countByStatus("PENDING");
        long activePermits = permitRepository.countActivePermits(now);
        long expiredPermits = permitRepository.countExpiredPermits(now);
        boolean isOpen = Boolean.TRUE.equals(systemSettingsService.getOrCreateSetting().getPermitApplicationOpen());

        return DashboardStatsResponse.builder()
                .totalBoatOwners(totalBoatOwners)
                .totalFishermen(totalFishermen)
                .todayPermitRequests(todayPermitRequests)
                .todayApprovedPermits(todayApprovedPermits)
                .todayRejectedPermits(todayRejectedPermits)
                .pendingPermitRequests(pendingPermitRequests)
                .activePermits(activePermits)
                .expiredPermits(expiredPermits)
                .permitApplicationOpen(isOpen)
                .build();
    }

    public List<AdminPermitListItem> getRecentPermits(String harbor, int limit) {
        return getRecentPermits(limit);
    }

    public List<AdminPermitListItem> getRecentPermits(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        Page<Permit> permits = permitRepository.findAll(pageRequest);
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return permits.getContent().stream().map(p -> {
            int crewCount = permitCrewRepository.countByPermitId(p.getId());
            return AdminPermitListItem.builder()
                    .id(p.getId())
                    .permitNumber(p.getPermitNumber() != null ? p.getPermitNumber()
                            : "TN-FP-2026-" + String.format("%06d", p.getId()))
                    .boatName(p.getBoatName())
                    .registrationNumber(p.getRegistrationNumber())
                    .ownerName(p.getOwnerName())
                    .crewCount(crewCount)
                    .status(p.getStatus())
                    .submittedTime(p.getCreatedAt() != null ? p.getCreatedAt().format(timeFmt)
                            : (p.getPermitDate() != null ? p.getPermitDate().toString() : "N/A"))
                    .permitDate(p.getPermitDate())
                    .expiryDate(p.getExpiryDate())
                    .rejectionReason(p.getRejectionReason())
                    .build();
        }).collect(Collectors.toList());
    }
}
