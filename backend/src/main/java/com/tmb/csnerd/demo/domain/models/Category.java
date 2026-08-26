package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "slug_name", unique = true, nullable = false,  length = 255)
    private String slugName;

    @Column(name = "name", nullable = false,  length = 255)
    private String name;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = false;
}