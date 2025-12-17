// src/api/client.js
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080";

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000, //  무한 로딩 방지
    headers: { "Content-Type": "application/json" },
});

export async function fetchBoardPosts(boardCode) {
    const res = await client.get(`/api/posts/board/${boardCode}`);
    return res.data;
}

export async function fetchTop10Posts() {
    const res = await client.get(`/api/posts/top10`);
    return res.data;
}

// 키워드 검색 엔드포인트 호출 함수
export async function searchPosts(keyword) {
    if (!keyword) return [];
    const res = await client.get(`/api/posts/search`, {
        params: {
            keyword: keyword,
        },
    });
    return res.data;
}

export async function createPost(boardCode, title, content, extraData = {}) {
    const compact = (obj) =>
        Object.fromEntries(
            Object.entries(obj).filter(
                ([, v]) => v !== undefined && v !== null && v !== ""
            )
        );

    const payload = compact({
        boardCode,
        title,
        content,
        ...extraData,
    });

    const res = await client.post(`/api/posts`, payload);
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

export async function deletePost(postId) {
    await client.delete(`/api/posts/${postId}`);
}

export async function updatePost(postId, title, content, extraData = {}) {
    await client.patch(`/api/posts/${postId}`, {
        title,
        content,
        ...extraData,
    });
}

export async function sendEmailVerification(email) {
    const res = await client.post(`/api/auth/email-verification`, { email });
    return res.data;
}

export async function checkEmailVerification(email, authCode) {
    const res = await client.post(`/api/auth/email-verification/confirm`, {
        email,
        authCode,
    });
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

export async function checkSession() {
    const res = await client.get(`/api/auth/check`);
    return res.data;
}

export async function logoutApi() {
    await client.post(`/api/auth/logout`);
}

export async function fetchMyInfo() {
    const res = await client.get(`/api/auth/users/me`);
    return res.data;
}

export async function fetchMyPosts() {
    const res = await client.get(`/api/auth/users/me/posts`);
    return res.data;
}

export async function fetchMyComments() {
    const res = await client.get(`/api/auth/users/me/comments`);
    return res.data;
}

export async function updatePassword(currentPassword, newPassword) {
    await client.patch(`/api/auth/users/me/password`, {
        currentPassword,
        newPassword,
    });
}

export async function deleteAccount() {
    await client.delete(`/api/auth/users/me`);
}

export async function fetchComments(postId) {
    const res = await client.get(`/api/posts/${postId}/comments`);
    return res.data;
}

export async function createComment(postId, content, isAnonymous = false) {
    const res = await client.post(`/api/posts/${postId}/comments`, {
        content,
        isAnonymous,
    });
    return res.data;
}

export async function deleteComment(commentId) {
    const res = await client.delete(`/api/comments/${commentId}`);
    return res.data;
}

export async function updateComment(commentId, content) {
    await client.patch(`/api/comments/${commentId}`, { content });
}

export async function joinWithMe(postId) {
    await client.post(`/api/withme/${postId}/join`);
}

export async function cancelWithMe(postId) {
    await client.post(`/api/withme/${postId}/cancel`);
}

export async function fetchMyWithMeList() {
    const res = await client.get(`/api/withme/my-list`);
    return res.data;
}

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ECONNABORTED") {
            console.warn("요청 시간이 초과되었습니다(15초). 서버/CORS 상태를 확인하세요.");
        }
        if (error.response && error.response.status === 401) {
            console.warn("세션이 만료되었습니다.");
        }
        return Promise.reject(error);
    }
);

export async function fetchWeather() {
    const res = await client.get(`/api/weather/current`);
    return res.data;
}

export async function fetchSmuNotices() {
    const res = await client.get("/api/smu/notices");
    return res.data;
}
