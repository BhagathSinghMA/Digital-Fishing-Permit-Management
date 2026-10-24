package com.backend.FishingPermit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "permit", indexes = {
        @Index(name = "idx_permit_reg_num", columnList = "registration_number"),
        @Index(name = "idx_permit_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "permit_number", length = 100)
    private String permitNumber;

    @Column(name = "registration_number", nullable = false, length = 50)
    private String registrationNumber;

    @Column(name = "boat_name", length = 100)
    private String boatName;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "boat_owner_id")
    private Long boatOwnerId;

    @Column(name = "permit_date", nullable = false)
    private LocalDate permitDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PENDING, APPROVED, REJECTED, EXPIRED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.permitDate == null) {
            this.permitDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
