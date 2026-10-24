package com.backend.FishingPermit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "permit_history", indexes = {
        @Index(name = "idx_permit_date", columnList = "permit_date"),
        @Index(name = "idx_permit_registration", columnList = "registration_number"),
        @Index(name = "idx_permit_fisherman", columnList = "fisherman_id"),
        @Index(name = "idx_permit_token", columnList = "token_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permit_id")
    private Long permitId;

    @Column(name = "token_number", nullable = false, unique = true, length = 50, insertable = false, updatable = false)
    private String tokenNumber;

    @Column(name = "permit_date", nullable = false)
    private LocalDate permitDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_number", referencedColumnName = "registration_number", nullable = false)
    private BoatOwner boatOwner;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(name = "crew_members", columnDefinition = "TEXT")
    private String crewMembers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fisherman_id", referencedColumnName = "fisherman_id", nullable = false)
    private Fisherman fisherman;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.permitDate == null) {
            this.permitDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = "APPROVED";
        }
        this.createdAt = LocalDateTime.now();
    }
}
