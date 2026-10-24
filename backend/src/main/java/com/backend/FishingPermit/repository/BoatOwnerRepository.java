package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.BoatOwner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoatOwnerRepository extends JpaRepository<BoatOwner, Long> {
    Optional<BoatOwner> findByRegistrationNumber(String registrationNumber);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByFishermanId(String fishermanId);

    Optional<BoatOwner> findByFishermanId(String fishermanId);

    void deleteByRegistrationNumber(String registrationNumber);

    @Query("SELECT b FROM BoatOwner b WHERE " +
            "LOWER(b.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.boatName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.ownerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.district) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.port) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.fishermanId) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<BoatOwner> searchBoatOwners(@Param("search") String search, Pageable pageable);
}
