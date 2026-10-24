package com.backend.FishingPermit.repository;

import com.backend.FishingPermit.entity.OfficerDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficerDetailsRepository extends JpaRepository<OfficerDetails, Long> {

    Optional<OfficerDetails> findByOfficerId(String officerId);

    Optional<OfficerDetails> findByUsername(String username);

    boolean existsByOfficerId(String officerId);

    boolean existsByUsername(String username);

    boolean existsByOfficerIdAndIdNot(String officerId, Long id);

    boolean existsByUsernameAndIdNot(String username, Long id);

    List<OfficerDetails> findByStatusOrderByCreatedAtDesc(String status);

    List<OfficerDetails> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);

    @Query("SELECT o FROM OfficerDetails o WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.officerId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.harborPort) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR :status = 'ALL' OR o.status = :status) AND " +
           "(:harborPort IS NULL OR :harborPort = 'ALL' OR o.harborPort = :harborPort) " +
           "ORDER BY o.createdAt DESC")
    List<OfficerDetails> searchOfficers(
            @Param("query") String query,
            @Param("status") String status,
            @Param("harborPort") String harborPort
    );

    List<OfficerDetails> findTop5ByOrderByCreatedAtDesc();
}
