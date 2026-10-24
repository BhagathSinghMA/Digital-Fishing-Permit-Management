package com.backend.FishingPermit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fisherman")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fisherman {

    @Id
    @Column(name = "fisherman_id", length = 50)
    private String fishermanId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "phone_number", nullable = false, unique = true, length = 15)
    private String phoneNumber;

    @Column(name = "district", length = 50)
    private String district;

    @Column(name = "port", length = 100)
    private String port;

    @Column(name = "village", length = 50)
    private String village;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
