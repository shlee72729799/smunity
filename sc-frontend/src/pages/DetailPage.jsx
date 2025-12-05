import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { fetchPostDetail, likePost, fetchComments, createComment, updateComment, deleteComment } from "../api/client";
import "../styles/DetailPage.css";

function DetailPage() {
    const { isLoggedIn, logout, user } = useAuth(); // user 객체 필요
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [hasLiked, setHasLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // 댓글 수정 핸들러
    const handleUpdateComment = async (commentId, oldContent) => {
        if (!user) return alert("로그인 상태를 확인해 주세요.");

        const newContent = prompt("수정할 내용을 입력하세요:", oldContent);
        if (newContent === null || newContent === oldContent || !newContent.trim()) return;

        try {
            await updateComment(commentId, newContent);
            // 목록 새로고침 (업데이트된 내용 반영)
            const updated = await fetchComments(id);
            setComments(updated);
            alert("댓글이 수정되었습니다.");
        } catch (e) {
            alert("수정 실패: 본인의 댓글만 수정할 수 있습니다.");
        }
    };

    // 댓글 삭제 핸들러
    const handleDeleteComment = async (commentId) => {
        if (!user) return alert("로그인 상태를 확인해 주세요.");
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        try {
            await deleteComment(commentId);
            // 목록 갱신
            const updated = await fetchComments(id);
            setComments(updated);
            alert("댓글이 삭제되었습니다.");
        } catch (e) {
            alert("삭제 실패: 본인의 댓글만 삭제할 수 있습니다.");
        }
    };


    // 초기 데이터 로딩 (게시글 + 댓글 병렬 조회)
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

    // 좋아요 핸들러
    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요합니다.");
        if (isLiking) return;

        try {
            setIsLiking(true);
            const newCount = await likePost(id);

            setPost((prev) => prev ? { ...prev, likeCount: newCount } : prev);
            setHasLiked(!hasLiked);
        } catch (e) {
            alert("좋아요 처리 실패");
        } finally {
            setIsLiking(false);
        }
    };

    // 댓글 작성 핸들러
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
                {/* 게시글 카드 */}
                <section className="detail-card">
                    <header className="detail-post-header">
                        <div className="detail-title-row">
                            <h1 className="detail-post-title">{post.title}</h1>
                            <button className="detail-back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
                        </div>
                        {/* 작성일 정보 추가 */}
                        <div className="detail-post-meta-row">
              <span style={{ marginRight: '16px', fontWeight: 'bold' }}>
                  작성일: {post.createdAt}
              </span>
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

                {/* 댓글 영역 */}
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

                                    {/* 헤더 시작 */}
                                    <div className="comment-header">

                                        {/* [왼쪽 그룹] 작성자 이름 + 날짜 */}
                                        <div className="comment-info-left">
                                            <span className="comment-writer">{c.writerName}</span>
                                            <span className="comment-date">{c.createdAt}</span>
                                        </div>

                                        {/* [오른쪽 그룹] 수정/삭제 버튼 (본인일 때만) */}
                                        {c.isOwner && (
                                            <div className="comment-actions-right">
                                                <button
                                                    className="comment-edit-btn"
                                                    onClick={() => handleUpdateComment(c.id, c.content)}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="comment-delete-btn"
                                                    onClick={() => handleDeleteComment(c.id)}
                                                >
                                                    삭제
                                                </button>
                                            </div>
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