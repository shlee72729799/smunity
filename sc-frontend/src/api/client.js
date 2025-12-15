// src/api/client.js
import axios from "axios";

// 백엔드 주소
const API_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000, // 무한 로딩 방지
  headers: { "Content-Type": "application/json" },
});

/**
 * 서버가 모르는 필드(null/undefined/"" 등)를 같이 보내면
 * 백엔드에서 DTO 바인딩/검증 때문에 터지는 경우가 많아서
 * 비어있는 값은 제거하고 전송합니다.
 */
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );

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

export async function createPost(boardCode, title, content, extraData = {}) {
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

export async function deletePost(postId) {
  await client.delete(`/api/posts/${postId}`);
}

export async function updatePost(postId, title, content, extraData = {}) {
  const payload = compact({
    title,
    content,
    ...extraData,
  });
  await client.patch(`/api/posts/${postId}`, payload);
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

export async function checkSession() {
  const res = await client.get(`/api/auth/check`);
  return res.data;
}

export async function logoutApi() {
  await client.post(`/api/auth/logout`);
}

// =====================
// 3. 마이페이지 API
// =====================

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

// =====================
// 4. 댓글(Comment) API
// =====================

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

// =====================
// 5. With Me (같이 해요) APIs
// =====================

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

// =====================
// 6. 기타 API
// =====================

export async function fetchWeather() {
  const res = await client.get(`/api/weather/current`);
  return res.data;
}

export async function fetchSmuNotices() {
  const res = await client.get(`/api/smu/notices`);
  return res.data;
}

// =====================
// 7. Axios Interceptor
// =====================

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 타임아웃
    if (error.code === "ECONNABORTED") {
      console.warn("요청 시간이 초과되었습니다(15초). 서버 상태를 확인하세요.");
    }

    // 인증
    if (error.response?.status === 401) {
      console.warn("세션이 만료되었습니다.");
    }

    return Promise.reject(error);
  }
);

export default client;
