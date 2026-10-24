package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.Fisherman;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FishermanRepository extends JpaRepository<Fisherman, String> {
    Optional<Fisherman> findByFishermanId(String fishermanId);

    Optional<Fisherman> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByFishermanId(String fishermanId);

    void deleteByFishermanId(String fishermanId);

    List<Fisherman> findByFishermanIdContainingIgnoreCase(String fishermanId);

    @Query("SELECT f FROM Fisherman f WHERE " +
            "LOWER(f.fishermanId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.port) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.village) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.district) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.state) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Fisherman> searchFishermen(@Param("search") String search, Pageable pageable);
}
