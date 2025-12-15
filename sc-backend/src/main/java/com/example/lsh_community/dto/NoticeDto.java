package com.example.lsh_community.dto;

public class NoticeDto {
    private String title;
    private String url;

    public NoticeDto() {
    }

    public NoticeDto(String title, String url) {
        this.title = title;
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public String getUrl() {
        return url;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
