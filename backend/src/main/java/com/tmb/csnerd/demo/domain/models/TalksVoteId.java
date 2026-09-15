package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Getter @Setter @AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class TalksVoteId implements Serializable {
    @NotNull
    @Column(name = "talk_id", nullable = false)
    private Long talkId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TalksVoteId that = (TalksVoteId) o;
        return Objects.equals(talkId, that.talkId) &&
                Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(talkId, userId);
    }
}