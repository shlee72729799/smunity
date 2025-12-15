<<<<<<< Updated upstream
// src/pages/MyInfoPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { fetchMyPosts, fetchMyComments } from "../api/client";
import "../styles/MyInfoPage.css";

function MyInfoPage() {
  const { isLoggedIn, logout } = useAuth();

  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [postsRes, commentsRes] = await Promise.all([
          fetchMyPosts(),
          fetchMyComments(),
        ]);

        setMyPosts(postsRes || []);
        setMyComments(commentsRes || []);
      } catch (err) {
        console.error(err);
        setError("내 정보(작성글/댓글)를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoggedIn]);

  return (
    <div className="main-page myinfo-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <main className="myinfo-container">
        <h1 className="myinfo-title">내 정보</h1>

        {/* 에러 메시지 */}
        {error && <div className="myinfo-error">{error}</div>}

        {/* 계정 정보 카드 */}
        <section className="myinfo-card myinfo-account-card">
          <div className="myinfo-row">
            <span className="myinfo-label">계정</span>
            <span className="myinfo-value">
              이름 정보 없음 | 학과 정보 없음 | 학번 정보 없음
            </span>
          </div>
          <div className="myinfo-row">
            <span className="myinfo-label">아이디</span>
            <span className="myinfo-value">아이디 정보 없음</span>
          </div>
          <div className="myinfo-row myinfo-row-password">
            <span className="myinfo-label">비밀번호 변경</span>
            <div className="myinfo-password-area">
              <span className="myinfo-value">************</span>
              <button type="button" className="myinfo-btn-outline">
                변경
              </button>
            </div>
          </div>
          {/* ➕ 신규: 이메일 행 */}
          <div className="myinfo-row">
            <span className="myinfo-label">E-mail</span>
            <span className="myinfo-value">이메일 정보 없음</span>
          </div>
        </section>

        {/* 로딩 중이면 밑 카드들 대신 간단 표시 */}
        {loading ? (
          <p style={{ color: "#e5e7eb", fontSize: 14 }}>불러오는 중...</p>
        ) : (
          <>
            {/* 작성글 관리 카드 */}
            <section className="myinfo-card">
              <div className="myinfo-card-header">
                <h2 className="myinfo-card-title">작성글 관리</h2>
                <span className="myinfo-card-count">
                  {myPosts.length}개
                </span>
              </div>

              <ul className="myinfo-list">
                {myPosts.length === 0 && (
                  <li className="myinfo-empty">작성한 글이 없습니다.</li>
                )}

                {myPosts.map((post) => (
                  <li key={post.id} className="myinfo-list-item">
                    {/* 제목만 표시 + 클릭 시 해당 게시글로 이동 */}
                    <Link
                      to={`/detail/${post.id}`}
                      className="myinfo-item-main"
                    >
                      <span className="myinfo-item-title">
                        {post.title || "(제목 없음)"}
                      </span>
                    </Link>
                    <button type="button" className="myinfo-delete-btn">
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* 댓글 관리 카드 */}
            <section className="myinfo-card">
              <div className="myinfo-card-header">
                <h2 className="myinfo-card-title">댓글 관리</h2>
                <span className="myinfo-card-count">
                  {myComments.length}개
                </span>
              </div>

              <ul className="myinfo-list">
                {myComments.length === 0 && (
                  <li className="myinfo-empty">작성한 댓글이 없습니다.</li>
                )}

                {myComments.map((comment) => {
                  // 백엔드에서 어떤 형태로 줄지 몰라서 여러 경우 방어
                  const postId =
                    comment.postId ||
                    comment.post?.id ||
                    comment.id;
                  const postTitle =
                    comment.postTitle ||
                    comment.post?.title ||
                    comment.title ||
                    "(제목 없음)";

                  return (
                    <li key={comment.id ?? `${postId}-${postTitle}`} className="myinfo-list-item">
                      {/* 댓글이 달린 게시글 제목만 표시 + 클릭 시 게시글로 이동 */}
                      <Link
                        to={`/detail/${postId}`}
                        className="myinfo-item-main"
                      >
                        <span className="myinfo-item-title">{postTitle}</span>
                      </Link>
                      <button type="button" className="myinfo-delete-btn">
                        삭제
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default MyInfoPage;
=======
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

import {
    fetchMyPosts, fetchMyComments,
    deletePost, updateComment, deleteComment,
    updatePassword, deleteAccount
} from "../api/client";
import "../styles/MyInfoPage.css";

// 인라인 스타일 (비밀번호 입력창에 사용)
const inputStyle = { padding: '5px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', width: '150px' };

function MyInfoPage() {
    const { isLoggedIn, logout, user } = useAuth();
    const navigate = useNavigate();

    const [myPosts, setMyPosts] = useState([]);
    const [myComments, setMyComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 비밀번호 변경 상태
    const [pwMode, setPwMode] = useState(false);
    const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });


    // --- 초기화 및 데이터 로딩 ---

    // 1. 로그인 체크
    useEffect(() => {
        if (!isLoggedIn && !loading) navigate("/login");
    }, [isLoggedIn, loading, navigate]);

    // 2. 데이터 불러오기
    const loadData = async () => {
        if (!isLoggedIn) return;
        try {
            setLoading(true);
            setError("");
            const [postsRes, commentsRes] = await Promise.all([
                fetchMyPosts(),
                fetchMyComments(),
            ]);
            setMyPosts(postsRes || []);
            setMyComments(commentsRes || []);
        } catch (err) {
            console.error(err);
            setError("데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [isLoggedIn]);


    // --- 핸들러 함수들 ---

    // 1. 비밀번호 변경 핸들러
    const handlePwChange = async () => {
        if (pwForm.new !== pwForm.confirm) return alert("새 비밀번호가 일치하지 않습니다.");
        if (pwForm.new.length < 6) return alert("비밀번호는 6자 이상이어야 합니다.");

        try {
            await updatePassword(pwForm.current, pwForm.new);
            alert("비밀번호가 변경되었습니다. 보안을 위해 다시 로그인해주세요.");
            logout();
            navigate("/");
        } catch (e) {
            alert("비밀번호 변경 실패: " + (e.response?.data?.error || "오류"));
        }
    };

    // 게시글 수정 핸들러 (글쓰기 페이지로 이동하며 상태 전달)
    const handleEditPost = (post) => {
        const boardPath = post.boardCode ? post.boardCode.toLowerCase() : 'free';

        // NewPostPage로 이동하며 'edit' 모드와 게시글 ID를 state로 전달
        navigate(`/board/${boardPath}/new`, {
            state: {
                mode: 'edit',
                postId: post.id,
                boardCode: post.boardCode,
            }
        });
    };

    // 2. 게시글 삭제 핸들러
    const handleDeletePost = async (postId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deletePost(postId);
            setMyPosts(prev => prev.filter(p => p.id !== postId)); // 목록에서 즉시 제거
        } catch (e) {
            alert("삭제 실패: 본인의 글만 삭제할 수 있습니다.");
        }
    };

    // 3. 댓글 수정 핸들러 (상세 페이지로 이동)
    const handleEditComment = (comment) => {
        // 해당 댓글이 달린 게시글 상세 페이지로 이동
        navigate(`/detail/${comment.postId}`);
    };

    // 4. 댓글 삭제 핸들러 (상세 페이지로 이동)
    const handleDeleteComment = (comment) => {
        if (!window.confirm("댓글 삭제는 해당 게시글 상세 페이지에서 가능합니다. 이동하시겠습니까?")) return;
        // 상세 페이지로 이동
        navigate(`/detail/${comment.postId}`);
    };

    // 5. 회원 탈퇴 핸들러
    const handleDeleteAccount = async () => {
        if (!window.confirm("정말 탈퇴하시겠습니까? 모든 데이터가 영구 삭제됩니다.")) {
            return;
        }

        try {
            await deleteAccount();
            alert("회원 탈퇴가 완료되었습니다. 감사합니다.");
            logout(); // AuthContext 상태 초기화
            navigate("/");
        } catch (e) {
            alert("회원 탈퇴 실패: " + (e.response?.data?.error || "오류가 발생했습니다."));
        }
    };


    // --- UI 렌더링 ---
    return (
        <div className="main-page myinfo-page">
            <Header />
            <div className="banner-spacing" />

            <main className="myinfo-container">
                <h1 className="myinfo-title"> 내 정보</h1>

                {error && <div className="myinfo-error" style={{color: '#ff6b6b', marginBottom: '10px'}}>{error}</div>}

                {/* 계정 정보 카드 (유저 정보 표시) */}
                <section className="myinfo-card myinfo-account-card">

                    <div className="myinfo-row">
                        <span className="myinfo-label">계정</span>
                        <span className="myinfo-value">
              {user ? `${user.nickname} | 상명대학교 | ${user.username}` : "정보 없음"}
            </span>
                    </div>
                    <div className="myinfo-row">
                        <span className="myinfo-label">아이디</span>
                        <span className="myinfo-value">{user ? user.username : "정보 없음"}</span>
                    </div>

                    {/* 비밀번호 변경 UI */}
                    <div className="myinfo-row myinfo-row-password">
                        <span className="myinfo-label">비밀번호 변경</span>
                        <div className="myinfo-password-area">
                            {!pwMode ? (
                                <>
                                    <span className="myinfo-value">************</span>
                                    <button className="myinfo-btn-outline" onClick={() => setPwMode(true)}>변경</button>
                                </>
                            ) : (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end'}}>
                                    <input type="password" placeholder="현재 비밀번호" style={inputStyle}
                                           value={pwForm.current} onChange={e=>setPwForm({...pwForm, current: e.target.value})} />
                                    <input type="password" placeholder="새 비밀번호" style={inputStyle}
                                           value={pwForm.new} onChange={e=>setPwForm({...pwForm, new: e.target.value})} />
                                    <input type="password" placeholder="새 비밀번호 확인" style={inputStyle}
                                           value={pwForm.confirm} onChange={e=>setPwForm({...pwForm, confirm: e.target.value})} />
                                    <div>
                                        <button className="myinfo-btn-outline" onClick={handlePwChange} style={{marginRight:'5px'}}>확인</button>
                                        <button className="myinfo-btn-outline" onClick={() => setPwMode(false)} style={{borderColor:'#aaa', color:'#555'}}>취소</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="myinfo-row">
                        <span className="myinfo-label">E-mail</span>
                        <span className="myinfo-value">{user ? user.email : "정보 없음"}</span>
                    </div>

                    {/* 회원 탈퇴 버튼 */}
                    <div className="myinfo-row" style={{ marginTop: '20px' }}>
                        <span className="myinfo-label" style={{color: '#ff6b6b'}}>회원 탈퇴</span>
                        <button
                            className="myinfo-btn-outline"
                            style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
                            onClick={handleDeleteAccount}
                        >
                            탈퇴
                        </button>
                    </div>
                </section>

                {/* 로딩 중이면 표시 */}
                {loading ? (
                    <p style={{ color: "#fff", textAlign: "center", padding: "20px" }}>불러오는 중...</p>
                ) : (
                    <>
                        {/* 작성글 관리 섹션 */}
                        <section className="myinfo-card">
                            <div className="myinfo-card-header">
                                <h2 className="myinfo-card-title">작성글 관리</h2>
                                <span className="myinfo-card-count">{myPosts.length}개</span>
                            </div>
                            <ul className="myinfo-list">
                                {myPosts.length === 0 ? (
                                    <li className="myinfo-empty" style={{textAlign: 'center', color: '#999', padding: '10px 0'}}>
                                        작성한 글이 없습니다.
                                    </li>
                                ) : (
                                    myPosts.map((post) => (
                                        <li key={post.id} className="myinfo-list-item">
                                            <Link to={`/detail/${post.id}`} className="myinfo-item-main">
                                                <span className="myinfo-item-title">
                                                    <span style={{ fontWeight: "normal", color: "#666", marginRight: "6px" }}>
                                                      [{post.boardName}]
                                                    </span>
                                                    {post.title}
                                                </span>
                                                <span style={{ fontSize: "12px", color: "#888", marginLeft: "10px" }}>
                                                  {post.createdAt}
                                                </span>
                                            </Link>

                                            <div style={{display:'flex', gap:'5px', marginLeft:'10px'}}>
                                                <button className="myinfo-edit-btn" onClick={() => handleEditPost(post)}>수정</button>
                                                <button className="myinfo-delete-btn" onClick={() => handleDeletePost(post.id)}>삭제</button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>

                        {/* 댓글 관리 카드 */}
                        <section className="myinfo-card">
                            <div className="myinfo-card-header">
                                <h2 className="myinfo-card-title">댓글 관리</h2>
                                <span className="myinfo-card-count">{myComments.length}개</span>
                            </div>

                            <ul className="myinfo-list">
                                {myComments.length === 0 ? (
                                    <li className="myinfo-empty" style={{textAlign: 'center', color: '#999', padding: '10px 0'}}>
                                        작성한 댓글이 없습니다.
                                    </li>
                                ) : (
                                    myComments.map((comment) => (
                                        <li key={comment.id} className="myinfo-list-item">
                                            <Link to={`/detail/${comment.postId}`} className="myinfo-item-main">
                                                <span className="myinfo-item-title">
                                                  {comment.content}
                                                    <span style={{ fontSize: "12px", color: "#999", marginLeft: "6px" }}>
                                                    (글: {comment.postTitle})
                                                  </span>
                                                </span>
                                                <span style={{ fontSize: "12px", color: "#888", marginLeft: "10px" }}>
                                                  {comment.createdAt}
                                                </span>
                                            </Link>

                                            {/* ✅ 버튼 연결: 상세 페이지로 이동만 수행 */}
                                            <div style={{display:'flex', gap:'5px', marginLeft:'10px'}}>
                                                <button className="myinfo-edit-btn" onClick={() => handleEditComment(comment)}>수정</button>
                                                <button className="myinfo-delete-btn" onClick={() => handleDeleteComment(comment)}>삭제</button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default MyInfoPage;
>>>>>>> Stashed changes
