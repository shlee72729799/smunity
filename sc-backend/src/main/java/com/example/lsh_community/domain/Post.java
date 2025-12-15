package com.example.lsh_community.domain;

<<<<<<< Updated upstream
import jakarta.persistence.*;
=======
import com.example.lsh_community.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
>>>>>>> Stashed changes
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
<<<<<<< Updated upstream
=======
@Getter
@NoArgsConstructor
>>>>>>> Stashed changes
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

<<<<<<< Updated upstream
    // 어느 게시판의 글인지
=======
>>>>>>> Stashed changes
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

<<<<<<< Updated upstream
=======
    // 작성자 정보 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity author;

>>>>>>> Stashed changes
    @Column(nullable = false)
    private String title;

    @Lob
<<<<<<< Updated upstream
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
=======
    @Column(columnDefinition = "TEXT")
    private String content;

    private long viewCount = 0L;
    private long likeCount = 0L;
    private long commentCount = 0L;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private boolean isAnonymous;

    // 생성자 수정 (작성자 포함)
    public Post(Board board, UserEntity author, String title, String content, boolean isAnonymous) {
        this.board = board;
        this.author = author;
        this.title = title;
        this.content = content;
        this.isAnonymous = isAnonymous;
        this.createdAt = LocalDateTime.now();
    }

    public boolean isAnonymous() { return isAnonymous; }

    public void increaseView() { this.viewCount++; }

    // 좋아요 수 변경 메서드
    public void updateLikeCount(long count) {
        this.likeCount = count;
    }

    // 게시글 수정
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
        this.updatedAt = LocalDateTime.now();
    }

    // 댓글 수 증가 메서드
    public void increaseCommentCount() {
        this.commentCount++;
    }

    // 댓글 수 감소 메서드
    public void decreaseCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }
}
>>>>>>> Stashed changes
