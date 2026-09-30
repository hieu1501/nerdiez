package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "topics")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Size(max = 300)
    @NotNull
    @Column(name = "public_uri", nullable = false, length = 300)
    private String publicUri;

    @Column(name = "slug", nullable = false,  length = 255)
    private String slug;

    @Column(name = "name", nullable = false,  length = 255)
    private String name;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "topics_tags",
        joinColumns = @JoinColumn(name = "topic_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
}