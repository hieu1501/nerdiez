package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Table(name = "posts_metadata")
public class PostMetadata {
    @Id
    @Column(name = "post_id")
    private Long id;

    @Column(name = "description")
    private String description;

    @Column(name = "featured_image")
    private String featuredImage;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "post_id")
    private Post post;
}