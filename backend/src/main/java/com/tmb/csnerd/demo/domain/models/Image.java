package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "images", schema = "nerdiez")
public class Image {
    @Id
    @Size(max = 45)
    @NotNull
    @Column(name = "path", nullable = false)
    private String path;

    @CreatedDate
    @Column(name = "created_at")
    private Instant createdAt;

    @NotNull
    @Column(name = "use_count", nullable = false)
    private Long useCount = 0L;
}