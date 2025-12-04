// src/pages/MyInfoPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { fetchMyPosts, fetchMyComments } from "../api/client";
import "../styles/MyInfoPage.css";

function MyInfoPage() {
  const { isLoggedIn, logout } = useAuth();

  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [postsRes, commentsRes] = await Promise.all([
          fetchMyPosts(),
          fetchMyComments(),
        ]);

        setMyPosts(postsRes || []);
        setMyComments(commentsRes || []);
      } catch (err) {
        console.error(err);
        setError("내 정보(작성글/댓글)를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoggedIn]);

  return (
    <div className="main-page myinfo-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <main className="myinfo-container">
        <h1 className="myinfo-title">내 정보</h1>

        {/* 에러 메시지 */}
        {error && <div className="myinfo-error">{error}</div>}

        {/* 계정 정보 카드 */}
        <section className="myinfo-card myinfo-account-card">
          <div className="myinfo-row">
            <span className="myinfo-label">계정</span>
            <span className="myinfo-value">
              이름 정보 없음 | 학과 정보 없음 | 학번 정보 없음
            </span>
          </div>
          <div className="myinfo-row">
            <span className="myinfo-label">아이디</span>
            <span className="myinfo-value">아이디 정보 없음</span>
          </div>
          <div className="myinfo-row myinfo-row-password">
            <span className="myinfo-label">비밀번호 변경</span>
            <div className="myinfo-password-area">
              <span className="myinfo-value">************</span>
              <button type="button" className="myinfo-btn-outline">
                변경
              </button>
            </div>
          </div>
          {/* ➕ 신규: 이메일 행 */}
          <div className="myinfo-row">
            <span className="myinfo-label">E-mail</span>
            <span className="myinfo-value">이메일 정보 없음</span>
          </div>
        </section>

        {/* 로딩 중이면 밑 카드들 대신 간단 표시 */}
        {loading ? (
          <p style={{ color: "#e5e7eb", fontSize: 14 }}>불러오는 중...</p>
        ) : (
          <>
            {/* 작성글 관리 카드 */}
            <section className="myinfo-card">
              <div className="myinfo-card-header">
                <h2 className="myinfo-card-title">작성글 관리</h2>
                <span className="myinfo-card-count">
                  {myPosts.length}개
                </span>
              </div>

              <ul className="myinfo-list">
                {myPosts.length === 0 && (
                  <li className="myinfo-empty">작성한 글이 없습니다.</li>
                )}

                {myPosts.map((post) => (
                  <li key={post.id} className="myinfo-list-item">
                    {/* 제목만 표시 + 클릭 시 해당 게시글로 이동 */}
                    <Link
                      to={`/detail/${post.id}`}
                      className="myinfo-item-main"
                    >
                      <span className="myinfo-item-title">
                        {post.title || "(제목 없음)"}
                      </span>
                    </Link>
                    <button type="button" className="myinfo-delete-btn">
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* 댓글 관리 카드 */}
            <section className="myinfo-card">
              <div className="myinfo-card-header">
                <h2 className="myinfo-card-title">댓글 관리</h2>
                <span className="myinfo-card-count">
                  {myComments.length}개
                </span>
              </div>

              <ul className="myinfo-list">
                {myComments.length === 0 && (
                  <li className="myinfo-empty">작성한 댓글이 없습니다.</li>
                )}

                {myComments.map((comment) => {
                  // 백엔드에서 어떤 형태로 줄지 몰라서 여러 경우 방어
                  const postId =
                    comment.postId ||
                    comment.post?.id ||
                    comment.id;
                  const postTitle =
                    comment.postTitle ||
                    comment.post?.title ||
                    comment.title ||
                    "(제목 없음)";

                  return (
                    <li key={comment.id ?? `${postId}-${postTitle}`} className="myinfo-list-item">
                      {/* 댓글이 달린 게시글 제목만 표시 + 클릭 시 게시글로 이동 */}
                      <Link
                        to={`/detail/${postId}`}
                        className="myinfo-item-main"
                      >
                        <span className="myinfo-item-title">{postTitle}</span>
                      </Link>
                      <button type="button" className="myinfo-delete-btn">
                        삭제
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default MyInfoPage;
