import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
// API 함수들 import
import {
    fetchMyPosts, fetchMyComments,
    deletePost, updateComment, deleteComment,
    updatePassword
} from "../api/client";
import "../styles/MyInfoPage.css";

function MyInfoPage() {
    const { isLoggedIn, logout, user } = useAuth();
    const navigate = useNavigate();

    const [myPosts, setMyPosts] = useState([]);
    const [myComments, setMyComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // 비밀번호 변경 상태
    const [pwMode, setPwMode] = useState(false); // 변경 모드 on/off
    const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });

    useEffect(() => {
        if (!isLoggedIn && !loading) navigate("/login");
    }, [isLoggedIn, loading, navigate]);

    // 데이터 불러오기
    const loadData = async () => {
        if (!isLoggedIn) return;
        try {
            setLoading(true);
            const [postsRes, commentsRes] = await Promise.all([
                fetchMyPosts(),
                fetchMyComments(),
            ]);
            setMyPosts(postsRes || []);
            setMyComments(commentsRes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [isLoggedIn]);

    // --- 비밀번호 변경 핸들러 ---
    const handlePwChange = async () => {
        if (pwForm.new !== pwForm.confirm) return alert("새 비밀번호가 일치하지 않습니다.");
        if (pwForm.new.length < 6) return alert("비밀번호는 6자 이상이어야 합니다.");

        try {
            await updatePassword(pwForm.current, pwForm.new);
            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
            logout();
            navigate("/");
        } catch (e) {
            alert("비밀번호 변경 실패: " + (e.response?.data?.message || "오류"));
        }
    };

    // --- 게시글 삭제 핸들러 ---
    const handleDeletePost = async (postId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deletePost(postId);
            setMyPosts(prev => prev.filter(p => p.id !== postId)); // 목록에서 즉시 제거
        } catch (e) {
            alert("삭제 실패");
        }
    };

    // 게시글 수정 (글쓰기 페이지로 데이터 들고 이동)
    const handleEditPost = (post) => {
        navigate(`/board/${post.boardCode.toLowerCase()}/new`, {
            state: {
                mode: 'edit',
                postId: post.id,
                initialTitle: post.title,
                // 내용은 목록에 없으므로 상세 조회를 하거나, 제목만 수정하게 할 수도 있음.
                // 여기서는 편의상 제목만 들고 가고 내용은 가서 로딩하거나 빈칸 처리
                // (완벽하게 하려면 content도 DTO에 넣어야 하지만, 보통은 상세페이지에서 수정함)
                initialContent: "",
                boardCode: post.boardCode
            }
        });
    };

    // --- 댓글 삭제 핸들러 ---
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await deleteComment(commentId);
            setMyComments(prev => prev.filter(c => c.id !== commentId));
        } catch (e) {
            alert("삭제 실패");
        }
    };

    // --- 댓글 수정 핸들러 ---
    const handleEditComment = async (commentId, oldContent) => {
        const newContent = prompt("수정할 내용을 입력하세요:", oldContent);
        if (newContent === null || newContent === oldContent) return; // 취소
        if (!newContent.trim()) return alert("내용을 입력하세요.");

        try {
            await updateComment(commentId, newContent);
            // 목록 갱신 (단순히 내용만 바꿔치기)
            setMyComments(prev => prev.map(c => c.id === commentId ? {...c, content: newContent} : c));
        } catch (e) {
            alert("수정 실패");
        }
    };

    return (
        <div className="main-page myinfo-page">
            <Header />
            <div className="banner-spacing" />

            <main className="myinfo-container">
                <h1 className="myinfo-title">내 정보</h1>

                {/* 계정 정보 카드 */}
                <section className="myinfo-card myinfo-account-card">
                    <div className="myinfo-row">
                        <span className="myinfo-label">계정</span>
                        <span className="myinfo-value">
              {user ? `${user.name} | 상명대학교` : "-"}
            </span>
                    </div>
                    <div className="myinfo-row">
                        <span className="myinfo-label">아이디</span>
                        <span className="myinfo-value">{user ? user.username : "-"}</span>
                    </div>

                    {/* 비밀번호 변경 영역 */}
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
                        <span className="myinfo-value">{user ? user.email : "-"}</span>
                    </div>
                </section>

                {/* 작성글 관리 */}
                <section className="myinfo-card">
                    <div className="myinfo-card-header">
                        <h2 className="myinfo-card-title">작성글 관리</h2>
                        <span className="myinfo-card-count">{myPosts.length}개</span>
                    </div>
                    <ul className="myinfo-list">
                        {myPosts.map((post) => (
                            <li key={post.id} className="myinfo-list-item">
                                <Link to={`/detail/${post.id}`} className="myinfo-item-main">
                                    <span className="myinfo-item-title">[{post.boardName}] {post.title}</span>
                                    <span style={{fontSize: '12px', color: '#888', marginLeft: '10px'}}>{post.createdAt}</span>
                                </Link>

                                <div style={{display:'flex', gap:'5px', marginLeft:'10px'}}>
                                    {/* ✅ 수정 버튼 활성화 */}
                                    <button className="myinfo-edit-btn" onClick={() => handleEditPost(post)}>수정</button>
                                    <button className="myinfo-delete-btn" onClick={() => handleDeletePost(post.id)}>삭제</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 댓글 관리 */}
                <section className="myinfo-card">
                    <div className="myinfo-card-header">
                        <h2 className="myinfo-card-title">댓글 관리</h2>
                        <span className="myinfo-card-count">{myComments.length}개</span>
                    </div>
                    <ul className="myinfo-list">
                        {myComments.map((comment) => (
                            <li key={comment.id} className="myinfo-list-item">
                                <Link to={`/detail/${comment.postId}`} className="myinfo-item-main">
                                    <span className="myinfo-item-title">{comment.content}</span>
                                    <span style={{fontSize: '12px', color: '#999', marginLeft: '10px'}}>{comment.createdAt}</span>
                                </Link>
                                <div style={{display:'flex', gap:'5px', marginLeft:'10px'}}>
                                    <button className="myinfo-edit-btn" onClick={() => handleEditComment(comment.id, comment.content)}>수정</button>
                                    <button className="myinfo-delete-btn" onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

            </main>
        </div>
    );
}

// 간단한 인라인 스타일 (CSS 파일에 넣어도 됨)
const inputStyle = { padding: '5px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', width: '150px' };

export default MyInfoPage;