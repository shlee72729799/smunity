// src/pages/BoardPage.jsx
import { useEffect, useState } from "react";
<<<<<<< Updated upstream
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
=======
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { fetchBoardPosts, fetchTop10Posts } from "../api/client";
import "../styles/BoardPage.css";

const BOARD_CONFIG = {
  popular: {
    label: "오늘의 인기글",
    icon: "🔥",
    boardCode: null,
    description: "상명대 전체에서 가장 인기 있는 글들을 모아봤어요.",
    allowWrite: false,
  },
  withme: {
    label: "With Me (같이 해요)",
    icon: "🤝",
    boardCode: "WITHME",
    description: "같이 공부하고, 같이 놀 사람을 모집하는 공간입니다.",
    allowWrite: true,
  },
  free: {
    label: "자유게시판",
    icon: "💬",
    boardCode: "FREE",
    description: "자유롭게 이야기 나누는 공간입니다.",
    allowWrite: true,
  },
  anonymous1: {
    label: "익명게시판",
    icon: "👤",
    boardCode: "ANON1",
    description: "익명으로 편하게 이야기하는 공간입니다.",
    allowWrite: true,
  },
  anonymous2: {
    label: "이벤트/정보 게시판",
    icon: "🕵️",
    boardCode: "ANON2",
    description: "학교 동아리나 교내 이벤트 관련 내용을 공유할 수 있는 공간입니다.",
    allowWrite: true,
  },
  job: {
    label: "취업게시판",
    icon: "💼",
    boardCode: "JOB",
    description: "취업 정보와 후기, 질문을 공유하는 공간입니다.",
    allowWrite: true,
  },
  recruit: {
    label: "모집공고",
    icon: "📢",
    boardCode: "RECRUIT",
    description: "동아리, 스터디, 공모전, 대외활동 모집 글을 올리는 곳입니다.",
    allowWrite: true,
  },
};

const BOARD_ORDER = [
  "popular",
  "withme",
  "free",
  "anonymous1",
  "anonymous2",
  "job",
  "recruit",
];

const BoardPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const normalizedKey = String(type || "free").toLowerCase();
  const boardKey = BOARD_CONFIG[normalizedKey] ? normalizedKey : "free";
  const currentBoard = BOARD_CONFIG[boardKey];

  const [headerPopularPosts, setHeaderPopularPosts] = useState([]);
  const [overviewPosts, setOverviewPosts] = useState({
    popular: [],
    withme: [],
    free: [],
    anonymous1: [],
    anonymous2: [],
    job: [],
    recruit: [],
  });

  const [boardPosts, setBoardPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const top = await fetchTop10Posts();
        const topArr = Array.isArray(top) ? top : [];
        setHeaderPopularPosts(topArr);
        setOverviewPosts((prev) => ({
          ...prev,
          popular: topArr.slice(0, 3),
        }));
      } catch {
        setHeaderPopularPosts([]);
        setOverviewPosts((prev) => ({ ...prev, popular: [] }));
      }

      const boardList = [
        { key: "withme", code: "WITHME" },
        { key: "free", code: "FREE" },
        { key: "anonymous1", code: "ANON1" },
        { key: "anonymous2", code: "ANON2" },
        { key: "job", code: "JOB" },
        { key: "recruit", code: "RECRUIT" },
      ];

      boardList.forEach(async ({ key, code }) => {
        try {
          const data = await fetchBoardPosts(code);
          const arr = Array.isArray(data) ? data : [];
          setOverviewPosts((prev) => ({ ...prev, [key]: arr.slice(0, 3) }));
        } catch {
          setOverviewPosts((prev) => ({ ...prev, [key]: [] }));
        }
      });
    };

    loadOverview();
  }, []);
