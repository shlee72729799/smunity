import axios from "axios";

// 백엔드 주소 (Vite 환경변수 사용 권장, 없으면 기본값)
const API_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080";

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true, // 세션/쿠키 사용 시 필요
});

// =====================
// 1. 게시판(Post) API
// =====================
export async function fetchBoardPosts(boardCode) {
    const res = await client.get(`/api/posts/board/${boardCode}`);
    return res.data;
}

export async function fetchTop10Posts() {
    const res = await client.get(`/api/posts/top10`);
    return res.data;
}

export async function createPost(boardCode, title, content) {
    const res = await client.post(`/api/posts`, {
        boardCode,
        title,
        content,
    });
    return res.data;
}

export async function fetchPostDetail(postId) {
    const res = await client.get(`/api/posts/${postId}`);
    return res.data;
}

export async function likePost(postId) {
    const res = await client.post(`/api/posts/${postId}/like`);
    return res.data;
}

// =====================
// 2. 회원(Auth/User) API
// =====================

export async function sendEmailVerification(email) {
    const res = await client.post(`/api/auth/email-verification?email=${email}`);
    return res.data;
}

export async function signup(payload) {
    const res = await client.post(`/api/auth/signup`, payload);
    return res.data;
}

export async function login(payload) {
    const res = await client.post(`/api/auth/login`, payload);
    return res.data;
}

// 세션 확인
export async function checkSession() {
    const res = await client.get(`/api/auth/check`);
    return res.data;
}

// 로그아웃
export async function logoutApi() {
    await client.post(`/api/auth/logout`);
}

// =====================
// 3. 마이페이지 API
// =====================
// 내 정보 가져오기
export async function fetchMyInfo() {
    const res = await client.get(`/api/auth/users/me`);
    return res.data;
}

// 내가 쓴 글
export async function fetchMyPosts() {
    const res = await client.get(`/api/auth/users/me/posts`);
    return res.data;
}

// 내가 쓴 댓글
export async function fetchMyComments() {
    const res = await client.get(`/api/auth/users/me/comments`);
    return res.data;
}

// =====================
// 4. 댓글(Comment) API
// =====================

export async function fetchComments(postId) {
    const res = await client.get(`/api/posts/${postId}/comments`);
    return res.data;
}

export async function createComment(postId, content) {
    const res = await client.post(`/api/posts/${postId}/comments`, { content });
    return res.data;
}

export async function deleteComment(commentId) {
    const res = await client.delete(`/api/comments/${commentId}`);
    return res.data;
}


// 비밀번호 변경
export async function updatePassword(currentPassword, newPassword) {
    await client.patch(`/api/auth/users/me/password`, { currentPassword, newPassword });
}

// 게시글 삭제
export async function deletePost(postId) {
    await client.delete(`/api/posts/${postId}`);
}

// 게시글 수정 (API 호출만)
export async function updatePost(postId, title, content) {
    await client.patch(`/api/posts/${postId}`, { title, content });
}

// 댓글 수정
export async function updateComment(commentId, content) {
    await client.patch(`/api/comments/${commentId}`, { content });
}