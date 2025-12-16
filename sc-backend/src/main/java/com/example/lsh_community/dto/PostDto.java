package com.example.lsh_community.dto;

import com.example.lsh_community.domain.Post;
import com.example.lsh_community.domain.PostParticipant;
import com.example.lsh_community.domain.WithMeInfo;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

public record PostDto(
        Long id,
        String boardCode,
        String title,
        String writerName,
        String content,
        long viewCount,
        long likeCount,
        long commentCount,
        String createdAt,
        String updatedAt,
        boolean hasLiked, // 내가 좋아요 눌렀는지 여부
        WithMeDto withMeInfo // With Me 게시판 전용 정보 (일반 게시글이면 null)
) {

    // With Me 정보를 담는 내부 DTO
    public record WithMeDto(
            String recruitmentDeadline, // 모집 마감일
            String meetingTime,         // 약속 시간
            String meetingLocation,     // 약속 장소
            int maxParticipants,        // 모집 인원
            int currentParticipants,    // 현재 인원
            boolean isParticipating,    // 내가 참여 중인지
            boolean isFull,             // 모집 마감 여부 (인원 초과)
            boolean canCancel,          // 취소 가능 여부 (마감 30분 전 체크)
            boolean isConfirmed,
            List<String> participantNicknames // 참여자 닉네임 목록 (작성자에게만 보임)
    ) {}

    // 1. 상세 조회용 (With Me 정보 포함)
    public static PostDto from(Post p, boolean hasLiked, WithMeInfo withMeInfo, List<PostParticipant> participants, Long currentUserId) {
        String code = (p.getBoard() != null) ? p.getBoard().getCode() : null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 작성자 이름 결정
        String displayWriterName;

        // 1. 익명 게시판(ANON1)은 무조건 익명
        if ("ANON1".equals(code)) {
            displayWriterName = "익명";
        }
        // 2. 그 외 게시판은 사용자가 익명을 선택했으면 익명, 아니면 닉네임
        else {
            displayWriterName = p.isAnonymous() ? "익명" : (p.getAuthor() != null ? p.getAuthor().getNickname() : "알 수 없음");
        }

        WithMeDto withMeDto = null;

        // With Me 정보가 있고, 해당 게시판이 WITHME인 경우 DTO 생성
        if (withMeInfo != null && "WITHME".equals(code)) {
            boolean isOwner = p.getAuthor().getId().equals(currentUserId);

            // 내가 참여 중인지 확인
            boolean isParticipating = false;
            if (currentUserId != null && participants != null) {
                isParticipating = participants.stream()
                        .anyMatch(ppt -> ppt.getUser().getId().equals(currentUserId));
            }

            // 모집 인원이 꽉 찼는지 확인
            boolean isFull = withMeInfo.getCurrentParticipants() >= withMeInfo.getMaxParticipants();

            // limitTime 변수 정의 (모집 마감 30분 전)
            LocalDateTime limitTime = withMeInfo.getRecruitmentDeadline().minusMinutes(30);

            // 확정 여부 계산 (현재 시간이 limitTime을 지났는지)
            boolean isConfirmed = LocalDateTime.now().isAfter(limitTime);

            // 취소 가능 여부 (참여 중이고, 아직 확정 전이어야 함)
            boolean canCancel = isParticipating && !isConfirmed;

            // 참여자 닉네임 목록 (작성자에게만 공개, 아니면 빈 리스트)
            List<String> nicknames = Collections.emptyList();
            if (isOwner && participants != null) {
                nicknames = participants.stream()
                        .map(ppt -> ppt.getUser().getNickname())
                        .toList();
            }

            withMeDto = new WithMeDto(
                    withMeInfo.getRecruitmentDeadline().format(formatter),
                    withMeInfo.getMeetingTime().format(formatter),
                    withMeInfo.getMeetingLocation(),
                    withMeInfo.getMaxParticipants(),
                    withMeInfo.getCurrentParticipants(),
                    isParticipating,
                    isFull,
                    canCancel,
                    isConfirmed,
                    nicknames
            );
        }

        return new PostDto(
                p.getId(),
                code,
                p.getTitle(),
                displayWriterName,
                p.getContent(),
                p.getViewCount(),
                p.getLikeCount(),
                p.getCommentCount(),
                p.getCreatedAt().format(formatter),
                p.getUpdatedAt() != null ? p.getUpdatedAt().format(formatter) : null,
                hasLiked,
                withMeDto
        );
    }

    // 2. 일반 상세 조회용 (With Me 정보 없음)
    public static PostDto from(Post p, boolean hasLiked) {
        return from(p, hasLiked, null, null, null);
    }

    // 3. 목록 조회용 (간소화 버전)
    public static PostDto from(Post p) {
        String code = (p.getBoard() != null) ? p.getBoard().getCode() : null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"); // 목록은 초 단위 생략

        String displayWriterName;

        // 1. '익명게시판(ANON1)'인 경우 -> 무조건 "익명"
        if ("ANON1".equals(code)) {
            displayWriterName = "익명";
        }
        // 2. 그 외(ANON2, FREE, JOB 등) -> 작성자가 익명 체크를 했으면 "익명", 아니면 닉네임
        else {
            if (p.isAnonymous()) {
                displayWriterName = "익명";
            } else {
                displayWriterName = (p.getAuthor() != null) ? p.getAuthor().getNickname() : "알 수 없음";
            }
        }

        return new PostDto(
                p.getId(),
                code,
                p.getTitle(),
                displayWriterName,
                p.getContent(), // 목록에서 내용은 필요 없으면 null 처리해도 됨
                p.getViewCount(),
                p.getLikeCount(),
                p.getCommentCount(),
                p.getCreatedAt().format(formatter),
                null,
                false,
                null // 목록 조회 시에는 WithMe 정보 생략 (성능 최적화)
        );
    }
}