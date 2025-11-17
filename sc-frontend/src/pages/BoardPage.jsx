import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCommunityList } from '../api/client';
import {
  boardConfigs,
  defaultStaticContent,
  popularPosts,
  anonymousBoard1,
  anonymousBoard2,
  jobBoardPosts,
} from '../data/boardData';
import { BOARD_EVENT, getLocalBoardPosts } from '../utils/boardStorage';
import '../styles/CommunityPage.css';

const hotBoards = [
  { title: '경정대 이걸 안 해?!??!?!', comments: 22 },
  { title: '2025 트레이드 정기공연', comments: 16 },
  { title: '스뭉이 본체 발견', comments: 9 },
];

const bestBoards = [
  { title: '학교 소식', comments: 3 },
  { title: '융합공대 학부생 테크 E-sports 대회 결과', comments: 5 },
  { title: '상명대학교 교육방송 SMBs 제50호 지향방송실 시청', comments: 4 },
];

const getSidebarData = (type) => {
  switch (type) {
    case 'popular':
      return { hot: popularPosts, best: jobBoardPosts };
    case 'anonymous1':
      return { hot: anonymousBoard1, best: bestBoards };
    case 'anonymous2':
      return { hot: anonymousBoard2, best: bestBoards };
    default:
      return { hot: hotBoards, best: bestBoards };
  }
};

const BoardPage = ({ typeOverride }) => {
  const params = useParams();
  const location = useLocation();
  const routeType = params.type;
  const resolvedType = typeOverride || routeType || 'free';
  const config = boardConfigs[resolvedType];
  const { hot, best } = getSidebarData(resolvedType);

  const { isLoggedIn, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [localPosts, setLocalPosts] = useState(() => getLocalBoardPosts(resolvedType));
  const [loading, setLoading] = useState(config?.fetchCommunity ?? false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalPosts(getLocalBoardPosts(resolvedType));
  }, [resolvedType, location.key]);

  useEffect(() => {
    const handler = (event) => {
      if (!event?.detail?.boardType || event.detail.boardType === resolvedType) {
        setLocalPosts(getLocalBoardPosts(resolvedType));
      }
    };
    window.addEventListener(BOARD_EVENT, handler);
    return () => window.removeEventListener(BOARD_EVENT, handler);
  }, [resolvedType]);

  useEffect(() => {
    if (!config?.fetchCommunity) {
      setPosts(config?.staticPosts ?? []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    fetchCommunityList()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setPosts(list);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || '목록을 불러오지 못했습니다.');
        setPosts(config?.staticPosts ?? []);
      })
      .finally(() => setLoading(false));
  }, [config]);

  const buildLinkProps = (post) => {
    if (post.id) {
      return { to: `/detail/${post.id}` };
    }
    const targetBoard = post.boardType || resolvedType;
    const params = new URLSearchParams();
    if (targetBoard) params.set('board', targetBoard);
    if (post.localId) params.set('localId', post.localId);

    return {
      to: `/detail${params.toString() ? `?${params.toString()}` : ''}`,
      state: {
        post: {
          ...post,
          boardType: targetBoard,
          content: post.content || defaultStaticContent,
        },
        boardType: targetBoard,
        localId: post.localId,
      },
    };
  };

  const displayPosts = useMemo(() => {
    if (!config) return [];
    const staticPosts = config.staticPosts ?? [];
    if (!config.fetchCommunity) return [...localPosts, ...staticPosts];

    if (!posts || posts.length === 0) {
      return [...localPosts, ...staticPosts];
    }

    const seenTitles = new Set(posts.map((p) => p.title));
    const extraStatics = staticPosts.filter((p) => !seenTitles.has(p.title));
    return [...localPosts, ...posts, ...extraStatics];
  }, [config, posts, localPosts]);

  if (!config) {
    return (
      <div className="community-page">
        <header className="community-header">
          <div className="header-content">
            <Link to="/" className="logo">스뮤니티</Link>
          </div>
        </header>
        <div className="community-body">
          <div className="post-state error" style={{ width: '100%' }}>요청하신 게시판을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <header className="community-header">
        <div className="header-content">
          <Link to="/" className="logo">스뮤니티</Link>
          <nav className="main-nav">
            <a href="#community">커뮤니티</a>
            <a href="#career">커리어</a>
            <a href="#life">생활</a>
            <a href="#genealogy">족보실</a>
            <a href="#all">전체글</a>
            <a href="#popular">인기글</a>
          </nav>
          <div className="auth-links">
            {!isLoggedIn ? (
              <>
                <Link to="/register">회원가입</Link>
                <Link to="/login">로그인</Link>
              </>
            ) : (
              <>
                <a href="#mypage">내 페이지</a>
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>로그아웃</a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="community-tabs">
        <button type="button" className="tab-item active">{config.title}</button>
        <Link className="tab-item" to="/">메인으로</Link>
        <Link className="tab-item" to="/board/free">자유게시판</Link>
        <Link className="tab-item" to="/board/popular">오늘의 인기글</Link>
      </div>

      <div className="community-body">
        <section className="community-main">
          <div className="write-card">
            <span>{config.description}</span>
            <Link
              to="/detail/new"
              state={{ boardType: resolvedType }}
              className="write-action"
            >
              글쓰기
            </Link>
          </div>

          <div className="post-list-card">
            <div className="post-list-header">
              <h2>{config.title}</h2>
              <span>{displayPosts.length}개의 글</span>
            </div>

            {loading ? (
              <div className="post-state">불러오는 중...</div>
            ) : (
              <>
                {error && <div className="post-state error">{error}</div>}
                <ul className="community-post-list">
                  {displayPosts.map((post, index) => (
                    <li key={post.id ?? post.localId ?? `${resolvedType}-${index}`}>
                      <Link {...buildLinkProps(post)} className="community-post-item">
                        <div>
                          <span className="community-post-title">{post.title}</span>
                          {post.comments > 0 && (
                            <span className="community-post-comments">[{post.comments}]</span>
                          )}
                        </div>
                        <div className="community-post-meta">
                          <span>{post.name || '익명'}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        <aside className="community-sidebar">
          <div className="sidebar-widget">
            <h3>실시간 인기 글</h3>
            <ul>
              {hot.map((item, idx) => (
                <li key={`hot-${idx}`}>
                  <Link {...buildLinkProps(item)}>{item.title}</Link>
                  {item.comments != null && <span className="count">+{item.comments}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-widget">
            <h3>HOT 게시물</h3>
            <ul>
              {hotBoards.map((item, idx) => (
                <li key={`hot2-${idx}`}>
                  <Link {...buildLinkProps(item)}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-widget">
            <h3>BEST 게시판</h3>
            <ul>
              {best.map((item, idx) => (
                <li key={`best-${idx}`}>
                  <span>{item.title}</span>
                  {item.comments != null && <span className="count">+{item.comments}</span>}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BoardPage;

