import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import {
    fetchPostDetail, likePost, fetchComments, createComment, updateComment, deleteComment,
    joinWithMe, cancelWithMe
} from "../api/client";
import "../styles/DetailPage.css";

function DetailPage() {
    const { isLoggedIn, logout, user } = useAuth(); // user 객체 필요
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [isCommentAnon, setIsCommentAnon] = useState(false);
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
            // 익명 게시판인지 확인
            const isAnonBoard = post.boardCode === "ANON1" || post.boardCode === "ANON2";
            // 익명 게시판이면 강제 true, 아니면 체크박스 값 사용
            const finalAnon = isAnonBoard ? true : isCommentAnon;

            await createComment(id, commentText, finalAnon);

            setCommentText("");
            setIsCommentAnon(false);
            const updated = await fetchComments(id);
            setComments(updated);
        } catch (e) {
            console.error(e);
            alert("댓글 작성 실패");
        }
    };

    // With Me 핸들러
    const handleJoin = async () => {
        if (!window.confirm("이 모임에 참여하시겠습니까?")) return;
        try {
            await joinWithMe(id);
            alert("참여되었습니다!");
            window.location.reload();
        } catch (e) {
            alert(e.response?.data?.error || "참여 실패");
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("참여를 취소하시겠습니까?")) return;
        try {
            await cancelWithMe(id);
            alert("취소되었습니다.");
            window.location.reload();
        } catch (e) {
            alert(e.response?.data?.error || "취소 실패");
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
                        {/* 작성자, 작성일, 수정일 정보 */}
                        <div className="detail-post-meta-row">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {/* 작성자 이름 */}
                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                                    {post.writerName}
                                </span>
                                {/* 날짜 및 수정됨 표시 (연하게) */}
                                <span style={{ fontSize: '12px', color: '#888' }}>
                                    {post.createdAt}
                                    {post.updatedAt && (
                                        <span style={{ marginLeft: '6px' }}>
                                            (수정됨: {post.updatedAt})
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* 우측 카운터 정보들 */}
                            <div style={{ display:'flex', gap:'10px', alignItems:'center', marginLeft:'auto' }}>
                                <span>조회 {post.viewCount ?? 0}</span>
                                <span>추천 {post.likeCount ?? 0}</span>
                                <span>댓글 {comments.length}</span>
                            </div>
                        </div>
                    </header>

                    <hr className="post-divider" />

                    {/* With Me 정보 카드 (확정 시 읽기모드) */}
                    {post.withMeInfo && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                            <h3 style={{ marginTop: 0, color: "#166534" }}>🤝 With Me 모임 정보</h3>
                            <ul style={{ listStyle: "none", padding: 0, fontSize: 14, lineHeight: 1.8 }}>
                                <li>📍 <strong>장소:</strong> {post.withMeInfo.meetingLocation}</li>
                                <li>⏰ <strong>약속 시간:</strong> {post.withMeInfo.meetingTime.replace("T", " ")}</li>
                                <li>⏳ <strong>모집 마감:</strong> {post.withMeInfo.recruitmentDeadline.replace("T", " ")}</li>
                                <li>👥 <strong>참여 현황:</strong> {post.withMeInfo.currentParticipants} / {post.withMeInfo.maxParticipants} 명</li>
                            </ul>

                            <div style={{ marginTop: 15, borderTop: "1px solid #bbf7d0", paddingTop: 10 }}>
                                {user && post.writerName === user.nickname ? (
                                    // 작성자일 경우 참여자 명단 표시
                                    <div>
                                        <strong>참여자 명단:</strong>
                                        {post.withMeInfo.participantNicknames?.length === 0
                                            ? " (아직 없음)"
                                            : " " + post.withMeInfo.participantNicknames.join(", ")
                                        }
                                    </div>
                                ) : (
                                    // 일반 유저일 경우 버튼 영역
                                    <div>
                                        {/* 확정 여부(isConfirmed) 체크 */}
                                        {post.withMeInfo.isConfirmed ? (
                                            <div style={{
                                                padding: "10px", background: "#e5e7eb", color: "#374151",
                                                borderRadius: 8, textAlign: "center", fontWeight: "bold", border: "1px solid #d1d5db"
                                            }}>
                                                🔒 모집이 확정되었습니다. (변경 불가)
                                            </div>
                                        ) : (
                                            /* 확정 전: 참여/취소 가능 */
                                            <>
                                                {post.withMeInfo.isParticipating ? (
                                                    <button onClick={handleCancel} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "white", cursor: "pointer" }}>
                                                        참여 취소
                                                    </button>
                                                ) : (
                                                    <button onClick={handleJoin} disabled={post.withMeInfo.isFull} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: post.withMeInfo.isFull ? "#ccc" : "#22c55e", color: "white", cursor: post.withMeInfo.isFull ? "not-allowed" : "pointer" }}>
                                                        {post.withMeInfo.isFull ? "모집 마감" : "참여하기"}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <article className="post-content">{post.content}</article>

                    <div className="post-actions-row">
                        <button
                            className={`like-button ${hasLiked ? "liked" : ""}`}
                            onClick={handleLike}
                            disabled={isLiking}
                        >
                            <span className="heart">{hasLiked ? "♥" : "♡"}</span>
                            <span className="like-text">
                {hasLiked ? "좋아요 취소" : "좋아요"}
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
                        {/* 댓글 익명 체크박스 및 버튼 */}
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                            {post && (post.boardCode !== "ANON1" && post.boardCode !== "ANON2") && isLoggedIn && (
                                <label style={{ fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <input
                                        type="checkbox"
                                        checked={isCommentAnon}
                                        onChange={(e) => setIsCommentAnon(e.target.checked)}
                                    />
                                    익명
                                </label>
                            )}
                        <button className="comment-submit-btn" onClick={handleAddComment}>등록</button>
                    </div>
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

                                        {/* [왼쪽 그룹] 작성자 이름 + 날짜 (+ 수정됨 표시) */}
                                        <div className="comment-info-left">
                                            <span className="comment-writer">{c.writerName}</span>
                                            <span className="comment-date">
                                                {c.createdAt}
                                                {c.updatedAt && (
                                                    <span style={{ marginLeft: "6px", fontSize: "11px", color: "#888" }}>
                                                        (수정됨: {c.updatedAt})
                                                    </span>
                                                )}
                                            </span>
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