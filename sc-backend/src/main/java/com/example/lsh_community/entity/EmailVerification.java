package com.example.lsh_community.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerification {
    @Id
    private String email;           // 이메일을 PK로 사용 (중복 발송 시 덮어쓰기)
    private String verificationCode;
    private LocalDateTime expiryDate; // 만료 시간

    // 만료 여부 확인
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}