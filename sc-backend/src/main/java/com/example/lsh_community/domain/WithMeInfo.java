package com.example.lsh_community.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
public class WithMeInfo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    private LocalDateTime recruitmentDeadline;
    private LocalDateTime meetingTime;
    private String meetingLocation;
    private int maxParticipants;
    private int currentParticipants = 0;

    public WithMeInfo(Post post, LocalDateTime recruitmentDeadline, LocalDateTime meetingTime, String meetingLocation, int maxParticipants) {
        this.post = post;
        this.recruitmentDeadline = recruitmentDeadline;
        this.meetingTime = meetingTime;
        this.meetingLocation = meetingLocation;
        this.maxParticipants = maxParticipants;
    }

    public void increaseParticipant() { this.currentParticipants++; }
    public void decreaseParticipant() { if(this.currentParticipants > 0) this.currentParticipants--; }
}