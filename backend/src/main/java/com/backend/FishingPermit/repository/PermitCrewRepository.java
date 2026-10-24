package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.PermitCrew;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermitCrewRepository extends JpaRepository<PermitCrew, Long> {
    List<PermitCrew> findByPermitId(Long permitId);
    int countByPermitId(Long permitId);
    List<PermitCrew> findByFishermanId(String fishermanId);
    List<PermitCrew> findByFishermanIdIn(List<String> fishermanIds);
    List<PermitCrew> findByFishermanIdIgnoreCase(String fishermanId);
    List<PermitCrew> findByFishermanIdInIgnoreCase(List<String> fishermanIds);
    void deleteByPermitId(Long permitId);
    void deleteByFishermanIdIgnoreCase(String fishermanId);
}
