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
        // 이미 데이터가 있으면 초기 데이터 생성 안 함
        if (boardRepository.count() > 0) {
            return;
        }

        // Board 엔티티 생성자: Board(String code, String name, String description)
        boardRepository.save(new Board("FREE", "자유게시판", "자유롭게 이야기하는 게시판"));
        boardRepository.save(new Board("ANON1", "익명게시판1", "익명으로 이야기하는 게시판 1"));
        boardRepository.save(new Board("ANON2", "익명게시판2", "익명으로 이야기하는 게시판 2"));
        boardRepository.save(new Board("JOB", "취업게시판", "취업 관련 정보를 공유하는 게시판"));
        boardRepository.save(new Board("RECRUIT", "모집공고", "모집 공고를 올리는 게시판"));
    }
}
