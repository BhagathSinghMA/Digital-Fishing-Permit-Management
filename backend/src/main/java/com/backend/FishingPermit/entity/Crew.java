package com.backend.FishingPermit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "crew_member", indexes = {
        @Index(name = "idx_crew_reg_num", columnList = "registration_number"),
        @Index(name = "idx_crew_fisherman_id", columnList = "fisherman_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crew {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, length = 50)
    private String registrationNumber;

    @Column(name = "fisherman_id", nullable = false, length = 50)
    private String fishermanId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
