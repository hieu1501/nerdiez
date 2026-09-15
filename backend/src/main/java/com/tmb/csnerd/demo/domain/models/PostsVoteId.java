package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class PostsVoteId implements Serializable {
    @NotNull
    @Column(name = "post_id", nullable = false)
    private Long postId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostsVoteId that = (PostsVoteId) o;
        return Objects.equals(postId, that.postId) &&
                Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, userId);
    }
}