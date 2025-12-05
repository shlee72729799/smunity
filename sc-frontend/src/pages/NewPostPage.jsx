import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { createPost, updatePost, fetchPostDetail } from "../api/client";

const resolveBoardCode = (type) => { /* 기존 로직 유지 */
    switch (type) {
        case "free": return "FREE";
        case "anonymous1": return "ANON1";
        case "job": return "JOB";
        case "recruit": return "RECRUIT";
        default: return "FREE";
    }
};

const NewPostPage = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { type } = useParams();

    // 전달받은 state 확인 (수정 모드인지?)
    const state = location.state || {};
    const isEditMode = state.mode === 'edit';
    const editPostId = state.postId;

    //초기 상태 설정
    const boardCodeFromUrl = resolveBoardCode(type);
    const initialBoardCode = state.boardCode || boardCodeFromUrl || "FREE";

    const [boardCode, setBoardCode] = useState(initialBoardCode);
    const [title, setTitle] = useState(state.initialTitle || "");
    const [content, setContent] = useState(state.initialContent || "");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // 수정 모드일 경우, 글 내용을 API로 가져와 폼을 채움
    useEffect(() => {
        if (isEditMode && editPostId) {
            fetchPostDetail(editPostId)
                .then(data => {
                    setTitle(data.title);
                    setContent(data.content);
                    if (data.boardCode) setBoardCode(data.boardCode);
                })
                .catch(err => {
                    setError("수정할 게시글 정보를 불러오는 데 실패했습니다.");
                    console.error("Fetch Edit Post Failed:", err);
                });
        }
    }, [isEditMode, editPostId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 모두 입력하세요.");
            return;
        }

        try {
            setSubmitting(true);

            if (isEditMode) {
                // 수정 API 호출
                await updatePost(editPostId, title, content);
                alert("게시글이 성공적으로 수정되었습니다.");
                navigate(`/detail/${editPostId}`); // 상세 페이지로 이동
            } else {
                // 작성 API 호출
                const newId = await createPost(boardCode, title, content);
                navigate(`/detail/${newId}`);
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "작업 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="main-page">
            <Header isLoggedIn={isLoggedIn} logout={logout} />
            <div className="banner-spacing" />

            <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
                {/* 타이틀 변경 */}
                <h1 style={{ marginBottom: 16 }}>{isEditMode ? "글 수정하기" : "새 글 작성"}</h1>

                {error && (
                    <div style={{ marginBottom: 16, padding: 12, background: "#ffe5e5", color: "#c00", borderRadius: 8 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                        <label htmlFor="board" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>게시판</label>
                        <select
                            id="board"
                            value={boardCode}
                            onChange={(e) => setBoardCode(e.target.value)}
                            disabled={isEditMode} // 수정 시 게시판 이동 불가
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", backgroundColor: isEditMode ? "#f0f0f0" : "#fff" }}
                        >
                            <option value="FREE">자유게시판</option>
                            <option value="ANON1">익명게시판1</option>
                            <option value="JOB">취업게시판</option>
                            <option value="RECRUIT">모집공고</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="title" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>제목</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}
                            placeholder="제목을 입력하세요"
                        />
                    </div>

                    <div>
                        <label htmlFor="content" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>내용</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", resize: "vertical" }}
                            placeholder="내용을 입력하세요"
                        />
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: "10px 18px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                background: submitting ? "#aaa" : "#4b6cff",
                                color: "#fff",
                                fontWeight: 600,
                                marginRight: 8,
                            }}
                        >
                            {submitting ? "처리 중..." : (isEditMode ? "수정 완료" : "작성하기")}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{ padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer", background: "#eceff8" }}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewPostPage;