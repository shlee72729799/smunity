// src/pages/MainPage.jsx
<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/MainPage.css";
import { fetchBoardPosts, fetchTop10Posts } from "../api/client";
import Header from "../components/Header";

const MainPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
=======
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/MainPage.css";
import "../styles/MediaShortsPage.css"; // 쇼츠 팝업 CSS 같이 사용
import {
  fetchBoardPosts,
  fetchTop10Posts,
  fetchWeather,
  fetchSmuNotices,
} from "../api/client";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { getMediaPosts, setMediaPostsStore } from "../store/mediaStore";

const getCommentsCount = (post) => {
  if (!post) return 0;
  if (Array.isArray(post.comments)) return post.comments.length;
  if (typeof post.commentCount === "number") return post.commentCount;
  return 0;
};

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserName =
    user?.nickname ||
    user?.username ||
    user?.loginId ||
    user?.userId ||
    user?.email ||
    user?.id ||
    "알 수 없음";
>>>>>>> Stashed changes

  const boardRoutes = {
    popular: "/board/popular",
    free: "/board/free",
<<<<<<< Updated upstream
    anonymous1: "/board/anonymous1",
=======
    withme: "/board/withme",
    anonymous1: "/board/anonymous1",
    anonymous2: "/board/anonymous2",
>>>>>>> Stashed changes
    job: "/board/job",
    recruit: "/board/recruit",
  };

  const goBoard = (key) => {
    navigate(boardRoutes[key]);
  };

  // 게시판별 state
  const [popularPosts, setPopularPosts] = useState([]);
  const [freePosts, setFreePosts] = useState([]);
<<<<<<< Updated upstream
  const [anon1Posts, setAnon1Posts] = useState([]);
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

    fetchBoardPosts("ANON1")
      .then((data) => setAnon1Posts(Array.isArray(data) ? data : []))
      .catch(() => setAnon1Posts([]));

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

=======
  const [withMePosts, setWithMePosts] = useState([]);
  const [anon1Posts, setAnon1Posts] = useState([]);
  const [anon2Posts, setAnon2Posts] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [recruitPosts, setRecruitPosts] = useState([]);

  // 날씨 state
  const [weather, setWeather] = useState({
    description: "",
    temp: null,
    feelsLike: null,
    humidity: null,
  });

  // 공지사항 state
  const [notices, setNotices] = useState([]);
  const [noticeStatus, setNoticeStatus] = useState("loading");

  // 지도 모달
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMapZoomed, setIsMapZoomed] = useState(false);

  // 일정 / 공지 모달
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  // 사진 · 동영상 목록 (공용 스토어에서 읽기)
  const [mediaPosts, setMediaPosts] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);

  // 메인에서도 쇼츠와 똑같은 팝업 사용
  const [isShortsModalOpen, setIsShortsModalOpen] = useState(false);
  const [shortsSelectedId, setShortsSelectedId] = useState(null);
  const [shortsNewComment, setShortsNewComment] = useState("");

  const currentMedia =
    mediaPosts.length > 0 ? mediaPosts[mediaIndex] : null;

  const shortsModalPost =
    shortsSelectedId != null
      ? mediaPosts.find((p) => p.id === shortsSelectedId)
      : null;

  // 사진·동영상 카드 안에서 마우스 휠로 이전/다음 이동
  const handleMediaWheel = useCallback(
    (e) => {
      if (mediaPosts.length <= 1) return;
      e.preventDefault();
      e.stopPropagation();

      if (e.deltaY > 0) {
        setMediaIndex((prev) =>
          prev + 1 >= mediaPosts.length ? 0 : prev + 1
        );
      } else if (e.deltaY < 0) {
        setMediaIndex((prev) =>
          prev - 1 < 0 ? mediaPosts.length - 1 : prev - 1
        );
      }
    },
    [mediaPosts.length]
  );

  // 데이터 로딩
  useEffect(() => {
    // 미디어 게시글: 공용 스토어에서 읽기
    const storePosts = getMediaPosts();
    setMediaPosts(Array.isArray(storePosts) ? storePosts : []);

    // 인기글 Top10
    fetchTop10Posts()
      .then((data) => setPopularPosts(Array.isArray(data) ? data : []))
      .catch(() => setPopularPosts([]));

    // 각 게시판 글
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

    // 날씨 호출
    fetchWeather()
      .then((data) => {
        setWeather({
          description: data.description,
          temp: data.temp,
          feelsLike: data.feelsLike,
          humidity: data.humidity,
        });
      })
      .catch(() => {
        setWeather({
          description: "정보 없음",
          temp: null,
          feelsLike: null,
          humidity: null,
        });
      });

    // 교내 공지사항
    setNoticeStatus("loading");
    fetchSmuNotices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNotices(data);
          setNoticeStatus("success");
        } else {
          setNotices([]);
          setNoticeStatus("empty");
        }
      })
      .catch(() => {
        setNotices([]);
        setNoticeStatus("error");
      });
  }, []);

  const buildLinkProps = (post) => ({
    to: `/detail/${post.id}`,
  });

