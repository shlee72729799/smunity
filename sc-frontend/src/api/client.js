<<<<<<< Updated upstream
// sc-frontend/src/api/client.js

import axios from "axios";

// =====================
// 1. 게시판(Post) 관련 API
// =====================

const API_URL = "http://localhost:8080";

// 게시판 코드별 글 목록 가져오기 (FREE, ANON1, ANON2, JOB, RECRUIT ...)
export async function fetchBoardPosts(boardCode) {
  const res = await axios.get(`${API_URL}/api/posts/board/${boardCode}`);
  return res.data;
}

// 인기글 TOP10 가져오기
export async function fetchTop10Posts() {
  const res = await axios.get(`${API_URL}/api/posts/top10`);
  return res.data;
}

// 글 작성
export async function createPost(boardCode, title, content) {
  const res = await axios.post(`${API_URL}/api/posts`, {
    boardCode,
    title,
    content,
  });
  return res.data; // 새 글 id
}

// 게시글 상세 조회
export async function fetchPostDetail(postId) {
  const res = await axios.get(`${API_URL}/api/posts/${postId}`);
  return res.data;
}

// =====================
// 2. 기존 Community / Auth API (그대로 유지)
// =====================

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080";

async function safeJson(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function idFromLocation(res) {
  const loc = res.headers.get("Location");
  if (!loc) return null;
  const m = loc.match(/\/(\d+)(?:$|[?#])/);
  return m ? Number(m[1]) : null;
}

export async function createCommunityPost(payload) {
  try {
    const res = await fetch(`${BASE_URL}/Community`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {}
      const errorMsg =
        errorData?.message ||
        errorData?.error ||
        errorData?.detail ||
        responseText ||
        `Failed to create post: ${res.status}`;
      throw new Error(errorMsg);
    }

    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {}

    const id = data?.id ?? data?.postId ?? data?.data?.id ?? idFromLocation(res);
    return { ...data, id };
  } catch (err) {
    if (
      err.message === "Failed to fetch" ||
      err.message.includes("Load failed") ||
      err.message.includes("NetworkError")
    ) {
      throw new Error("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
    }
    throw err;
  }
}

export async function fetchCommunityList() {
  const res = await fetch(`${BASE_URL}/Community`);
  if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
  return await safeJson(res);
}

export async function fetchCommunityPost(id) {
  const res = await fetch(`${BASE_URL}/Community/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  return await safeJson(res);
}

export async function updateCommunityPost(id, payload) {
  const res = await fetch(`${BASE_URL}/Community/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update post: ${res.status}`);
  return await safeJson(res);
}

export async function deleteCommunityPost(id) {
  const res = await fetch(`${BASE_URL}/Community/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete post: ${res.status}`);
  return true;
}

// =====================
// 3. 회원가입 / 로그인
// =====================

export async function signup(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {}
      const errorMsg =
        errorData?.message ||
        errorData?.error ||
        errorData?.detail ||
        responseText ||
        `회원가입 실패: ${res.status}`;
      throw new Error(errorMsg);
    }

    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {}

    return data;
  } catch (err) {
    if (
      err.message === "Failed to fetch" ||
      err.message.includes("Load failed") ||
      err.message.includes("NetworkError")
    ) {
      throw new Error("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
    }
    throw err;
  }
}

export async function login(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      let errorData = null;
      try {
        errorData = responseText ? JSON.parse(responseText) : null;
      } catch {}
      const errorMsg =
        errorData?.message ||
        errorData?.error ||
        errorData?.detail ||
        responseText ||
        `로그인 실패: ${res.status}`;
      throw new Error(errorMsg);
    }

    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {}

    return data;
  } catch (err) {
    if (
      err.message === "Failed to fetch" ||
      err.message.includes("Load failed") ||
      err.message.includes("NetworkError")
    ) {
      throw new Error("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
    }
    throw err;
  }
=======
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
>>>>>>> Stashed changes
}

// =====================
// 4. 내 정보(MyInfo) / 마이페이지
// =====================

// 내 기본 정보 가져오기
// (백엔드에서 /api/users/me 구현되어 있어야 함)
export async function fetchMyInfo() {
  const res = await axios.get(`${API_URL}/api/users/me`, {
    withCredentials: true,
  });
  return res.data;
}

// 비밀번호 변경
export async function updateMyPassword(
  currentPassword,
  newPassword,
  confirmPassword
) {
  const res = await axios.put(
    `${API_URL}/api/users/me/password`,
    { currentPassword, newPassword, confirmPassword },
    { withCredentials: true }
  );
  return res.data;
}

// 내가 작성한 글 목록
export async function fetchMyPosts() {
  const res = await axios.get(`${API_URL}/api/users/me/posts`, {
    withCredentials: true,
  });
  return res.data;
}

// 내가 작성한 댓글 목록
export async function fetchMyComments() {
  const res = await axios.get(`${API_URL}/api/users/me/comments`, {
    withCredentials: true,
  });
  return res.data;
}

// 내 글 삭제
export async function deleteMyPost(postId) {
  const res = await axios.delete(`${API_URL}/api/posts/${postId}`, {
    withCredentials: true,
  });
  return res.data;
}

// 내 댓글 삭제
export async function deleteMyComment(commentId) {
  const res = await axios.delete(`${API_URL}/api/comments/${commentId}`, {
    withCredentials: true,
  });
  return res.data;
}

// 글 좋아요 (아이디당 한 번만 누를 수 있게 하는 것은 백엔드에서 검사해야 함)
export async function likePost(postId) {
  // 백엔드에서 엔드포인트를 /api/posts/{id}/like 같은 식으로 만들어줬다고 가정
  const res = await axios.post(
    `${API_URL}/api/posts/${postId}/like`,
    null,
    { withCredentials: true } // 세션/쿠키 쓰는 경우
  );
  return res.data;
}