package com.example.lsh_community;

import com.example.lsh_community.domain.Board;
import com.example.lsh_community.repository.BoardRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final BoardRepository boardRepository;

    public DataInitializer(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @PostConstruct
    public void init() {
        createBoardIfNotFound("FREE", "자유게시판", "자유롭게 이야기하는 게시판");
        createBoardIfNotFound("ANON1", "익명게시판1", "익명으로 이야기하는 게시판 1");
        createBoardIfNotFound("ANON2", "익명게시판2", "익명으로 이야기하는 게시판 2");
        createBoardIfNotFound("JOB", "취업게시판", "취업 관련 정보를 공유하는 게시판");
        createBoardIfNotFound("RECRUIT", "모집공고", "모집 공고를 올리는 게시판");
        createBoardIfNotFound("WITHME", "With Me", "같이 할 사람 구해요!");
    }

    // 중복 방지 헬퍼 메서드
    private void createBoardIfNotFound(String code, String name, String description) {
        // findByCode로 조회해서 없을 때만(.isEmpty()) 저장
        if (boardRepository.findByCode(code).isEmpty()) {
            boardRepository.save(new Board(code, name, description));
        }
    }
}