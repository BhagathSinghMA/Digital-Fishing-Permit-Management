package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.Crew;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrewRepository extends JpaRepository<Crew, Long> {
    List<Crew> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumberAndFishermanId(String registrationNumber, String fishermanId);
    void deleteByRegistrationNumber(String registrationNumber);
    void deleteByFishermanId(String fishermanId);
}
