package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "talks_metadata", schema = "nerdiez")
public class TalksMetadata {
    @Id
    @Column(name = "talk_id", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "talk_id", nullable = false)
    private Talk talk;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "upvote_count", nullable = false)
    private Long upvoteCount = 0L;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "downvote_count", nullable = false)
    private Long downvoteCount = 0L;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "vote_version", nullable = false)
    private Long voteVersion = 1L;
}
