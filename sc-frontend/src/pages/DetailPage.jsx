import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    createCommunityPost,
    fetchCommunityPost,
    updateCommunityPost,
    deleteCommunityPost,
} from '../api/client';
import '../styles/DetailPage.css';

const DetailPage = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    // id가 없거나 'new'이면 새 글 작성 모드
    const isNew = useMemo(() => !id || id === 'new', [id]);

    const [form, setForm] = useState({ title: '', content: '', name: '' });
    const [anon, setAnon] = useState(false);
    const [loadedPost, setLoadedPost] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // 카테고리 데이터 (사이드바용)
    const categories = {
        community: [
            { name: '자유게시판', count: 16 },
            { name: '익게1', count: 13 },
            { name: '익게2', count: 298 },
            { name: '연애상담소', count: 13 },
            { name: '졸업생', count: 4 },
            { name: '냉동실', count: 4 },
            { name: '정치', count: 11 },
            { name: '주식/투자', count: 1 },
            { name: '맛집', count: 1 },
            { name: '헬스', count: 1 },
            { name: '총학생회', count: 0 },
            { name: '회원문의/탈퇴', count: 0 },
        ],
        career: [
            { name: '모집공고', count: 11 },
            { name: '취업게시판', count: 32 },
            { name: 'CPA/세무사', count: 9 },
            { name: '로스쿨', count: 0 },
            { name: '고시/전문직', count: 0 },
            { name: '일반대학원', count: 1 },
        ],
        life: [
            { name: '벼룩시장', count: 1 },
            { name: '연재/칼럼', count: 0 },
            { name: '제휴병원', count: 0 },
            { name: '서강학보', count: 0 },
            { name: '인터넷 가입', count: 0 },
            { name: '휴대폰 상담', count: 0 },
        ],
        genealogy: [
            { name: '강의평가', count: 0 },
        ],
    };

    const rulesText = `sm-connect은 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다.\n\n아래는 이 게시판에 해당하는 핵심 내용의 요약 사항이며, 게시물 작성 전 커뮤니티 이용규칙 전문을 반드시 확인하시기 바랍니다.`;

    // [핵심] 게시글 데이터 불러오기 & 인증 체크
    useEffect(() => {
        let cancelled = false;

        (async () => {
            // 1. 토큰이 없는지 먼저 검사 (로그아웃 상태)
            const token = localStorage.getItem('token');

            // 새 글이거나, 수정 모드일 때 토큰이 없으면 쫓아냄
            if (!token) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
                return; // 아래 로직 실행 안 되게 종료
            }
            // 새 글 작성 모드일 때도 로그인이 안 되어 있으면 튕겨내기
            if (isNew) {
                if (!localStorage.getItem('token')) {
                    alert('로그인 후 글을 작성할 수 있습니다.');
                    navigate('/login');
                }
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // 백엔드에서 글 데이터 조회 (헤더에 토큰 포함됨)
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
                if (cancelled) return;

                // ★ 인증 에러 처리 (client.js에서 던진 에러 메시지 확인)
                if (err.message === '로그인이 필요합니다.' || err.message.includes('403') || err.message.includes('401')) {
                    alert('로그인 후 이용 가능합니다.');
                    navigate('/login'); // 로그인 페이지로 이동
                    return;
                }

                alert(`글을 불러오지 못했습니다: ${err.message || err}`);
                navigate('/');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [id, isNew, navigate]);

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

        const payload = {
            title: form.title?.trim(),
            content: form.content?.trim(),
        };

        const nameValue = form.name?.trim() || (anon ? '익명' : '');
        if (nameValue) {
            payload.name = nameValue;
        }

        if (!payload.title || !payload.content) {
            alert('제목과 내용을 입력해 주세요.');
            return;
        }

        try {
            setSaving(true);
            if (isNew) {
                const created = await createCommunityPost(payload);
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
            if (err.message === '로그인이 필요합니다.') {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert(`저장 실패: ${err.message || err}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (saving) return;
        if (!confirm('정말 삭제하시겠어요?')) return;
        try {
            setSaving(true);
            await deleteCommunityPost(id);
            navigate('/');
        } catch (err) {
            if (err.message === '로그인이 필요합니다.') {
                alert('로그인이 필요합니다.');
                navigate('/login');
            } else {
                alert(`삭제 실패: ${err.message || err}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="post-loading">로딩중…</div>;
    }

    return (
        <div className="detail-page">
            <header className="detail-header">
                <div className="header-content">
                    <Link to="/" className="logo">sm-connect</Link>
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
                    {Object.keys(categories).map((key) => (
                        <div className="category-section" key={key}>
                            <h4>{key === 'community' ? '커뮤니티' : key === 'career' ? '커리어' : key === 'life' ? '생활' : '족보실'}</h4>
                            <ul className="category-list">
                                {categories[key].map((item, index) => (
                                    <li key={index}>
                                        <span>{item.name}</span>
                                        {item.count > 0 && <span className="count">+{item.count}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </aside>

                <main className="post-detail">
                    {isNew && (
                        <>
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
                                    <button type="submit" className="editor-submit" disabled={saving}>
                                        {saving ? '...' : '✏️'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {!isNew && loadedPost && !isEditing && (
                        <div className="post-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <h1 style={{ marginTop: 0, flex: 1 }}>{loadedPost.title}</h1>
                                {/* 본인 글일 때만 수정/삭제 버튼이 보이게 하려면 추가 로직 필요 (백엔드에서 작성자 ID 받아와서 비교) */}
                                <button type="button" className="editor-submit" onClick={() => setIsEditing(true)}>
                                    수정
                                </button>
                                <button type="button" className="editor-submit" onClick={onDelete}>
                                    삭제
                                </button>
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