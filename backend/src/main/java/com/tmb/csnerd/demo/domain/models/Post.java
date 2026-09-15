package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.util.Pair;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Size(max = 300)
    @NotNull
    @Column(name = "public_uri", nullable = false, length = 300)
    private String publicUri;

    @Column(name = "title")
    private String title;

    @Size(max = 255)
    @NotNull
    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "content")
    private String content;

    @Column(name = "description")
    private String description;

    @Column(name = "featured_image")
    private String featuredImage;

    @CreatedDate
    @Column(name = "created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "posts_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "post")
    private PostMetadata postMetadata;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostsVote> votes;
}