>>>>>>> Stashed changes

  // 게시글 목록 가져오기
  useEffect(() => {
<<<<<<< Updated upstream
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
=======
    const loadCurrentBoard = async () => {
      setLoading(true);
      try {
        if (boardKey === "popular") {
          const top = await fetchTop10Posts();
          const arr = Array.isArray(top) ? top : [];
          setBoardPosts(arr);
        } else {
          const boardCode = currentBoard.boardCode;
          if (!boardCode) setBoardPosts([]);
          else {
            const data = await fetchBoardPosts(boardCode);
            setBoardPosts(Array.isArray(data) ? data : []);
          }
        }
      } catch {
        setBoardPosts([]);
>>>>>>> Stashed changes
      } finally {
        setLoading(false);
      }
    };

<<<<<<< Updated upstream
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
=======
    loadCurrentBoard();
  }, [boardKey, currentBoard.boardCode]);

  const handleChangeBoard = (key) => {
    if (key === boardKey) return;
    navigate(`/board/${key}`);
  };

  // 여기 “한방” 수정: /write?... -> /board/:type/new
  const handleWrite = () => {
    if (boardKey === "popular") {
      alert("인기게시판에서는 직접 글쓰기가 불가능합니다.\n각 게시판에서 글을 작성해 주세요.");
      return;
    }
    navigate(`/board/${boardKey}/new`, {
      state: { boardCode: currentBoard.boardCode },
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ko-KR");
  };
>>>>>>> Stashed changes

  const boardTitle = boardNameMap[type] || "게시판";

  return (
    <div className="board-page">
<<<<<<< Updated upstream
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
=======
      <Header popularPosts={headerPopularPosts} />

      <div className="board-banner-spacing" />

      <div className="board-page-inner">
        <header className="board-main-header">
          <div className="board-main-title-wrap">
            <div className="board-main-badge">{currentBoard.icon}</div>
            <div>
              <h1 className="board-main-title">{currentBoard.label}</h1>
              {currentBoard.description && (
                <p className="board-main-subtitle">{currentBoard.description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="board-write-btn"
            onClick={handleWrite}
            disabled={currentBoard.allowWrite === false}
          >
            글쓰기
          </button>
        </header>

        <div className="board-layout">
          <aside className="board-left-wrapper">
            <div className="board-left-box">
              <div className="board-left-title-row">
                <span className="board-left-title">전체 게시판</span>
              </div>

              <div className="board-left-list">
                {BOARD_ORDER.map((key) => {
                  const cfg = BOARD_CONFIG[key];
                  const posts = overviewPosts[key] || [];
                  const isActive = key === boardKey;

                  return (
                    <section
                      key={key}
                      className={"board-mini-card" + (isActive ? " board-mini-card-active" : "")}
                      onClick={() => handleChangeBoard(key)}
                    >
                      <div className="board-mini-header">
                        <span className="board-mini-icon">{cfg.icon}</span>

                        <Link
                          to={`/board/${key}`}
                          className="board-mini-label-link"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleChangeBoard(key);
                          }}
                        >
                          {cfg.label}
                        </Link>
                      </div>

                      <ul className="board-mini-posts">
                        {posts.length === 0 ? (
                          <li className="board-mini-empty">게시글이 없습니다.</li>
                        ) : (
                          posts.map((post) => (
                            <li key={post.id} className="board-mini-post-item">
                              <Link
                                to={`/detail/${post.id}`}
                                className="board-mini-post-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {post.title}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="board-right-column">
            <div className="board-main-list-header">게시글 목록</div>

            {loading ? (
              <div className="board-main-empty">게시글을 불러오는 중입니다...</div>
            ) : boardPosts.length === 0 ? (
              <div className="board-main-empty">아직 등록된 게시글이 없습니다.</div>
            ) : (
              <ul className="board-main-post-list">
                {boardPosts.map((post) => (
                  <li key={post.id} className="board-main-post-item">
                    <div className="board-main-post-left">
                      <Link to={`/detail/${post.id}`} className="board-main-post-title-link">
                        {post.title}
                      </Link>
                      <div className="board-main-post-meta">
                        <span className="board-main-author">{post.author || "익명"}</span>
                        {post.createdAt && (
                          <span className="board-main-date">{formatDate(post.createdAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="board-main-post-stats">
                      <span>❤️ {post.likeCount ?? 0}</span>
                      <span>👁 {post.viewCount ?? 0}</span>
                      <span>💬 {post.commentCount ?? 0}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </main>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
