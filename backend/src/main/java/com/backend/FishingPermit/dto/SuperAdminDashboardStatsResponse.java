package com.backend.FishingPermit.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdminDashboardStatsResponse {

    private long totalOfficers;
    private long activeOfficers;
    private long inactiveOfficers;
    private long totalPermits;
    private long approvedPermits;
    private long pendingPermits;
    private List<OfficerResponse> recentlyAddedOfficers;
    private List<Map<String, Object>> recentActivity;
    private Map<String, Long> officersByPort;
}
