package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.Permit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermitRepository extends JpaRepository<Permit, Long> {
       List<Permit> findByRegistrationNumberAndStatusIn(String registrationNumber, List<String> statuses);

       List<Permit> findByStatusOrderByCreatedAtDesc(String status);

       List<Permit> findByRegistrationNumberOrderByCreatedAtDesc(String registrationNumber);

       Optional<Permit> findFirstByRegistrationNumberOrderByCreatedAtDesc(String registrationNumber);

       List<Permit> findByIdInOrderByCreatedAtDesc(List<Long> ids);

       // Admin pagination & search queries
       Page<Permit> findByStatus(String status, Pageable pageable);

       @Query("SELECT p FROM Permit p WHERE p.status = :status AND (" +
                     "LOWER(p.permitNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.boatName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.ownerName) LIKE LOWER(CONCAT('%', :search, '%')))")
       Page<Permit> findByStatusAndSearch(@Param("status") String status, @Param("search") String search,
                     Pageable pageable);

       @Query("SELECT p FROM Permit p WHERE " +
                     "LOWER(p.permitNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.boatName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.ownerName) LIKE LOWER(CONCAT('%', :search, '%'))")
       Page<Permit> findBySearchOnly(@Param("search") String search, Pageable pageable);

       Page<Permit> findByPermitDate(LocalDate permitDate, Pageable pageable);

       @Query("SELECT p FROM Permit p WHERE p.permitDate = :permitDate AND (" +
                     "LOWER(p.permitNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.boatName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.ownerName) LIKE LOWER(CONCAT('%', :search, '%')))")
       Page<Permit> findByPermitDateAndSearch(@Param("permitDate") LocalDate permitDate, @Param("search") String search,
                     Pageable pageable);

       @Query("SELECT p FROM Permit p WHERE p.permitDate = :permitDate AND p.status = :status")
       Page<Permit> findByPermitDateAndStatus(@Param("permitDate") LocalDate permitDate, @Param("status") String status,
                     Pageable pageable);

       @Query("SELECT p FROM Permit p WHERE p.permitDate = :permitDate AND p.status = :status AND (" +
                     "LOWER(p.permitNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.boatName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(p.ownerName) LIKE LOWER(CONCAT('%', :search, '%')))")
       Page<Permit> findByPermitDateAndStatusAndSearch(@Param("permitDate") LocalDate permitDate,
                     @Param("status") String status, @Param("search") String search, Pageable pageable);

       // Dashboard count queries
       long countByStatus(String status);

       @Query("SELECT COUNT(p) FROM Permit p WHERE p.permitDate = :today")
       long countTodayRequests(@Param("today") LocalDate today);

       @Query("SELECT COUNT(p) FROM Permit p WHERE p.status = 'APPROVED' AND p.permitDate = :today")
       long countTodayApproved(@Param("today") LocalDate today);

       @Query("SELECT COUNT(p) FROM Permit p WHERE p.status = 'REJECTED' AND p.permitDate = :today")
       long countTodayRejected(@Param("today") LocalDate today);

       @Query("SELECT COUNT(p) FROM Permit p WHERE p.status = 'APPROVED' AND (p.expiryDate IS NULL OR p.expiryDate > :now)")
       long countActivePermits(@Param("now") LocalDateTime now);

       @Query("SELECT COUNT(p) FROM Permit p WHERE p.status = 'EXPIRED' OR (p.status = 'APPROVED' AND p.expiryDate IS NOT NULL AND p.expiryDate <= :now)")
       long countExpiredPermits(@Param("now") LocalDateTime now);
}
