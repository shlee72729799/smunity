// src/pages/NewPostPage.jsx
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { createPost } from "../api/client";

// URL의 type 기준으로 boardCode 계산
const resolveBoardCode = (type) => {
  switch (type) {
    case "free":
      return "FREE";
    case "anonymous1":
      return "ANON1";
    case "job":
      return "JOB";
    case "recruit":
      return "RECRUIT";
    default:
      return "FREE";
  }
};

const NewPostPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = useParams(); // /board/:type/new 의 type (free, anonymous1...)

  // BoardPage에서 넘겨준 boardCode가 있으면 그걸 우선 사용, 없으면 URL 기준으로 계산
  const boardCodeFromState = location.state?.boardCode;
  const boardCodeFromUrl = resolveBoardCode(type);
  const initialBoardCode = boardCodeFromState || boardCodeFromUrl || "FREE";

  const [boardCode, setBoardCode] = useState(initialBoardCode);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력하세요.");
      return;
    }

    try {
      setSubmitting(true);
      // createPost의 파라미터 형식이 다르면 여기만 프로젝트에 맞게 바꿔주면 됨
      const newId = await createPost(boardCode, title, content);
      navigate(`/detail/${newId}`);
    } catch (err) {
      console.error("글 작성 오류:", err);
      setError(err.message || "글 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="main-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
          <p>글을 작성하려면 로그인이 필요합니다.</p>
          <button
            onClick={() =>
              navigate("/login", { state: { from: location.pathname } })
            }
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "#4b6cff",
              color: "#fff",
            }}
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>새 글 작성</h1>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#ffe5e5",
              color: "#c00",
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div>
            <label
              htmlFor="board"
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              게시판
            </label>
            <select
              id="board"
              value={boardCode}
              onChange={(e) => setBoardCode(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            >
              <option value="FREE">자유게시판</option>
              <option value="ANON1">익게1</option>
              <option value="JOB">취업게시판</option>
              <option value="RECRUIT">모집공고</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="title"
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                resize: "vertical",
              }}
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
              {submitting ? "작성 중..." : "작성하기"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: "#eceff8",
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

export default NewPostPage;
