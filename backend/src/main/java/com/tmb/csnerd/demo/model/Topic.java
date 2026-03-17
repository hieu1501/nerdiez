package com.tmb.csnerd.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "topics")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id")
    private Integer id;

    @Column(name = "slug_name")
    private String slugName;

    @Column(name = "name")
    private String name;

    @ManyToMany(mappedBy = "topics", fetch = FetchType.LAZY)
    private Set<Post> posts;
}