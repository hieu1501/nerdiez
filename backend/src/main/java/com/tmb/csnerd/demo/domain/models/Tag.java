package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "tags")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "slug", unique = true, nullable = false, length = 255)
    private String slug;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private Set<Post> posts;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private Set<Topic> topics;
}