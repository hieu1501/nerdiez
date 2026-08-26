package com.tmb.csnerd.demo.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "topics")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "slug_name", unique = true, nullable = false,  length = 255)
    private String slugName;

    @Column(name = "name", nullable = false,  length = 255)
    private String name;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany(mappedBy = "topics", fetch = FetchType.LAZY)
    private Set<Post> posts;

    public void addPost(Post post) {
        if (posts == null) posts = new HashSet<>();
        posts.add(post);
    }

    public void removePost(Post post) {
        if (posts == null) return;
        posts.remove(post);
    }
}