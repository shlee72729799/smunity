package com.example.lsh_community.service;

import com.example.lsh_community.domain.*;
import com.example.lsh_community.dto.CreatePostRequest;
import com.example.lsh_community.dto.PostDto;
import com.example.lsh_community.entity.UserEntity;
import com.example.lsh_community.repository.*;
import lombok.RequiredArgsConstructor; // 생성자 주입 간소화
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // final 필드 자동 주입
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    private final WithMeInfoRepository withMeInfoRepository;
    private final PostParticipantRepository postParticipantRepository;

    // 검색 요청 처리
    @Transactional(readOnly = true)
    public List<PostDto> searchPosts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // 키워드가 없으면 빈 목록 반환
            return List.of();
        }

        // 키워드로 제목 또는 내용 검색 (WITHME 제외)
        List<Post> posts = postRepository.findByTitleOrContentContainingAndBoardCodeNot(keyword);

        return posts.stream()
                .map(PostDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public Long createPost(CreatePostRequest request, Long userId) {
        Board board = boardRepository.findByCode(request.getBoardCode())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시판을 찾을 수 없습니다."));
        UserEntity author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 1. 기본 Post 저장
        // 생성자에 isAnonymous 전달
        Post post = new Post(board, author, request.getTitle(), request.getContent(), request.getIsAnonymous());
        Post savedPost = postRepository.save(post);

        // 2. "WITHME" 게시판일 경우 추가 정보 저장
        if ("WITHME".equals(request.getBoardCode())) {
            if (request.getRecruitmentDeadline() == null || request.getMeetingTime() == null) {
                throw new IllegalArgumentException("모집 마감일과 약속 시간은 필수입니다.");
            }
            // 시간 유효성 검사 (마감이 약속보다 늦으면 안됨)
            if (request.getRecruitmentDeadline().isAfter(request.getMeetingTime())) {
                throw new IllegalArgumentException("모집 기간은 약속 시간보다 빠를 수 없습니다.");
            }

            WithMeInfo info = new WithMeInfo(
                    savedPost,
                    request.getRecruitmentDeadline(),
                    request.getMeetingTime(),
                    request.getMeetingLocation(),
                    request.getMaxParticipants() != null ? request.getMaxParticipants() : 2
            );
            withMeInfoRepository.save(info);
        }

        return savedPost.getId();
    }

    // 상세 조회 (With Me 정보 포함)
    @Transactional
    public PostDto getPostAndIncreaseView(Long postId, Long userId) {
        Post p = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // With Me 권한 체크 로직
        WithMeInfo withMeInfo = null;
        List<PostParticipant> participants = null;

        // WITHME 게시판일 때만 실행됩니다.
        if ("WITHME".equals(p.getBoard().getCode())) {
            withMeInfo = withMeInfoRepository.findByPost(p).orElse(null);

            if (withMeInfo != null) {
                LocalDateTime limitTime = withMeInfo.getRecruitmentDeadline().minusMinutes(30);
                boolean isConfirmed = LocalDateTime.now().isAfter(limitTime);

                // 확정된 경우에만 권한 체크 수행
                if (isConfirmed) {
                    boolean isHost = p.getAuthor().getId().equals(userId);
                    // 로그인 안 한 유저는 userId가 null일 수 있으므로 처리 필요
                    boolean isParticipant = false;
                    if (userId != null) {
                        isParticipant = postParticipantRepository.existsByPostAndUser(p,
                                userRepository.findById(userId).orElse(null));
                    }

                    // 작성자도 아니고 참여자도 아니면 에러 발생 (조회 차단)
                    if (!isHost && !isParticipant) {
                        throw new IllegalArgumentException("마감된 모임입니다. (참여자만 볼 수 있습니다)");
                    }
                }

                participants = postParticipantRepository.findAllByPost(p);
            }
        }

        p.increaseView();

        // 좋아요 여부 확인
        boolean hasLiked = false;
        if (userId != null) {
            UserEntity user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                hasLiked = postLikeRepository.findByUserAndPost(user, p).isPresent();
            }
        }

        return PostDto.from(p, hasLiked, withMeInfo, participants, userId);
    }

    // 목록 조회
    @Transactional(readOnly = true)
    public List<PostDto> getPostsByBoard(String boardCode) {
        LocalDateTime now = LocalDateTime.now();

        return postRepository.findByBoard_CodeOrderByIdDesc(boardCode).stream()
                .filter(post -> {
                    if ("WITHME".equals(boardCode)) {
                        WithMeInfo info = withMeInfoRepository.findByPost(post).orElse(null);
                        if (info == null) return false;

                        // 마감 30분 전(확정 시점)이 지나면 목록에서 숨김
                        LocalDateTime confirmTime = info.getRecruitmentDeadline().minusMinutes(30);
                        return now.isBefore(confirmTime);
                    }
                    return true;
                })
                .map(post -> {
                    if ("WITHME".equals(boardCode)) {
                        WithMeInfo info = withMeInfoRepository.findByPost(post).orElse(null);
                        return PostDto.from(post, false, info, null, null);
                    }
                    return PostDto.from(post);
                })
                .collect(Collectors.toList());
    }

    // TOP10 조회
    @Transactional(readOnly = true)
    public List<PostDto> getTop10Posts() {
        // WITHME가 아닌 게시글 중에서 Top 10을 가져옴
        return postRepository.findTop10ByBoard_CodeNotOrderByLikeCountDescViewCountDesc("WITHME")
                .stream()
                .map(PostDto::from)
                .collect(Collectors.toList());
    }

    // 좋아요, 수정 로직 등
    @Transactional
    public long toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("유저 없음"));
        Optional<PostLike> existingLike = postLikeRepository.findByUserAndPost(user, post);
        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.updateLikeCount(post.getLikeCount() - 1);
        } else {
            postLikeRepository.save(new PostLike(user, post));
            post.updateLikeCount(post.getLikeCount() + 1);
        }
        return post.getLikeCount();
    }

    // With Me 게시글은 수정 불가 예외 처리
    @Transactional
    public void updatePost(Long postId, Long userId, String title, String content) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("작성자만 수정 가능");
        }

        if ("WITHME".equals(post.getBoard().getCode())) {
            throw new IllegalArgumentException("With Me 게시글은 수정할 수 없습니다. (삭제 후 다시 작성해주세요)");
        }

        post.update(title, content);
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        if (!post.getAuthor().getId().equals(userId)) throw new IllegalArgumentException("작성자만 삭제 가능");

        // With Me 게시글 삭제 제한
        if ("WITHME".equals(post.getBoard().getCode())) {
            WithMeInfo info = withMeInfoRepository.findByPost(post).orElse(null);
            if (info != null) {
                // 확정 시간(마감 30분 전)이 지났는지 체크
                LocalDateTime confirmTime = info.getRecruitmentDeadline().minusMinutes(30);
                if (LocalDateTime.now().isAfter(confirmTime)) {
                    throw new IllegalArgumentException("모집이 확정되어 삭제할 수 없습니다. (약속 시간 이후 자동 삭제됩니다)");
                }
            }

            // 연관 데이터 삭제
            postParticipantRepository.deleteAllByPost(post);
            withMeInfoRepository.deleteByPost(post);
        }

        // 공통 연관 데이터 삭제
        commentRepository.deleteAllByPost(post);
        postLikeRepository.deleteAllByPost(post);
        postRepository.delete(post);
    }
}