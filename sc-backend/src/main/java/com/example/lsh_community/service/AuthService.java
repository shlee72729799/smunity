package com.example.lsh_community.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
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
        // 도메인 체크
        if (!email.endsWith("@sangmyung.kr") && !email.endsWith("@smu.ac.kr")) {
            throw new IllegalArgumentException("상명대학교 이메일(@sangmyung.kr, @smu.ac.kr)만 가능합니다.");
        }

        String token = UUID.randomUUID().toString();

        // [REDIS 저장 1] 링크 검증용 (Key: 토큰 -> Value: 이메일)
        redisTemplate.opsForValue().set("EMAIL_TOKEN:" + token, email, 5, TimeUnit.MINUTES);

        // [REDIS 저장 2] 폴링 상태 확인용 (Key: 이메일 -> Value: 상태)
        // 처음엔 "PENDING" 상태로 저장
        redisTemplate.opsForValue().set("EMAIL_STATUS:" + email, "PENDING", 5, TimeUnit.MINUTES);

        sendMail(email, token);
    }

    // 2. 이메일 링크 클릭 처리 (HTML 반환)
    public String verifyEmailLink(String token) {
        String email = redisTemplate.opsForValue().get("EMAIL_TOKEN:" + token);

        if (email == null) {
            return "<html><body style='text-align:center; padding-top:50px;'><h1>🚫 인증 시간이 만료되었거나 유효하지 않은 링크입니다.</h1></body></html>";
        }

        // 인증 성공 -> 최종 가입 토큰 생성
        String signupToken = UUID.randomUUID().toString();

        // 1. [폴링용] 프론트엔드가 상태 확인할 때 사용 (이메일 -> 토큰)
        redisTemplate.opsForValue().set("EMAIL_STATUS:" + email, signupToken, 10, TimeUnit.MINUTES);

        // 2. 회원가입 검증용 (토큰 -> 이메일)
        // UserServiceImpl에서 req.signupToken()으로 이메일을 찾기 위해 꼭 필요합니다!
        redisTemplate.opsForValue().set(signupToken, email, 10, TimeUnit.MINUTES);

        // 사용된 링크 토큰 삭제
        redisTemplate.delete("EMAIL_TOKEN:" + token);

        return """
                <html>
                <body style='text-align:center; padding-top:50px; font-family: sans-serif;'>
                    <h1 style='color: #004094;'>✅ 이메일 인증이 완료되었습니다!</h1>
                    <p>이 창을 닫고, <b>원래 열려있던 페이지</b>로 돌아가 회원가입을 계속 진행해주세요.</p>
                </body>
                </html>
                """;
    }

    // 3. 인증 상태 확인 (프론트엔드 폴링용)
    public String checkVerificationStatus(String email) {
        String status = redisTemplate.opsForValue().get("EMAIL_STATUS:" + email);

        // 아직 인증 안 됨 OR 만료됨
        if (status == null || "PENDING".equals(status)) {
            return null;
        }

        // 인증 완료됨 (signupToken 반환)
        return status;
    }

    private void sendMail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[SM-Connect] 상명대학교 학생 인증");
            // 백엔드 주소로 직접 연결 (8080 포트)
            message.setText("아래 링크를 클릭하면 인증이 완료됩니다:\n"
                    + "http://localhost:8080/api/auth/verify-link?token=" + token);

            mailSender.send(message);
            log.info("인증 메일 발송 성공: {}", to);
        } catch (Exception e) {
            log.error("메일 발송 실패", e);
            throw new RuntimeException("메일 발송 중 오류가 발생했습니다.");
        }
    }
}