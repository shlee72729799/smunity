// src/pages/DetailPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  createCommunityPost,
  fetchCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
} from '../api/client';
import {
  addLocalBoardPost,
  deleteLocalBoardPost,
  findLocalBoardPost,
  updateLocalBoardPost,
} from '../utils/boardStorage';
import '../styles/DetailPage.css';
import { boardConfigs } from '../data/boardData';

const DetailPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const categories = {
    community: [
      { name: '자유게시판', count: 16, slug: 'free' },
      { name: '익게1', count: 13, slug: 'anonymous1' },
      { name: '익게2', count: 298, slug: 'anonymous2' },
      { name: '연애상담소', count: 13, slug: 'romance' },
      { name: '졸업생', count: 4, slug: 'alumni' },
      { name: '냉동실', count: 4, slug: 'freezer' },
      { name: '정치', count: 11, slug: 'politics' },
      { name: '주식/투자', count: 1, slug: 'stocks' },
      { name: '맛집', count: 1, slug: 'food' },
      { name: '헬스', count: 1, slug: 'health' },
      { name: '총학생회', count: 0, slug: 'studentCouncil' },
      { name: '회원문의/탈퇴', count: 0, slug: 'membership' },
    ],
    career: [
      { name: '모집공고', count: 11, slug: 'recruit' },
      { name: '취업게시판', count: 32, slug: 'job' },
      { name: 'CPA/세무사', count: 9, slug: 'cpa' },
      { name: '로스쿨', count: 0, slug: 'lawschool' },
      { name: '고시/전문직', count: 0, slug: 'exam' },
      { name: '일반대학원', count: 1, slug: 'grad' },
    ],
    life: [
      { name: '벼룩시장', count: 1, slug: 'flea' },
      { name: '연재/칼럼', count: 0, slug: 'serial' },
      { name: '제휴병원', count: 0, slug: 'hospital' },
      { name: '상명학보', count: 0, slug: 'sangmyungNews' },
      { name: '인터넷 가입', count: 0, slug: 'internet' },
      { name: '휴대폰 상담', count: 0, slug: 'mobile' },
    ],
    genealogy: [
      { name: '강의평가', count: 0 },
    ],
  };

  const { id } = useParams();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const boardType = location.state?.boardType || searchParams.get('board') || null;
  const localPostId = location.state?.localId || searchParams.get('localId') || null;
  const statePost = location.state?.post;
  const initialLocalPost = useMemo(() => {
    if (!boardType || !localPostId) return null;
    if (statePost?.localId === localPostId) return statePost;
    return findLocalBoardPost(boardType, localPostId);
  }, [boardType, localPostId, statePost]);
  const staticPost = initialLocalPost ? null : statePost;
  const isLocalPost = Boolean(initialLocalPost);
  const isStatic = Boolean(staticPost);
  const isNew = useMemo(() => !isStatic && !isLocalPost && (!id || id === 'new'), [id, isStatic, isLocalPost]);
  const boardConfig = boardType ? boardConfigs[boardType] : null;
  const isLocalBoardTarget = useMemo(() => Boolean(boardConfig && !boardConfig.fetchCommunity), [boardConfig]);
  const boardLabel = boardType ? (boardConfig?.title ?? boardType) : null;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: initialLocalPost?.title ?? staticPost?.title ?? '',
    content: initialLocalPost?.content ?? staticPost?.content ?? '',
    name: initialLocalPost?.name ?? staticPost?.name ?? '',
  });
  const [anon, setAnon] = useState(
    (initialLocalPost?.name ?? staticPost?.name ?? '') === '익명'
  );
  const [loadedPost, setLoadedPost] = useState(initialLocalPost ?? staticPost ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(
    !(initialLocalPost || isLocalBoardTarget || isStatic || isNew)
  );
  const [saving, setSaving] = useState(false);

  const rulesText = `스뮤니티는 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다.\n\n아래는 이 게시판에 해당하는 핵심 내용의 요약 사항이며, 게시물 작성 전 커뮤니티 이용규칙 전문을 반드시 확인하시기 바랍니다.\n\n※ 정치·사회 관련 행위 금지\n- 국가기관, 정치 관련 단체, 언론, 신문·인터넷매체에 대한 언급 혹은 이와 관련한 행위\n- 정책·외교 또는 정치·정쟁에 대한 의견, 주장 및 이념, 가치관을 드러내는 행위\n- 성별, 종교, 인종, 출신, 지역, 직업, 이름 등 사회적 이슈에 대한 언급 혹은 이와 관련한 행위\n- 위와 같은 내용으로 유추될 수 있는 비유, 은어 사용 행위\n* 해당 게시물은 시사·이슈 게시판에만 작성 가능합니다.\n\n※ 홍보 및 판매 관련 행위 금지\n- 업과 여부와 관계 없이 사회·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위\n- 위와 관련된 것으로 의심되거나 예상될 수 있는 바이럴 홍보 및 명칭·단어 언급 행위\n* 해당 게시물은 홍보게시판에만 작성 가능합니다.\n\n※ 불법촬영물 유통 금지 및 그 밖의 규칙 위반 금지`;

  // 기존 글 불러오기 (조회/수정)
  useEffect(() => {
    if (initialLocalPost) {
      setLoadedPost(initialLocalPost);
      setForm({
        title: initialLocalPost?.title ?? '',
        content: initialLocalPost?.content ?? '',
        name: initialLocalPost?.name ?? '',
      });
      setAnon((initialLocalPost?.name ?? '') === '익명');
      setLoading(false);
      return;
    }
    if (isLocalBoardTarget && localPostId) {
      const local = findLocalBoardPost(boardType, localPostId);
      if (local) {
        setLoadedPost(local);
        setForm({
          title: local?.title ?? '',
          content: local?.content ?? '',
          name: local?.name ?? '',
        });
        setAnon((local?.name ?? '') === '익명');
      } else {
        alert('게시글을 찾을 수 없습니다.');
        navigate(boardType ? `/board/${boardType}` : '/');
      }
      setLoading(false);
      return;
    }
    if (isStatic) {
      setLoadedPost(staticPost);
      setLoading(false);
      setIsEditing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      if (isNew) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchCommunityPost(id);
        if (cancelled) return;
        setLoadedPost(data);
        setForm({
          title: data?.title ?? '',
          content: data?.content ?? '',
          name: data?.name ?? '',
        });
        setAnon((data?.name ?? '') === '익명');
      } catch (err) {
        alert(`글을 불러오지 못했습니다: ${err.message || err}`);
        navigate('/');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [boardType, id, initialLocalPost, isLocalBoardTarget, isNew, isStatic, localPostId, navigate, staticPost]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onAnonToggle = (e) => {
    const checked = e.target.checked;
    setAnon(checked);
    setForm((prev) => ({ ...prev, name: checked ? '익명' : '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Swagger API에 맞게 payload 구성
    const payload = {
      title: form.title?.trim(),
      content: form.content?.trim(),
    };
    
    // name 필드가 있고 비어있지 않으면 추가 (Swagger가 요구하는 경우)
    const nameValue = form.name?.trim() || (anon ? '익명' : '');
    if (nameValue) {
      payload.name = nameValue;
    }

    if (!payload.title || !payload.content) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }

    if (isLocalBoardTarget) {
      if (localPostId) {
        const updated = updateLocalBoardPost(boardType, localPostId, {
          ...payload,
        });
        setLoadedPost(updated);
        setIsEditing(false);
        alert('수정 완료');
      } else {
        addLocalBoardPost(boardType, {
          ...payload,
          comments: 0,
        });
        navigate(`/board/${boardType}`);
      }
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        const created = await createCommunityPost(payload);
        // 응답에 id가 있으면 상세로, 없으면 목록으로
        if (created?.id) navigate(`/detail/${created.id}`);
        else navigate('/');
      } else {
        await updateCommunityPost(id, payload);
        setLoadedPost({ ...(loadedPost || {}), ...payload });
        setIsEditing(false);
        alert('수정 완료');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert(`저장 실패: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (saving) return;
    if (!confirm('정말 삭제하시겠어요?')) return;
    if (isLocalBoardTarget && localPostId) {
      deleteLocalBoardPost(boardType, localPostId);
      navigate(`/board/${boardType}`);
      return;
    }
    try {
      setSaving(true);
      await deleteCommunityPost(id);
      navigate('/');
    } catch (err) {
      alert(`삭제 실패: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="post-loading">로딩중…</div>;
  }

  if (isStatic && !loadedPost) {
    return <div className="post-loading">게시글 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="detail-page">
      <header className="detail-header">
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
          <div className="user-links">
            {!isLoggedIn ? (
              <Link to="/login">로그인</Link>
            ) : (
              <>
                <a href="#mypage">내 페이지</a>
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>로그아웃</a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="detail-banner">
        <span>새내기를 위한 안내문 - SM Connect</span>
      </div>

      <div className="detail-content">
        <aside className="sidebar">
          <div className="category-section">
            <h4>커뮤니티</h4>
            <ul className="category-list">
              {categories.community.map((item, index) => (
                <li key={index}>
                  <span>{item.name}</span>
                  {item.count > 0 && <span className="count">+{item.count}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="category-section">
            <h4>커리어</h4>
            <ul className="category-list">
              {categories.career.map((item, index) => (
                <li key={index}>
                  <span>{item.name}</span>
                  {item.count > 0 && <span className="count">+{item.count}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="category-section">
            <h4>생활</h4>
            <ul className="category-list">
              {categories.life.map((item, index) => (
                <li key={index}>
                  <span>{item.name}</span>
                  {item.count > 0 && <span className="count">+{item.count}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="category-section">
            <h4>족보실</h4>
            <ul className="category-list">
              {categories.genealogy.map((item, index) => (
                <li key={index}>
                  <span>{item.name}</span>
                  {item.count > 0 && <span className="count">+{item.count}</span>}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="post-detail">
          {isNew && (
            <>
              {isLocalBoardTarget && boardLabel && (
                <div className="board-context-banner">
                  <strong>{boardLabel}</strong> 게시판에 글을 작성하고 있어요.
                </div>
              )}
              <form className="editor" onSubmit={onSubmit}>
                <input
                  className="editor-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={onChange}
                  placeholder="글 제목"
                  required
                />
                <div className="editor-area">
                  {form.content.length === 0 && (
                    <pre className="editor-placeholder">{rulesText}</pre>
                  )}
                  <textarea
                    className="editor-textarea"
                    name="content"
                    value={form.content}
                    onChange={onChange}
                    placeholder=""
                    required
                  />
                </div>
                <div className="editor-footer">
                  <label className="editor-check">
                    <input type="checkbox" checked={anon} onChange={onAnonToggle} />
                    <span>익명</span>
                  </label>
                  {!anon && (
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="작성자 이름"
                      style={{ padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                    />
                  )}
                  <button type="submit" className="editor-submit" disabled={saving} aria-label="글작성">
                    {saving ? '...' : '✏️'}
                  </button>
                </div>
              </form>

              {/* 새 글 작성할 때만 커뮤니티 운영 원칙 표시 */}
              <div className="post-body">
                <h3>커뮤니티 운영 원칙</h3>
                <p>
                  저희는 따뜻한 소통과 정보교류를 목표로 합니다. 
                  건전한 토론은 환영하지만, 키보드 배틀이나 소모적인 논쟁은 지양해주세요.
                  위 방향에 맞지 않는 글을 작성하는 사용자는 글쓰기 권한이 제한될 수 있습니다.
                </p>

                <h2>&lt;&lt; 게시판 금지 사항 10가지 &gt;&gt;</h2>
                <ol>
                  <li>상대 회원에게 욕설</li>
                  <li>남녀분란 - 성별 갈등을 유발하거나 특정 커뮤니티 성향을 드러내는 글</li>
                  <li>정치 - 특정 정치인/정당을 비판하거나 지지하는 글</li>
                  <li>기타 운영 규칙에 위배되는 행위</li>
                </ol>

                <p className="post-footer">즐거운 대학생활 되세요! 🎓</p>
              </div>
            </>
          )}

          {!isNew && loadedPost && !isEditing && (
            <div className="post-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <h1 style={{ marginTop: 0, flex: 1 }}>{loadedPost.title}</h1>
                {!isStatic && (
                  <>
                    <button type="button" className="editor-submit" onClick={() => setIsEditing(true)}>
                      수정
                    </button>
                    <button type="button" className="editor-submit" onClick={onDelete}>
                      삭제
                    </button>
                  </>
                )}
              </div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{loadedPost.content}</p>
            </div>
          )}

          {!isNew && isEditing && (
            <form className="editor" onSubmit={onSubmit}>
              <input
                className="editor-title"
                name="title"
                type="text"
                value={form.title}
                onChange={onChange}
                required
              />
              <div className="editor-area">
                <textarea
                  className="editor-textarea"
                  name="content"
                  value={form.content}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="editor-footer">
                <label className="editor-check">
                  <input type="checkbox" checked={anon} onChange={onAnonToggle} />
                  <span>익명</span>
                </label>
                {!anon && (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="작성자 이름"
                    style={{ padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                  />
                )}
                <button type="button" className="editor-submit" onClick={() => setIsEditing(false)}>
                  취소
                </button>
                <button type="submit" className="editor-submit" disabled={saving}>
                  {saving ? '...' : '저장'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default DetailPage;
