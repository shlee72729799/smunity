import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { fetchPostDetail, likePost, fetchComments, createComment, deleteComment } from "../api/client";
import "../styles/DetailPage.css";

function DetailPage() {
    const { isLoggedIn, logout } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 좋아요 상태
    const [hasLiked, setHasLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // 초기 데이터 로딩
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [postData, commentsData] = await Promise.all([
                    fetchPostDetail(id),
                    fetchComments(id)
                ]);

                setPost(postData);
                setComments(commentsData || []);

                // 백엔드가 보내준 hasLiked 값으로 버튼 상태 설정
                if (postData && typeof postData.hasLiked === 'boolean') {
                    setHasLiked(postData.hasLiked);
                }

            } catch (e) {
                console.error(e);
                setError("게시글을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    // 좋아요 핸들러 (토글)
    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요합니다.");
        if (isLiking) return;

        try {
            setIsLiking(true);
            const newCount = await likePost(id);

            setPost((prev) => prev ? { ...prev, likeCount: newCount } : prev);
            setHasLiked(!hasLiked); // 버튼 상태 반전
        } catch (e) {
            alert("좋아요 처리 실패");
        } finally {
            setIsLiking(false);
        }
    };

    const handleAddComment = async () => {
        if (!isLoggedIn) return alert("로그인이 필요합니다.");
        if (!commentText.trim()) return alert("내용을 입력해주세요.");

        try {
            await createComment(id, commentText);
            setCommentText("");
            const updated = await fetchComments(id);
            setComments(updated);
        } catch (e) {
            console.error(e);
            alert("댓글 작성 실패");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await deleteComment(commentId);
            const updated = await fetchComments(id);
            setComments(updated);
        } catch (e) {
            alert("본인의 댓글만 삭제할 수 있습니다.");
        }
    };

    if (loading) {
        return (
            <div className="detail-page">
                <Header isLoggedIn={isLoggedIn} logout={logout} />
                <div className="banner-spacing" />
                <main className="detail-container">
                    <div className="detail-card">로딩 중...</div>
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
                    <div className="detail-card">{error || "게시글을 찾을 수 없습니다."}</div>
                    <button className="detail-back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
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
                <section className="detail-card">
                    <header className="detail-post-header">
                        <div className="detail-title-row">
                            <h1 className="detail-post-title">{post.title}</h1>
                            <button className="detail-back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
                        </div>
                        <div className="detail-post-meta-row">
                            <span>조회수: {post.viewCount ?? 0}</span>
                            <span>좋아요: {post.likeCount ?? 0}</span>
                            <span>댓글: {comments.length}</span>
                        </div>
                    </header>

                    <hr className="post-divider" />
                    <article className="post-content">{post.content}</article>

                    <div className="post-actions-row">
                        <button
                            className={`like-button ${hasLiked ? "liked" : ""}`}
                            onClick={handleLike}
                            disabled={isLiking}
                        >
                            <span className="heart">{hasLiked ? "♥" : "♡"}</span>
                            <span className="like-text">
                {hasLiked ? "추천 취소" : "좋아요"}
              </span>
                        </button>
                    </div>
                </section>

                <section className="comment-section">
                    <h2 className="section-title">댓글 작성</h2>
                    <div className="comment-form">
            <textarea
                className="comment-input"
                rows={3}
                placeholder={isLoggedIn ? "댓글을 입력하세요." : "로그인이 필요합니다."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!isLoggedIn}
            />
                        <button className="comment-submit-btn" onClick={handleAddComment}>등록</button>
                    </div>

                    <div className="comment-list">
                        <h3 className="section-subtitle">작성된 댓글 ({comments.length})</h3>
                        {comments.length === 0 ? (
                            <p className="comment-empty">아직 작성된 댓글이 없습니다.</p>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} className="comment-item">
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#666" }}>
                    <span>
                      <strong>{c.writerName}</strong> · <span style={{ fontSize: "12px", color: "#999" }}>{c.createdAt}</span>
                    </span>
                                        {c.isOwner && (
                                            <button
                                                onClick={() => handleDeleteComment(c.id)}
                                                style={{ border: "none", background: "transparent", color: "#ff4b4b", cursor: "pointer", fontSize: "12px" }}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <p className="comment-content">{c.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <button className="detail-back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
            </main>
            <Footer />
        </div>
    );
}

export default DetailPage;