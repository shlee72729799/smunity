<<<<<<< Updated upstream
// src/pages/NewPostPage.jsx
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { createPost } from "../api/client";

// URL의 type 기준으로 boardCode 계산
=======
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { createPost, updatePost, fetchPostDetail } from "../api/client";

// 게시판 코드 매핑 (WITHME 추가)
>>>>>>> Stashed changes
const resolveBoardCode = (type) => {
  switch (type) {
    case "free":
      return "FREE";
    case "anonymous1":
      return "ANON1";
<<<<<<< Updated upstream
=======
    case "anonymous2":
      return "ANON2";
>>>>>>> Stashed changes
    case "job":
      return "JOB";
    case "recruit":
      return "RECRUIT";
<<<<<<< Updated upstream
=======
    case "withme":
      return "WITHME";
>>>>>>> Stashed changes
    default:
      return "FREE";
  }
};

const NewPostPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< Updated upstream
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

=======
  const { type } = useParams();

  // 전달받은 state 확인 (수정 모드인지?)
  const state = location.state || {};
  const isEditMode = state.mode === "edit";
  const editPostId = state.postId;

  // 초기 상태 설정
  const boardCodeFromUrl = resolveBoardCode(type);
  const initialBoardCode = state.boardCode || boardCodeFromUrl || "FREE";

  const [boardCode, setBoardCode] = useState(initialBoardCode);
  const [title, setTitle] = useState(state.initialTitle || "");
  const [content, setContent] = useState(state.initialContent || "");

  // With Me 전용 State
  const [withMeInput, setWithMeInput] = useState("");
  const [recruitmentDeadline, setRecruitmentDeadline] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(2);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isAnonymous, setIsAnonymous] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // 한국 시간 보정
    return now.toISOString().slice(0, 16);
  };

  // 수정 모드일 경우, 글 내용을 API로 가져와 폼을 채움
  useEffect(() => {
    if (isEditMode && editPostId) {
      fetchPostDetail(editPostId)
        .then((data) => {
          setTitle(data.title || "");
          setContent(data.content || "");
          if (data.boardCode) setBoardCode(data.boardCode);
        })
        .catch((err) => {
          setError("수정할 게시글 정보를 불러오는 데 실패했습니다.");
          console.error("Fetch Edit Post Failed:", err);
        });
    }
  }, [isEditMode, editPostId]);

>>>>>>> Stashed changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

