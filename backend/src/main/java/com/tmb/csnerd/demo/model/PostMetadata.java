package com.tmb.csnerd.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Table(name = "post")
public class PostMetadata {
    @Id
    @Column(name = "post_id", nullable = false)
    private Integer id;

    @Column(name = "description")
    private String description;

    @Column(name = "featured_image")
    private String featuredImage;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @PrimaryKeyJoinColumn
    private Post post;
}