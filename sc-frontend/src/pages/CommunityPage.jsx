// sc-frontend/src/pages/CommunityPage.jsx

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import { createPost } from "../api/client";

const CommunityPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL에 ?board=FREE 이런 식으로 들어오면 그걸 기본값으로 사용
  const initialBoardCode = searchParams.get("board") || "FREE";

  const [boardCode, setBoardCode] = useState(initialBoardCode);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // 서버에 새 글 생성 요청
      const newId = await createPost(boardCode, title, content);
      // newId가 숫자라고 가정 (PostController에서 Long id 리턴)
      navigate(`/detail/${newId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "글 작성 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>글쓰기</h1>

        {/* 어떤 게시판에 쓸지 선택 (필요하면 감춰도 됨) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, marginRight: 8 }}>게시판</label>
          <select
            value={boardCode}
            onChange={(e) => setBoardCode(e.target.value)}
          >
            <option value="FREE">자유게시판</option>
            <option value="ANON1">익게1</option>
            <option value="ANON2">익게2</option>
            <option value="JOB">취업게시판</option>
            <option value="RECRUIT">모집공고</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 15,
              }}
            />
          </div>

          <div>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 15,
                resize: "vertical",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "red", fontSize: 14 }}>{error}</div>
          )}

          <div style={{ marginTop: 12 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                background: "#4b6cff",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                marginRight: 8,
              }}
            >
              {submitting ? "작성 중..." : "등록"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                background: "#eceff8",
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityPage;
