package com.backend.FishingPermit.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permit_crew", indexes = {
        @Index(name = "idx_permit_crew_permit_id", columnList = "permit_id"),
        @Index(name = "idx_permit_crew_fisherman_id", columnList = "fisherman_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitCrew {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "permit_id", nullable = false)
    private Long permitId;

    @Column(name = "fisherman_id", nullable = false, length = 50)
    private String fishermanId;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
}