>>>>>>> Stashed changes
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
                ❤️ {post.likeCount ?? 0} · 👁 {post.viewCount ?? 0} · 💬{" "}
                {post.commentCount ?? 0}
              </span>
            </li>
          ))
        ) : (
          <li className="post-empty">등록된 글이 없습니다.</li>
        )}
      </ul>
    </div>
  );
<<<<<<< Updated upstream

  return (
    <div className="main-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
=======

  // 메인에서 쇼츠 팝업 열기 (조회수 +1 포함)
  const openShortsDetail = (id) => {
    setMediaPosts((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, viewCount: (p.viewCount ?? 0) + 1 } : p
      );
      setMediaPostsStore(next);
      return next;
    });
    setShortsSelectedId(id);
    setIsShortsModalOpen(true);
    setShortsNewComment("");
  };

  const closeShortsDetail = () => {
    setIsShortsModalOpen(false);
    setShortsSelectedId(null);
    setShortsNewComment("");
  };

  const handleShortsLike = (id) => {
    setMediaPosts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.liked;
        const current = p.likeCount ?? 0;
        return {
          ...p,
          liked,
          likeCount: liked ? current + 1 : Math.max(0, current - 1),
        };
      });
      setMediaPostsStore(next);
      return next;
    });
  };

  const handleShortsAddComment = () => {
    const text = shortsNewComment.trim();
    if (!text || shortsSelectedId == null) return;

    setMediaPosts((prev) => {
      const next = prev.map((p) =>
        p.id === shortsSelectedId
          ? {
              ...p,
              comments: [
                ...(p.comments ?? []),
                {
                  id: Date.now(),
                  author: currentUserName,
                  content: text,
                },
              ],
            }
          : p
      );
      setMediaPostsStore(next);
      return next;
    });

    setShortsNewComment("");
  };

  return (
    <div className="main-page">
      <Header popularPosts={popularPosts} />

>>>>>>> Stashed changes
      <div className="banner-spacing" />

      <div className="main-content">
        <div className="home-layout">
          {/* 좌측 위젯 영역 */}
          <aside className="left-column">
<<<<<<< Updated upstream
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
=======
            {/* 날씨 카드 */}
            <section className="left-card weather-card">
              <div className="left-card-header">☀ 오늘의 날씨</div>
              <div className="weather-main">
                <div className="weather-temp">
                  {weather.temp !== null
                    ? `${Math.round(weather.temp)}℃`
                    : "-℃"}
                </div>
                <div className="weather-text">
                  {(weather.description || "정보 없음") + " · 상명대 서울캠"}
                </div>
              </div>
              <div className="weather-sub">
                {weather.feelsLike !== null
                  ? `체감 ${Math.round(weather.feelsLike)}℃`
                  : "체감 온도 정보 없음"}
                {weather.humidity !== null
                  ? ` · 습도 ${weather.humidity}%`
                  : ""}
              </div>
            </section>

            {/* 사진/동영상 카드 */}
            <section className="left-card media-card">
              <div className="left-card-header">
                <span>사진 · 동영상</span>
                <Link to="/media-shorts" className="media-plus-btn">
                  +
                </Link>
              </div>

              {currentMedia ? (
                <div
                  className="media-preview-container"
                  onWheel={handleMediaWheel}
                  onClick={() => openShortsDetail(currentMedia.id)}
                >
                  <div className="media-preview-title">
                    {currentMedia.title}
                  </div>

                  <div className="media-preview-media">
                    {currentMedia.mediaType === "video" ? (
                      <video
                        src={currentMedia.mediaUrl}
                        muted
                        autoPlay
                        loop
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : (
                      <img
                        src={currentMedia.mediaUrl}
                        alt={currentMedia.title}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    )}
                  </div>

                  <div className="media-preview-stats">
                    <span>
                      ❤️{" "}
                      <span className="media-stat-number">
                        {currentMedia.likeCount ?? 0}
                      </span>
                    </span>
                    <span className="media-stat-sep">·</span>
                    <span>
                      👁{" "}
                      <span className="media-stat-number">
                        {currentMedia.viewCount ?? 0}
                      </span>
                    </span>
                    <span className="media-stat-sep">·</span>
                    <span>
                      💬{" "}
                      <span className="media-stat-number">
                        {getCommentsCount(currentMedia)}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="media-preview-empty">
                  등록된 사진·동영상이 없습니다.
                  <br />
                  오른쪽 상단 + 버튼으로 업로드해 보세요.
                </div>
              )}
            </section>

            {/* 지도 / 일정 퀵 카드 */}
            <div className="quick-links-row">
              <div
                className="quick-card quick-card-map"
                onClick={() => setIsMapOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setIsMapOpen(true);
                }}
              >
                <div className="quick-card-inner">
                  <img
                    src="/images/campus-map-thumb.png"
                    alt="상명대 캠퍼스 지도"
                    className="map-thumb"
                  />
                  <div className="quick-card-label">지도</div>
                </div>
              </div>

              <div
                className="quick-card"
                onClick={() => setIsScheduleOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setIsScheduleOpen(true);
                }}
              >
                <div className="quick-card-inner">
                  <img
                    src="/images/smu-schedule-thumb.png"
                    alt="상명대 학사 일정"
                    className="map-thumb"
                  />
                  <div className="quick-card-label">일정</div>
                </div>
              </div>
            </div>

            {/* 공지사항 카드 */}
            <section
              className="left-card notice-card clickable-card"
              onClick={() => setIsNoticeOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setIsNoticeOpen(true);
              }}
            >
              <div className="left-card-header">📢 교내 공지사항</div>
              <ul className="notice-list">
                {noticeStatus === "loading" && (
                  <>
                    <li>공지사항을 불러오는 중입니다.</li>
                    <li>잠시 후 다시 시도해주세요.</li>
                  </>
                )}

                {noticeStatus === "error" && (
                  <li>공지사항을 가져오지 못했습니다.</li>
                )}

                {noticeStatus === "empty" && (
                  <li>
                    상명대학교(서울) 공지사항을 보기 위해서 클릭하시오.
                  </li>
                )}

                {noticeStatus === "success" &&
                  notices.map((n, idx) => (
                    <li key={idx}>
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {n.title}
                      </a>
                    </li>
                  ))}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

              <BoardSection
                title="With Me (같이 해요)"
                iconText="🤝"
                posts={withMePosts}
                titleLink={boardRoutes.withme}
                morePath={boardRoutes.withme}
              />

