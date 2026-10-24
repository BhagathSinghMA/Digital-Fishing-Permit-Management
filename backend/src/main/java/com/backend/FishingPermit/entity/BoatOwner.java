package com.backend.FishingPermit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "boat_owner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoatOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "boat_name", nullable = false, length = 100)
    private String boatName;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "fisherman_id", length = 50)
    private String fishermanId;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "district", length = 50)
    private String district;

    @Column(name = "port", length = 100)
    private String port;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
