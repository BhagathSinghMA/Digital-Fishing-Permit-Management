package com.backend.FishingPermit.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long totalBoatOwners;
    private long totalFishermen;
    private long todayPermitRequests;
    private long todayApprovedPermits;
    private long todayRejectedPermits;
    private long pendingPermitRequests;
    private long activePermits;
    private long expiredPermits;
    private boolean permitApplicationOpen;
}
