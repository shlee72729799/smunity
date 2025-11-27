package com.example.lsh_community.service;

import com.example.lsh_community.dto.LoginRequest;
import com.example.lsh_community.dto.SignupRequest;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.entity.UserEntity;
import com.example.lsh_community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate; // Redis 확인용

    @Override
    public UserResponse signup(SignupRequest req) {
        // 1. [핵심] 토큰 검증 및 이메일 추출
        // 프론트엔드에서 보낸 토큰으로 Redis에 저장된 진짜 이메일을 조회합니다.
        String verifiedEmail = redisTemplate.opsForValue().get(req.signupToken());

        if (verifiedEmail == null) {
            throw new IllegalArgumentException("인증 토큰이 만료되었거나 유효하지 않습니다. 다시 인증해주세요.");
        }

        // 2. 중복 체크 (username)
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다: " + req.username());
        }

        // 3. 중복 체크 (Redis에서 꺼낸 진짜 이메일로 확인)
        if (userRepository.existsByEmail(verifiedEmail)) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다: " + verifiedEmail);
        }

        // 4. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(req.password());

        // 5. 사용자 생성 (이메일은 req.email()이 아니라 verifiedEmail을 사용!)
        UserEntity user = UserEntity.builder()
                .username(req.username())
                .password(encodedPassword)
                .email(verifiedEmail) // ★ 인증된 이메일 사용
                .name(req.name() != null ? req.name() : req.username())
                .build();

        UserEntity saved = userRepository.save(user);

        // 6. [중요] 사용한 토큰은 Redis에서 삭제 (재사용 방지)
        redisTemplate.delete(req.signupToken());

        return toResponse(saved);
    }

    @Override
    public UserResponse login(LoginRequest req) {
        // 로그인 로직
        UserEntity user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다");
        }

        return toResponse(user);
    }
}