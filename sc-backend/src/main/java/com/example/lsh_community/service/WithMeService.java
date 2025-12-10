package com.example.lsh_community.service;

import com.example.lsh_community.domain.*;
import com.example.lsh_community.dto.MyWithMeResponse;
import com.example.lsh_community.dto.PostDto;
import com.example.lsh_community.entity.UserEntity;
import com.example.lsh_community.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WithMeService {

    private final WithMeInfoRepository withMeInfoRepository;
    private final PostParticipantRepository postParticipantRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    // 참여하기
    public void joinWithMe(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow();
        UserEntity user = userRepository.findById(userId).orElseThrow();
        WithMeInfo info = withMeInfoRepository.findByPost(post)
                .orElseThrow(() -> new IllegalArgumentException("With Me 정보가 없습니다."));

        if (info.getCurrentParticipants() >= info.getMaxParticipants()) {
            throw new IllegalArgumentException("모집 인원이 마감되었습니다.");
        }
        if (postParticipantRepository.existsByPostAndUser(post, user)) {
            throw new IllegalArgumentException("이미 참여 중입니다.");
        }
        if (post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("작성자는 참여하기를 누를 수 없습니다.");
        }

        postParticipantRepository.save(new PostParticipant(post, user));
        info.increaseParticipant();
    }

    // 참여 취소
    public void cancelWithMe(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow();
        UserEntity user = userRepository.findById(userId).orElseThrow();
        WithMeInfo info = withMeInfoRepository.findByPost(post).orElseThrow();

        // 마감 시간 30분 전인지 확인
        LocalDateTime limitTime = info.getRecruitmentDeadline().minusMinutes(30);
        if (LocalDateTime.now().isAfter(limitTime)) {
            throw new IllegalArgumentException("마감 30분 전부터는 취소할 수 없습니다.");
        }

        PostParticipant participant = postParticipantRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new IllegalArgumentException("참여 내역이 없습니다."));

        postParticipantRepository.delete(participant);
        info.decreaseParticipant();
    }

    // 내 With Me 목록 조회
    @Transactional(readOnly = true)
    public MyWithMeResponse getMyWithMeList(Long userId) {
        UserEntity user = userRepository.findById(userId).orElseThrow();
        LocalDateTime now = LocalDateTime.now();

        // 1. 내가 주최한 모임 (항상 표시 - 작성자 관리용)
        List<PostDto> hosted = postRepository.findAllByAuthorOrderByIdDesc(user).stream()
                .filter(p -> "WITHME".equals(p.getBoard().getCode()))
                .map(p -> convertToDto(p, userId))
                .toList();

        // 2. 내가 참여한 모임 (전체 조회 후 분류)
        List<PostParticipant> participations = postParticipantRepository.findAllByUser(user);

        var joinedPostsStream = participations.stream()
                .map(PostParticipant::getPost)
                .filter(p -> "WITHME".equals(p.getBoard().getCode()))
                .filter(p -> !p.getAuthor().getId().equals(userId));

        List<Post> allJoinedPosts = joinedPostsStream.toList();

        // 2-1. 확정된 모임 (마감 30분 전 지남)
        List<PostDto> confirmed = allJoinedPosts.stream()
                .filter(p -> {
                    WithMeInfo info = withMeInfoRepository.findByPost(p).orElse(null);
                    if (info == null) return false;
                    LocalDateTime confirmTime = info.getRecruitmentDeadline().minusMinutes(30);
                    return now.isAfter(confirmTime);
                })
                .map(p -> convertToDto(p, userId))
                .toList();

        // 2-2. 대기 중인 모임 (아직 확정 전)
        List<PostDto> pending = allJoinedPosts.stream()
                .filter(p -> {
                    WithMeInfo info = withMeInfoRepository.findByPost(p).orElse(null);
                    if (info == null) return false;
                    LocalDateTime confirmTime = info.getRecruitmentDeadline().minusMinutes(30);
                    return now.isBefore(confirmTime);
                })
                .map(p -> convertToDto(p, userId))
                .toList();

        return new MyWithMeResponse(hosted, confirmed, pending);
    }

    // DTO 변환 헬퍼 메서드 (중복 코드 제거용)
    private PostDto convertToDto(Post p, Long userId) {
        WithMeInfo info = withMeInfoRepository.findByPost(p).orElse(null);
        List<PostParticipant> ppt = postParticipantRepository.findAllByPost(p);
        // 목록 조회에서는 좋아요(hasLiked) 여부를 굳이 조회하지 않고 false로 처리하거나, 필요시 조회
        return PostDto.from(p, false, info, ppt, userId);
    }
}