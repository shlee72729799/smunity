package com.example.lsh_community.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;

    // 1. 인증 메일 발송
    public void sendVerificationEmail(String email) {
        // 도메인 체크 (상명대 메일인지)
        if (!email.endsWith("@sangmyung.kr") && !email.endsWith("@smu.ac.kr")) {
            throw new IllegalArgumentException("상명대학교 이메일(@sangmyung.kr, @smu.ac.kr)만 가능합니다.");
        }

        // 임시 토큰 생성
        String token = UUID.randomUUID().toString();

        // Redis에 저장 (Key: token, Value: email, 유효시간: 5분)
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        ops.set(token, email, 5, TimeUnit.MINUTES);

        // 이메일 발송
        sendMail(email, token);
    }

    // 2. 이메일 인증 확인 (토큰 검증)
    public String verifyEmail(String token) {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        String email = ops.get(token);

        if (email == null) {
            throw new IllegalArgumentException("인증 토큰이 만료되었거나 유효하지 않습니다.");
        }

        // 인증 성공 시 임시 토큰 삭제
        redisTemplate.delete(token);

        // 최종 가입용 토큰을 다시 Redis에 저장해서 반환
        String signupToken = UUID.randomUUID().toString();
        ops.set(signupToken, email, 10, TimeUnit.MINUTES); // 10분간 유효한 가입 토큰

        return signupToken;
    }

    private void sendMail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[SM-Connect] 상명대학교 학생 인증");
            // 프론트엔드의 인증 처리 페이지 URL로 링크
            message.setText("아래 링크를 클릭하여 인증을 완료해주세요:\n"
                    + "http://localhost:8080/api/auth/verify-email?token=" + token);

            mailSender.send(message);
            log.info("인증 메일 발송 성공: {}", to);
        } catch (Exception e) {
            log.error("메일 발송 실패: {}", e.getMessage());
            throw new RuntimeException("메일 발송 중 오류가 발생했습니다.");
        }
    }
}
