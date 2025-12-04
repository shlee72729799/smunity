package com.example.lsh_community.domain;

import com.example.lsh_community.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post; // 어느 글에 달린 댓글인지

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity author; // 댓글 작성자

    @Column(nullable = false)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Comment(Post post, UserEntity author, String content) {
        this.post = post;
        this.author = author;
        this.content = content;
    }

    // 댓글 수정
    public void update(String content) {
        this.content = content;
    }
}