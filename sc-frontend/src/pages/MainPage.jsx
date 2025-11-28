import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/MainPage.css'
import { fetchCommunityList } from '../api/client'

const MainPage = () => {
    const { isLoggedIn, logout } = useAuth()
    const navigate = useNavigate()

    // [상태 관리] 서버에서 가져온 게시글 목록
    const [communityPosts, setCommunityPosts] = useState([])

    // [핵심] 게시글 목록 불러오기 (로그인 체크 로직 포함)
    useEffect(() => {
        fetchCommunityList()
            .then((data) => {
                // 데이터가 배열이면 그대로, 아니면 data 필드 확인, 없으면 빈 배열
                setCommunityPosts(Array.isArray(data) ? data : (data?.data ?? []))
            })
            .catch((err) => {
                // 에러 발생 시 처리
                if (err.message === '로그인이 필요합니다.') {
                    // 로그인이 안 된 상태라면, 게시글 목록을 비워둡니다.
                    // (메인 페이지에서 굳이 에러 창을 띄우지 않기 위함)
                    setCommunityPosts([]);
                } else {
                    console.error("게시글 로딩 실패:", err);
                }
            })
    }, [])

    // --- 아래는 UI 구성을 위한 더미 데이터들입니다 ---

    const popularPosts = [
        { title: '스뭉이 본체 발견', comments: 27 },
        { title: '공학관 또 맷돼지 출현', comments: 9 },
        { title: '상명대 앞 지하철역 건설 계획..', comments: 37 },
        { title: '상명대 언덕밑 엘레베이터 설치 계획..', comments: 14 },
    ]

    const freeBoardSeeds = [
        { title: '객프 진짜 꿀과목 ㅇㅈ?', comments: 1 },
        { title: '[기념품샵] 이월 돕바 상품 떨이합니다~♥', comments: 1 },
        { title: '이번주 주말 개꿀 대외활동 할 사람?', comments: 6 },
    ]

    const anonymous1 = [
        { title: '성적조회를 위한 ...', comments: 0 },
        { title: '집이 회사랑 멀면 자취밖에 답이 없나요', comments: 3 },
    ]

    const anonymous2 = [
        { title: '공대과목이 학년올라갈수록 빡세지는 이유가', comments: 0 },
        { title: '순자산 3억 달성', comments: 7 },
        { title: '막스 베버 책 읽다가 빨갱이로 몰린 사람', comments: 0 },
    ]

    const jobBoard = [
        { title: '카카오 현직자 계신가요? 질문드리고싶은...', comments: 1 },
        { title: '네이버페이 면접준비하려고 하는데 직무면접 대...', comments: 3 },
        { title: '취업 관련해 문의드립니다.', comments: 0 },
    ]

    const recruitment = [
        { title: '[모집] 종로구청장 공약이행 점검 주민배심...', comments: 0 },
        { title: '[창업지원단] 정기창업간담회 "런치톡" 4, 5...', comments: 0 },
        { title: '이번주 주말 개꿀 대외활동 할 사람?!', comments: 1 },
    ]

    // 게시판 섹션 컴포넌트
    const BoardSection = ({ title, icon, iconText, posts, children }) => {

        // 더보기 클릭 시 실행될 함수
        const handleMoreClick = (e) => {
            if (!isLoggedIn) {
                e.preventDefault(); // 1. 원래 이동하려는 동작을 막음
                alert("로그인 후 이용 가능합니다."); // 2. 알림 띄움
                navigate('/login'); // 3. 로그인 페이지로 보냄
            }
        }

        return (
            <div className="board-section">
                <div className="board-header">
                    <span className="board-icon">{iconText}</span>
                    <h3>{title}</h3>

                    {/* onClick 이벤트를 연결 */}
                    <Link to="/detail" className="more-link" onClick={handleMoreClick}>
                        + 더보기
                    </Link>
                </div>
                <ul className="post-list">
                    {posts && posts.map((post, index) => (
                        <li
                            key={`static-${index}`}
                            onClick={() => alert("이 글은 예시(Dummy) 데이터입니다.")}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="post-title">{post.title}</span>
                            {post.comments > 0 && <span className="comment-count">[{post.comments}]</span>}
                        </li>
                    ))}
                    {children}
                </ul>
            </div>
        )
    }

    return (
        <div className="main-page">
            <header className="main-header">
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

            <div className="banner">
                따뜻한 SM Connect
                {/* 로그인한 사람(isLoggedIn)에게만 버튼 보여주기 */}
                {isLoggedIn && (
                    <Link to="/detail" className="write-button">글작성</Link>
                )}
            </div>

            <div className="main-content">
                <div className="content-grid">
                    <BoardSection
                        title="오늘의 인기글"
                        icon="👍"
                        iconText="👍"
                        posts={popularPosts}
                    />

                    <div className="board-section">
                        <div className="board-header">
                            <span className="board-icon">💬</span>
                            <h3>자유게시판</h3>
                            <Link to="/detail" className="more-link">+ 더보기</Link>
                        </div>
                        <ul className="post-list">
                            {/* 더미 데이터 */}
                            {freeBoardSeeds.map((post, index) => (
                                <li key={`seed-${index}`}>
                                    <span className="post-title">{post.title}</span>
                                    {post.comments > 0 && <span className="comment-count">[{post.comments}]</span>}
                                </li>
                            ))}

                            {/* 실제 서버 데이터 (로그인 시에만 보임) */}
                            {communityPosts.map((p) => (
                                <li key={p.id}>
                                    <Link className="post-title" to={`/detail/${p.id}`}>
                                        {p.title}
                                    </Link>
                                </li>
                            ))}

                            {/* 로그인이 안 된 경우 안내 문구 (선택사항) */}
                            {!isLoggedIn && (
                                <li style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>
                                    로그인하면 더 많은 글을 볼 수 있어요 🔒
                                </li>
                            )}
                        </ul>
                    </div>

                    <BoardSection
                        title="익게1"
                        icon="👤"
                        iconText="👤"
                        posts={anonymous1}
                    />
                    <BoardSection
                        title="익게2"
                        icon="💬"
                        iconText="💬"
                        posts={anonymous2}
                    />
                    <BoardSection
                        title="취업게시판"
                        icon="💼"
                        iconText="💼"
                        posts={jobBoard}
                    />
                    <BoardSection
                        title="모집공고"
                        icon="📢"
                        iconText="📢"
                        posts={recruitment}
                    />
                </div>
            </div>

            <footer className="main-footer">
                <a href="#mypage">내페이지</a>
                <a href="#schedule">학사일정</a>
                <a href="#notice">학교공지</a>
                <a href="#reading">열람실</a>
                <a href="#cafeteria">학식</a>
            </footer>
        </div>
    )
}

export default MainPage