>>>>>>> Stashed changes
              <BoardSection
                title="자유게시판"
                iconText="💬"
                posts={freePosts}
                titleLink={boardRoutes.free}
                morePath={boardRoutes.free}
              />
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
              <BoardSection
                title="익명게시판1"
                iconText="👤"
                posts={anon1Posts}
                titleLink={boardRoutes.anonymous1}
                morePath={boardRoutes.anonymous1}
              />
<<<<<<< Updated upstream
=======

              <BoardSection
                title="익명게시판2"
                iconText="🕵️"
                posts={anon2Posts}
                titleLink={boardRoutes.anonymous2}
                morePath={boardRoutes.anonymous2}
              />

>>>>>>> Stashed changes
              <BoardSection
                title="취업게시판"
                iconText="💼"
                posts={jobPosts}
                titleLink={boardRoutes.job}
                morePath={boardRoutes.job}
              />
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

      {/* 지도 모달 */}
      {isMapOpen && (
        <div
          className="map-modal-overlay"
          onClick={() => {
            setIsMapOpen(false);
            setIsMapZoomed(false);
          }}
        >
          <div
            className="map-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="map-modal-header">
              <span>상명대학교 캠퍼스 지도</span>
              <button
                type="button"
                className="map-modal-close"
                onClick={() => {
                  setIsMapOpen(false);
                  setIsMapZoomed(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="map-modal-body">
              <img
                src="/images/campus-map-large.png"
                alt="상명대 캠퍼스 상세 지도"
                className={`map-modal-img ${
                  isMapZoomed ? "zoomed" : ""
                }`}
                onClick={() => setIsMapZoomed((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 학사일정 모달 */}
      {isScheduleOpen && (
        <div
          className="web-modal-overlay"
          onClick={() => setIsScheduleOpen(false)}
        >
          <div
            className="web-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="web-modal-header">
              <span>상명대학교 학사 일정</span>
              <button
                type="button"
                className="web-modal-close"
                onClick={() => setIsScheduleOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="web-modal-body">
              <iframe
                src="https://www.smu.ac.kr/kor/life/academicCalendar.do"
                title="상명대학교 학사 일정"
                className="web-modal-iframe"
              />
            </div>
          </div>
        </div>
      )}

      {/* 교내 공지 모달 */}
      {isNoticeOpen && (
        <div
          className="web-modal-overlay"
          onClick={() => setIsNoticeOpen(false)}
        >
          <div
            className="web-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="web-modal-header">
              <span>상명대학교 교내 공지사항</span>
              <button
                type="button"
                className="web-modal-close"
                onClick={() => setIsNoticeOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="web-modal-body">
              <iframe
                src="https://www.smu.ac.kr/kor/life/notice.do?srCampus=smu"
                title="상명대학교 교내 공지사항"
                className="web-modal-iframe"
              />
            </div>
          </div>
        </div>
      )}

      {/* 메인에서도 쇼츠와 똑같은 팝업 (댓글 가능) */}
      {isShortsModalOpen && shortsModalPost && (
        <div
          className="shorts-modal-overlay"
          onClick={closeShortsDetail}
        >
          <div
            className="shorts-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shorts-modal-header">
              <span>사진 · 동영상 게시글</span>
              <button
                type="button"
                className="shorts-modal-close"
                onClick={closeShortsDetail}
              >
                ✕
              </button>
            </div>

            <div className="shorts-modal-body">
              <div className="shorts-modal-media">
                {shortsModalPost.mediaType === "image" ? (
                  <img
                    src={shortsModalPost.mediaUrl}
                    alt={shortsModalPost.title}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : (
                  <video
                    src={shortsModalPost.mediaUrl}
                    controls
                    autoPlay
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
              </div>

              <div className="shorts-modal-right">
                <div className="shorts-modal-main">
                  <h2 className="shorts-modal-title">
                    {shortsModalPost.title}
                  </h2>
                  <p className="shorts-modal-author">
                    {shortsModalPost.author}
                  </p>
                  <p className="shorts-modal-content">
                    {shortsModalPost.content}
                  </p>

                  <div className="shorts-modal-stats">
                    <button
                      type="button"
                      className={`like-btn ${
                        shortsModalPost.liked ? "liked" : ""
                      }`}
                      onClick={() => handleShortsLike(shortsModalPost.id)}
                    >
                      ❤️ {shortsModalPost.likeCount ?? 0}
                    </button>
                    <span>👁 {shortsModalPost.viewCount ?? 0}</span>
                    <span>
                      💬 {getCommentsCount(shortsModalPost)}
                    </span>
                  </div>
                </div>

                <div className="shorts-modal-comment-input">
                  <input
                    type="text"
                    placeholder="댓글을 입력하세요."
                    value={shortsNewComment}
                    onChange={(e) => setShortsNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleShortsAddComment();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleShortsAddComment}
                  >
                    등록
                  </button>
                </div>

                <div className="shorts-modal-comments">
                  {getCommentsCount(shortsModalPost) === 0 ? (
                    <p className="comment-empty">
                      첫 댓글을 달아보세요.
                    </p>
                  ) : (
                    (shortsModalPost.comments ?? []).map((c) => (
                      <div key={c.id} className="comment-item">
                        <span className="comment-author">
                          {c.author}
                        </span>
                        <span className="comment-content">
                          {c.content}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> Stashed changes
    </div>
  );
};

export default MainPage;
