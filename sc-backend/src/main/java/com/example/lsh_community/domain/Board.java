package com.example.lsh_community.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;        // POPULAR, FREE, ANON1, ...

    @Column(nullable = false)
    private String name;        // 화면에 보여줄 이름

    @Column
    private String description; // 설명

    protected Board() {
    }

    public Board(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }
}
