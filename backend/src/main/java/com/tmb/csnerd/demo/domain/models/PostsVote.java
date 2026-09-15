package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Table(name = "posts_vote")
public class PostsVote {
    @EmbeddedId
    private PostsVoteId id;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "vote", nullable = false)
    private Byte vote;

    @MapsId("postId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}