// src/pages/MainPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/MainPage.css";
import { fetchBoardPosts, fetchTop10Posts } from "../api/client";
import Header from "../components/Header";

const MainPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const boardRoutes = {
      popular: "/board/popular",
      free: "/board/free",
      withme: "/board/withme",
      anonymous1: "/board/anonymous1",
      anonymous2: "/board/anonymous2",
      job: "/board/job",
      recruit: "/board/recruit",
  };

  const goBoard = (key) => {
    navigate(boardRoutes[key]);
  };

  // 게시판별 state
  const [popularPosts, setPopularPosts] = useState([]);
  const [freePosts, setFreePosts] = useState([]);
  const [withMePosts, setWithMePosts] = useState([]);
  const [anon1Posts, setAnon1Posts] = useState([]);
    const [anon2Posts, setAnon2Posts] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [recruitPosts, setRecruitPosts] = useState([]);

  // 백엔드에서 실데이터 가져오기
  useEffect(() => {
    fetchTop10Posts()
      .then((data) => setPopularPosts(Array.isArray(data) ? data : []))
      .catch(() => setPopularPosts([]));

    fetchBoardPosts("FREE")
      .then((data) => setFreePosts(Array.isArray(data) ? data : []))
      .catch(() => setFreePosts([]));

    fetchBoardPosts("WITHME")
        .then((data) => setWithMePosts(Array.isArray(data) ? data : []))
        .catch(() => setWithMePosts([]));

    fetchBoardPosts("ANON1")
      .then((data) => setAnon1Posts(Array.isArray(data) ? data : []))
      .catch(() => setAnon1Posts([]));

    fetchBoardPosts("ANON2")
        .then((data) => setAnon2Posts(Array.isArray(data) ? data : []))
        .catch(() => setAnon2Posts([]));

    fetchBoardPosts("JOB")
      .then((data) => setJobPosts(Array.isArray(data) ? data : []))
      .catch(() => setJobPosts([]));

    fetchBoardPosts("RECRUIT")
      .then((data) => setRecruitPosts(Array.isArray(data) ? data : []))
      .catch(() => setRecruitPosts([]));
  }, []);

  const buildLinkProps = (post) => ({
    to: `/detail/${post.id}`,
  });

  const BoardSection = ({
    title,
    iconText,
    posts,
    morePath = "/detail",
    titleLink,
    className,
  }) => (
    <div className={className || "board-section"}>
      <div className="board-header">
        <span className="board-icon">{iconText}</span>
        {titleLink ? (
          <Link to={titleLink} className="board-title-link">
            {title}
          </Link>
        ) : (
          <h3>{title}</h3>
        )}
        <Link to={morePath} className="more-link">
          + 더보기
        </Link>
      </div>
      <ul className="post-list">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <li key={post.id ?? `${title}-${index}`}>
              <Link {...buildLinkProps(post)} className="post-title">
                {post.title}
              </Link>
              <span className="post-meta">
                ❤️ {post.likeCount ?? 0} · 👁 {post.viewCount ?? 0} · 💬 {post.commentCount ?? 0}
              </span>
            </li>
          ))
        ) : (
          <li className="post-empty">등록된 글이 없습니다.</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="main-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <div className="main-content">
        <div className="home-layout">
          {/* 좌측 위젯 영역 */}
          <aside className="left-column">
            <section className="left-card weather-card">
              <div className="left-card-header">☀ 오늘의 날씨</div>
              <div className="weather-main">
                <div className="weather-temp">23℃</div>
                <div className="weather-text">맑음 · 상명대 서울캠</div>
              </div>
              <div className="weather-sub">체감 21℃ · 미세먼지 보통</div>
            </section>

            <section className="left-card media-card">
              <div className="left-card-header">📷 사진 · 동영상</div>
              <ul className="media-list">
                <li>캠퍼스 풍경</li>
                <li>축제 스냅</li>
                <li>학과 행사</li>
              </ul>
            </section>

            <div className="quick-links-row">
              <div className="quick-card">
                <div className="quick-card-inner">지도</div>
              </div>
              <div className="quick-card">
                <div className="quick-card-inner">일정</div>
              </div>
            </div>

            <section className="left-card notice-card">
              <div className="left-card-header">📢 교내 공지사항</div>
              <ul className="notice-list">
                <li>2025-1 학사 일정 안내</li>
                <li>장학금 신청 마감 안내</li>
                <li>도서관 이용 시간 변경</li>
              </ul>
            </section>
          </aside>

          {/* 우측 게시판 영역 */}
          <main className="boards-area">
            <div className="boards-grid">
              <BoardSection
                title="오늘의 인기글"
                iconText="🔥"
                posts={popularPosts}
                titleLink={boardRoutes.popular}
                morePath={boardRoutes.popular}
              />

              <BoardSection
                  title="With Me (같이 해요)"
                  iconText="🤝"
                  posts={withMePosts}
                  titleLink={boardRoutes.withme}
                  morePath={boardRoutes.withme}
              />

              <BoardSection
                title="자유게시판"
                iconText="💬"
                posts={freePosts}
                titleLink={boardRoutes.free}
                morePath={boardRoutes.free}
              />
              <BoardSection
                title="익명게시판1"
                iconText="👤"
                posts={anon1Posts}
                titleLink={boardRoutes.anonymous1}
                morePath={boardRoutes.anonymous1}
              />
              <BoardSection
                  title="익명게시판2"
                  iconText="🕵️"
                  posts={anon2Posts}
                  titleLink={boardRoutes.anonymous2}
                  morePath={boardRoutes.anonymous2}
              />
              <BoardSection
                title="취업게시판"
                iconText="💼"
                posts={jobPosts}
                titleLink={boardRoutes.job}
                morePath={boardRoutes.job}
              />
              <BoardSection
                title="모집공고"
                iconText="📢"
                posts={recruitPosts}
                titleLink={boardRoutes.recruit}
                morePath={boardRoutes.recruit}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
