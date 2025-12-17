package com.example.lsh_community.controller;

import com.example.lsh_community.dto.*;
import com.example.lsh_community.service.EmailService;
import com.example.lsh_community.service.UserService;
import com.example.lsh_community.dto.EmailRequestDto;
import com.example.lsh_community.dto.EmailCheckDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final EmailService emailService;

    // 1. 이메일 인증 코드 발송
    @PostMapping("/email-verification")
    public ResponseEntity<String> sendEmailCode(@RequestBody EmailRequestDto req) {
        emailService.sendVerificationEmail(req.email());
        return ResponseEntity.ok("인증 코드가 발송되었습니다.");
    }

    // 1-1. 인증 번호 확인 (회원가입 전 미리 확인)
    @PostMapping("/email-verification/confirm")
    public ResponseEntity<String> checkEmailCode(@RequestBody EmailCheckDto req) {
        emailService.verifyCodeOnly(req.email(), req.authCode()); // 삭제 안 하는 메서드 호출
        return ResponseEntity.ok("인증되었습니다.");
    }

    // 2. 회원가입
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        UserResponse user = userService.signup(req);
        AuthResponse response = new AuthResponse("회원가입이 완료되었습니다", user);
        return ResponseEntity
                .created(URI.create("/api/auth/users/" + user.id()))
                .body(response);
    }

    // 3. 로그인
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest request
    ) {
        UserResponse user = userService.login(req);

        // 세션 생성 및 정보 저장
        HttpSession session = request.getSession(true);
        session.setAttribute("USER", user);
        session.setMaxInactiveInterval(1800); // 30분 유지

        return ResponseEntity.ok(new AuthResponse("로그인 성공", user));
    }

    // 4. 세션 확인 (로그인 유지용)
    @GetMapping("/check")
    public ResponseEntity<UserResponse> checkSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok((UserResponse) session.getAttribute("USER"));
    }

    // 5. 내 정보 가져오기 (마이페이지)
    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getMyInfo(HttpServletRequest request) {
        return checkSession(request); // checkSession과 동일한 로직
    }

    // 6. 내가 쓴 글 목록
    @GetMapping("/users/me/posts")
    public ResponseEntity<List<MyPostDto>> getMyPosts(HttpServletRequest request) {
        Long userId = getUserIdFromSession(request);
        return ResponseEntity.ok(userService.getMyPosts(userId));
    }

    // 7. 내가 쓴 댓글 목록
    @GetMapping("/users/me/comments")
    public ResponseEntity<List<MyCommentDto>> getMyComments(HttpServletRequest request) {
        Long userId = getUserIdFromSession(request);
        return ResponseEntity.ok(userService.getMyComments(userId));
    }

    // 8. 비밀번호 변경
    @PatchMapping("/users/me/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody PasswordChangeRequest req,
            HttpServletRequest request
    ) {
        Long userId = getUserIdFromSession(request);
        // 서비스 호출 (현재 비번 검사 -> 새 비번 암호화 저장)
        userService.changePassword(userId, req.currentPassword(), req.newPassword());

        return ResponseEntity.ok().build();
    }

    // 회원 탈퇴
    @DeleteMapping("/users/me")
    public ResponseEntity<Void> deleteAccount(HttpServletRequest request, HttpServletResponse response) {
        Long userId = getUserIdFromSession(request);

        // 서비스 호출 (데이터 삭제)
        userService.deleteUser(userId);

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        // cookie.setSecure(true); // HTTPS 환경인 경우 필요
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    // --- Helper Method ---
    // 세션에서 유저 ID를 꺼내거나 없으면 401 에러를 던지는 메서드
    private Long getUserIdFromSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER") == null) {
            throw new IllegalArgumentException("로그인이 필요합니다."); // GlobalExceptionHandler에서 401/400 처리 필요
            // 또는 여기서 바로 throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        UserResponse user = (UserResponse) session.getAttribute("USER");
        return user.id();
    }
}