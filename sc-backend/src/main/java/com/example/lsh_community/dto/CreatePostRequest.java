package com.example.lsh_community.dto;

public class CreatePostRequest {

    // "FREE", "ANON1", "ANON2", "JOB", "RECRUIT" 등
    private String boardCode;
    private String title;
    private String content;

    public CreatePostRequest() {
    }

    public String getBoardCode() {
        return boardCode;
    }

    public void setBoardCode(String boardCode) {
        this.boardCode = boardCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
