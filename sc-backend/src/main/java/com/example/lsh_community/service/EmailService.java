// src/main/java/com/example/lsh_community/service/EmailService.java

package com.example.lsh_community.service;

import com.example.lsh_community.entity.EmailVerification;
import com.example.lsh_community.repository.EmailVerificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final EmailVerificationRepository verificationRepository;

    // 1. 인증 코드 발송
    @Transactional
    public void sendVerificationEmail(String email) {
        // 사용자가 입력한 이메일 도메인 검사
        // 대소문자 구분 없이 체크하기 위해 소문자로 변환 후 비교
        String lowerEmail = email.toLowerCase();
        if (!lowerEmail.endsWith("@smu.ac.kr") && !lowerEmail.endsWith("@sangmyung.kr")) {
            throw new IllegalArgumentException("상명대학교 이메일(@smu.ac.kr 또는 @sangmyung.kr)만 사용 가능합니다.");
        }

        String code = createRandomCode();

        // DB에 저장 (유효시간 5분)
        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .verificationCode(code)
                .expiryDate(LocalDateTime.now().plusMinutes(5))
                .build();
        verificationRepository.save(verification);

        sendMail(email, code);
    }

    // 2. 인증 코드 검증
    @Transactional
    public void verifyCode(String email, String code) {
        EmailVerification verification = verificationRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("인증 요청된 적 없는 이메일입니다."));

        if (verification.isExpired()) {
            throw new IllegalArgumentException("인증 코드가 만료되었습니다. 다시 받아주세요.");
        }

        if (!verification.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
        }

        verificationRepository.delete(verification);
    }

    private String createRandomCode() {
        Random random = new Random();
        StringBuilder key = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            key.append(random.nextInt(10));
        }
        return key.toString();
    }

    private void sendMail(String to, String code) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setTo(to);
            helper.setSubject("[스뮤니티] 회원가입 인증 코드입니다.");
            helper.setText("<div>상명대학교 커뮤니티 스뮤니티입니다.<br>인증 코드: <strong>" + code + "</strong></div>", true);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("메일 발송 실패", e);
        }
    }
}