<<<<<<< Updated upstream
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력하세요.");
=======
    let finalTitle = title;

    // 1) With Me 게시판 유효성 검사 및 제목 생성
    if (boardCode === "WITHME") {
      if (!withMeInput.trim()) {
        setError("제목 키워드를 입력해주세요.");
        return;
      }
      finalTitle = `나랑 같이 ${withMeInput} 사람~`;

      // 필수 입력 체크
      if (!recruitmentDeadline || !meetingTime || !meetingLocation) {
        setError("날짜, 시간, 장소를 모두 입력해주세요.");
        return;
      }
      // 시간 논리 체크
      if (new Date(recruitmentDeadline) > new Date(meetingTime)) {
        setError("모집 마감은 약속 시간보다 빨라야 합니다.");
        return;
      }
    } else {
      // 2) 일반 게시판 유효성 검사
      if (!finalTitle.trim()) {
        setError("제목을 입력해주세요.");
        return;
      }
    }

    // 공통 유효성 검사
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
>>>>>>> Stashed changes
      return;
    }

    try {
      setSubmitting(true);
<<<<<<< Updated upstream
      // createPost의 파라미터 형식이 다르면 여기만 프로젝트에 맞게 바꿔주면 됨
      const newId = await createPost(boardCode, title, content);
      navigate(`/detail/${newId}`);
    } catch (err) {
      console.error("글 작성 오류:", err);
      setError(err.message || "글 작성 중 오류가 발생했습니다.");
=======

      const forceAnonymous = boardCode === "ANON1" || boardCode === "ANON2";
      const isAnonToSend = forceAnonymous ? true : isAnonymous;

      if (isEditMode) {
        // 수정
        await updatePost(editPostId, finalTitle, content);
        alert("게시글이 성공적으로 수정되었습니다.");
        navigate(`/detail/${editPostId}`);
      } else {
        // 작성 (WITHME일 때만 추가 필드 포함)
        const extra =
          boardCode === "WITHME"
            ? {
                isAnonymous: isAnonToSend,
                recruitmentDeadline,
                meetingTime,
                meetingLocation,
                maxParticipants: parseInt(maxParticipants, 10),
              }
            : {
                isAnonymous: isAnonToSend,
              };

        await createPost(boardCode, finalTitle, content, extra);
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "작업 중 오류가 발생했습니다.";
      setError(msg);
>>>>>>> Stashed changes
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< Updated upstream
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
=======
  // 익명 게시판인지 확인하는 헬퍼
  const isAnonBoard = boardCode === "ANON1" || boardCode === "ANON2";
>>>>>>> Stashed changes

  return (
    <div className="main-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
<<<<<<< Updated upstream
        <h1 style={{ marginBottom: 16 }}>새 글 작성</h1>
=======
        <h1 style={{ marginBottom: 16 }}>
          {isEditMode ? "글 수정하기" : "새 글 작성"}
        </h1>
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
            <select
              id="board"
              value={boardCode}
              onChange={(e) => setBoardCode(e.target.value)}
<<<<<<< Updated upstream
=======
              disabled={isEditMode}
>>>>>>> Stashed changes
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
<<<<<<< Updated upstream
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
=======
                backgroundColor: isEditMode ? "#f0f0f0" : "#fff",
              }}
            >
              <option value="FREE">자유게시판</option>
              <option value="WITHME">With Me (같이 해요)</option>
              <option value="ANON1">익명게시판</option>
              <option value="ANON2">이벤트/정보 게시판</option>
              <option value="JOB">취업게시판</option>
              <option value="RECRUIT">모집공고</option>
            </select>

            <div style={{ padding: "0 5px", marginTop: 6 }}>
              {isAnonBoard ? (
                <span style={{ fontSize: 14, color: "#fff", fontWeight: "bold" }}>
                  ℹ️ 이 게시판은 익명으로 작성됩니다.
                </span>
              ) : (
                <label
                  style={{
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  익명으로 작성
                </label>
              )}
            </div>
          </div>

          {/* With Me 제목 입력 UI 분기 */}
          {boardCode === "WITHME" ? (
            <div
              style={{
                background: "#f0f8ff",
                padding: 15,
                borderRadius: 8,
                border: "1px solid #cce5ff",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: "bold" }}>나랑 같이 </span>
              <input
                type="text"
                value={withMeInput}
                onChange={(e) => setWithMeInput(e.target.value)}
                placeholder="예: 밥 먹을"
                style={{
                  fontSize: 16,
                  padding: "5px 10px",
                  width: 200,
                  margin: "0 5px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
              <span style={{ fontSize: 18, fontWeight: "bold" }}> 사람~</span>
            </div>
          ) : (
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
          )}

          {/* With Me 추가 정보 입력 필드 */}
          {boardCode === "WITHME" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                background: "#fafafa",
                padding: 15,
                borderRadius: 8,
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                  모집 인원 (본인 제외)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                  약속 장소
                </label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                  모집 마감
                </label>
                <input
                  type="datetime-local"
                  value={recruitmentDeadline}
                  onChange={(e) => setRecruitmentDeadline(e.target.value)}
                  min={getMinDateTime()}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                  약속 시간
                </label>
                <input
                  type="datetime-local"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  min={getMinDateTime()}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          )}
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
              {submitting ? "작성 중..." : "작성하기"}
            </button>
=======
              {submitting ? "처리 중..." : isEditMode ? "수정 완료" : "작성하기"}
            </button>

>>>>>>> Stashed changes
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
