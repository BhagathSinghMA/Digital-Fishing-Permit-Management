package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.PermitHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermitHistoryRepository extends JpaRepository<PermitHistory, Long> {
    Optional<PermitHistory> findByTokenNumber(String tokenNumber);
    List<PermitHistory> findByFisherman_FishermanId(String fishermanId);
    List<PermitHistory> findByBoatOwner_RegistrationNumber(String registrationNumber);
    List<PermitHistory> findByPermitDate(LocalDate permitDate);
    void deleteByFisherman_FishermanId(String fishermanId);
    void deleteByBoatOwner_RegistrationNumber(String registrationNumber);
}
