package com.example.lsh_community.dto;

<<<<<<< Updated upstream
public class CreatePostRequest {

    // "FREE", "ANON1", "ANON2", "JOB", "RECRUIT" 등
    private String boardCode;
    private String title;
    private String content;
=======
import java.time.LocalDateTime;

public class CreatePostRequest {
    private String boardCode;
    private String title;
    private String content;
    private boolean isAnonymous;
    // With Me 전용 필드
    private LocalDateTime recruitmentDeadline; // 모집 마감
    private LocalDateTime meetingTime;         // 약속 시간
    private String meetingLocation;            // 약속 장소
    private Integer maxParticipants;           // 모집 인원
>>>>>>> Stashed changes

    public CreatePostRequest() {
    }

<<<<<<< Updated upstream
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
=======
    // Getter & Setter
    public String getBoardCode() { return boardCode; }
    public void setBoardCode(String boardCode) { this.boardCode = boardCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getRecruitmentDeadline() { return recruitmentDeadline; }
    public void setRecruitmentDeadline(LocalDateTime recruitmentDeadline) { this.recruitmentDeadline = recruitmentDeadline; }

    public LocalDateTime getMeetingTime() { return meetingTime; }
    public void setMeetingTime(LocalDateTime meetingTime) { this.meetingTime = meetingTime; }

    public String getMeetingLocation() { return meetingLocation; }
    public void setMeetingLocation(String meetingLocation) { this.meetingLocation = meetingLocation; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(boolean isAnonymous) { this.isAnonymous = isAnonymous; }
>>>>>>> Stashed changes
}
