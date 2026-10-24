package com.backend.FishingPermit.service;

import com.backend.FishingPermit.dto.ApplicationStatusResponse;
import com.backend.FishingPermit.dto.SystemSettingsResponse;
import com.backend.FishingPermit.dto.UpdateApplicationStatusRequest;
import com.backend.FishingPermit.entity.SystemSetting;
import com.backend.FishingPermit.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SystemSettingsService {

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingsService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    @PostConstruct
    public void initSettings() {
        if (systemSettingRepository.count() == 0) {
            SystemSetting setting = SystemSetting.builder()
                    .permitApplicationOpen(true)
                    .updatedBy("System Initializer")
                    .updatedAt(LocalDateTime.now())
                    .build();
            systemSettingRepository.save(setting);
        }
    }

    public SystemSetting getOrCreateSetting() {
        return systemSettingRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> systemSettingRepository.save(
                        SystemSetting.builder()
                                .permitApplicationOpen(true)
                                .updatedBy("Admin")
                                .updatedAt(LocalDateTime.now())
                                .build()
                ));
    }

    public SystemSettingsResponse getSettings() {
        SystemSetting setting = getOrCreateSetting();
        return SystemSettingsResponse.builder()
                .permitApplicationOpen(setting.getPermitApplicationOpen())
                .updatedAt(setting.getUpdatedAt())
                .updatedBy(setting.getUpdatedBy())
                .systemVersion("v2.4.0 (2026 Release)")
                .statusMessage(Boolean.TRUE.equals(setting.getPermitApplicationOpen()) ? "Applications are OPEN" : "Applications are CLOSED")
                .build();
    }

    @Transactional
    public SystemSettingsResponse updateApplicationStatus(UpdateApplicationStatusRequest request, String updatedBy) {
        SystemSetting setting = getOrCreateSetting();
        setting.setPermitApplicationOpen(request.getPermitApplicationOpen());
        setting.setUpdatedAt(LocalDateTime.now());
        setting.setUpdatedBy(updatedBy != null ? updatedBy : "Admin");
        systemSettingRepository.save(setting);

        return getSettings();
    }

    public ApplicationStatusResponse getMobileAppStatus() {
        SystemSetting setting = getOrCreateSetting();
        boolean isOpen = Boolean.TRUE.equals(setting.getPermitApplicationOpen());
        if (isOpen) {
            return ApplicationStatusResponse.builder()
                    .permitApplicationOpen(true)
                    .title("Permits Open")
                    .message("Daily fishing permit applications are currently open.")
                    .build();
        } else {
            return ApplicationStatusResponse.builder()
                    .permitApplicationOpen(false)
                    .title("Permit Closed")
                    .message("Today's fishing permit applications are currently closed. Please try again later.")
                    .build();
        }
    }
}
