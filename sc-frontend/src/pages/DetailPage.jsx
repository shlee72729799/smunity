// src/pages/DetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { fetchPostDetail, likePost } from "../api/client";
import "../styles/DetailPage.css";

function DetailPage() {
  const { isLoggedIn, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // 댓글은 일단 프론트에서만 관리 (백엔드 붙일 때 여기만 수정하면 됨)
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchPostDetail(id);
        setPost(data);
      } catch (e) {
        console.error(e);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleLike = async () => {
    if (hasLiked || isLiking) return;

    try {
      setIsLiking(true);

      // 백엔드에 좋아요 요청 (엔드포인트 다르면 client.js 쪽만 수정)
      try {
        const updated = await likePost(id);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likeCount:
                  updated && typeof updated.likeCount === "number"
                    ? updated.likeCount
                    : (prev.likeCount ?? 0) + 1,
              }
            : prev
        );
      } catch (e) {
        console.error(e);
        // 서버 오류 시에도 프론트에서만 1 증가 (원하면 제거해도 됨)
        setPost((prev) =>
          prev ? { ...prev, likeCount: (prev.likeCount ?? 0) + 1 } : prev
        );
      }

      setHasLiked(true); // 한 번 누르면 이 페이지에서 다시 못 누르게
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      content: commentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <main className="detail-container">
          <div className="detail-card">게시글을 불러오는 중입니다...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="detail-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <main className="detail-container">
          <div className="detail-card">
            {error || "게시글을 찾을 수 없습니다."}
          </div>
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <main className="detail-container">
  {/* 게시글 카드 */}
  <section className="detail-card">
    <header className="detail-post-header">
      {/* 제목 + 뒤로가기 버튼을 한 줄에 */}
      <div className="detail-title-row">
        <h1 className="detail-post-title">{post.title}</h1>
        <button className="detail-back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      <div className="detail-post-meta-row">
        <span>조회수: {post.viewCount ?? 0}</span>
        <span>좋아요: {post.likeCount ?? 0}</span>
        <span>댓글: {post.commentCount ?? comments.length}</span>
      </div>
    </header>

    <hr className="post-divider" />

    <article className="post-content">{post.content}</article>

    <div className="post-actions-row">
      <button
        className={`like-button ${hasLiked ? "liked" : ""}`}
        onClick={handleLike}
        disabled={hasLiked || isLiking}
      >
        <span className="heart">{hasLiked ? "♥" : "♡"}</span>
        <span className="like-text">
          {hasLiked ? "이미 추천하셨습니다" : "좋아요"}
        </span>
      </button>
    </div>
  </section>

        {/* 댓글 영역 */}
        {/* 이하 동일 */}


        {/* 댓글 영역 */}
        <section className="comment-section">
          <h2 className="section-title">댓글 작성</h2>

          <div className="comment-form">
            <textarea
              className="comment-input"
              rows={3}
              placeholder="댓글을 입력하세요."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              className="comment-submit-btn"
              onClick={handleAddComment}
            >
              등록
            </button>
          </div>

          <div className="comment-list">
            <h3 className="section-subtitle">작성된 댓글</h3>

            {comments.length === 0 ? (
              <p className="comment-empty">아직 작성된 댓글이 없습니다.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <p className="comment-content">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <button className="detail-back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </main>

      <Footer />
    </div>
  );
}

export default DetailPage;
