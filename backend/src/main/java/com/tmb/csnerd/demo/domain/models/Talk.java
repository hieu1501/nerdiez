package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "talks", schema = "nerdiez")
public class Talk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 300)
    @NotNull
    @Column(name = "public_uri", nullable = false, length = 300)
    private String publicUri;

    @Size(max = 10_000)
    @Column(name = "content")
    private String content;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ColumnDefault("0")
    @Column(name = "is_active")
    private Boolean isActive;

    @OneToOne(mappedBy = "talk", cascade = CascadeType.ALL, orphanRemoval = true)
    private TalksMetadata talkMetadata;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "talk", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TalksVote> votes = new HashSet<>();
}
