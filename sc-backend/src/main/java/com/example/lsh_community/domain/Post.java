package com.example.lsh_community.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어느 게시판의 글인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    @Column(nullable = false)
    private String title;

    @Lob
    private String content;

    @Column(nullable = false)
    private long viewCount = 0L;

    @Column(nullable = false)
    private long likeCount = 0L;

    @Column(nullable = false)
    private long commentCount = 0L;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // JPA용 기본 생성자
    protected Post() {
    }

    // 서비스에서 사용할 생성자
    public Post(Board board, String title, String content) {
        this.board = board;
        this.title = title;
        this.content = content;
        this.viewCount = 0L;
        this.likeCount = 0L;
        this.commentCount = 0L;
        this.createdAt = LocalDateTime.now();
    }

    // ===== Getter들 =====
    public Long getId() {
        return id;
    }

    public Board getBoard() {
        return board;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public long getViewCount() {
        return viewCount;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ===== 비즈니스 메서드 =====
    public void increaseView() {
        this.viewCount++;
    }
}
