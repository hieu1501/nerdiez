package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Entity
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Table(name = "posts_metadata")
public class PostMetadata {
    @Id
    @Column(name = "post_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "post_id")
    private Post post;

    @NotNull
    @Column(name = "upvote_count")
    private Long upvoteCount = 0L;

    @NotNull
    @Column(name = "downvote_count")
    private Long downvoteCount = 0L;

    @NotNull
    @Column(name = "vote_version", nullable = false)
    private Long voteVersion = 1L;
}