// src/pages/BoardPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { fetchBoardPosts, fetchTop10Posts } from "../api/client";
import "../styles/BoardPage.css";

// URL의 type -> 화면에 보여줄 게시판 이름
const boardNameMap = {
  popular: "오늘의 인기글",
  free: "자유 게시판",
  anonymous1: "익명 게시판 1",
  job: "취업 게시판",
  recruit: "모집 공고",
};

// URL의 type -> 백엔드 boardCode
const boardCodeMap = {
  free: "FREE",
  anonymous1: "ANON1",
  job: "JOB",
  recruit: "RECRUIT",
};

const BoardPage = () => {
  const { type } = useParams(); // popular, free, anonymous1, job, recruit ...
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 글쓰기 때 사용할 boardCode (popular에서 글쓰기 하면 FREE로)
  const resolvedBoardCode =
    type === "popular" ? "FREE" : boardCodeMap[type] || "FREE";

  // 게시글 목록 가져오기
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (type === "popular") {
          // 인기글 게시판: Top10 API 사용
          const data = await fetchTop10Posts();
          const list = Array.isArray(data) ? data : data?.data ?? [];
          setPosts(list);
        } else {
          // 나머지 게시판: boardCode 기반으로 목록 조회
          const boardCode = boardCodeMap[type] || "FREE";
          const data = await fetchBoardPosts(boardCode);
          const list = Array.isArray(data) ? data : data?.data ?? [];
          list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
          setPosts(list);
        }
      } catch (e) {
        console.error(e);
        setError("게시글 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type]);

  // 글쓰기 버튼 눌렀을 때
  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert("글쓰기는 로그인 후 이용 가능합니다.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    // popular 에서 글쓰기 누르면 free 게시판으로 이동
    const writeBoardType = type === "popular" ? "free" : type || "free";

    navigate(`/board/${writeBoardType}/new`, {
      state: {
        boardCode: resolvedBoardCode, // 백엔드용 코드(FREE, ANON1, JOB...)
        from: location.pathname,
      },
    });
  };

  if (loading) {
    return (
      <div className="board-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <div className="board-container">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <div className="board-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const boardTitle = boardNameMap[type] || "게시판";

  return (
    <div className="board-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <div className="board-container">
        {/* 상단 탭 + 글쓰기 버튼 영역 */}
        <div className="board-top-bar">
          <div className="board-tabs">
            <button className="tab active">{boardTitle}</button>
          </div>
          <button className="write-button" onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>

        <div className="board-layout">
          {/* 왼쪽: 게시글 리스트 */}
          <section className="board-main-list">
            <div className="board-main-header">
              <h2>{boardTitle}</h2>
              <span className="board-count">{posts.length}개의 글</span>
            </div>
            <ul className="board-post-list">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      to={`/detail/${post.id}`}
                      state={{ from: location.pathname }}
                      className="board-post-link"
                    >
                      <span className="board-post-title">{post.title}</span>
                      <span className="board-post-meta">
                        ❤️ {post.likeCount ?? 0} · 👁 {post.viewCount ?? 0} · 💬{" "}
                        {post.commentCount ?? 0}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="board-post-empty">등록된 글이 없습니다.</li>
              )}
            </ul>
          </section>

          {/* 오른쪽: 사이드 카드(실시간/HOT 등) */}
          <aside className="board-side">
            <div className="side-card">
              <h3>실시간 인기 글</h3>
              <p>추후 좋아요/조회수 기반 정렬 예정</p>
            </div>
            <div className="side-card">
              <h3>HOT 게시물</h3>
              <p>추후 구현 예정</p>
            </div>
            <div className="side-card">
              <h3>BEST 게시판</h3>
              <p>추후 구현 예정</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
