package com.example.lsh_community.service;

import com.example.lsh_community.dto.LoginRequest;
import com.example.lsh_community.dto.SignupRequest;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.entity.UserEntity;
import com.example.lsh_community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.lsh_community.repository.PostRepository;
import com.example.lsh_community.repository.CommentRepository;
import com.example.lsh_community.dto.MyPostDto;
import com.example.lsh_community.dto.MyCommentDto;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService; // ✅ [추가] 이메일 검증을 위해 주입
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public UserResponse signup(SignupRequest req) {
        // 이메일 인증 코드 검증
        emailService.verifyCode(req.email(), req.verificationCode());

        // 기존 중복 체크 (아이디)
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다: " + req.username());
        }

        // 기존 중복 체크 (이메일)
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다: " + req.email());
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(req.password());

        // 사용자 생성 및 저장
        UserEntity user = UserEntity.builder()
                .username(req.username())
                .password(encodedPassword)
                .email(req.email())
                .name(req.name() != null ? req.name() : req.username())
                .build();

        UserEntity saved = userRepository.save(user);

        // DTO 변환 후 반환
        return toResponse(saved);
    }

    @Override
    public UserResponse login(LoginRequest req) {
        UserEntity user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다");
        }

        return toResponse(user);
    }

    // Helper 메서드
    private UserResponse toResponse(UserEntity entity) {
        return new UserResponse(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getName()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyPostDto> getMyPosts(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        return postRepository.findAllByAuthorOrderByIdDesc(user).stream()
                .map(p -> new MyPostDto(
                        p.getId(),
                        p.getTitle(),
                        p.getBoard() != null ? p.getBoard().getName() : "게시판",
                        p.getBoard() != null ? p.getBoard().getCode() : "FREE", // ✅ [추가] 코드 매핑
                        p.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyCommentDto> getMyComments(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        return commentRepository.findAllByAuthorOrderByIdDesc(user).stream()
                .map(c -> new MyCommentDto(
                        c.getId(),
                        c.getPost().getId(),
                        c.getPost().getTitle(),
                        c.getContent(),
                        c.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                ))
                .toList();

    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호 암호화 후 저장
        user.setPassword(passwordEncoder.encode(newPassword)); // UserEntity에 setPassword 필요 (Setter 혹은 메서드 추가)
        // UserEntity에 @Setter가 없다면: public void changePassword(String pw) { this.password = pw; } 메서드 추가 필요
    }
}