import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { fetchMyWithMeList, deletePost } from "../api/client"; // ✅ deletePost 추가

const WithMePage = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    // 상태 3개로 분리 (주최 / 확정된 참여 / 대기 중인 참여)
    const [hostedPosts, setHostedPosts] = useState([]);
    const [confirmedPosts, setConfirmedPosts] = useState([]);
    const [pendingPosts, setPendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 데이터 로딩 함수 (삭제 후 갱신을 위해 분리)
    const loadData = () => {
        setLoading(true);
        fetchMyWithMeList()
            .then(data => {
                // 백엔드 DTO(MyWithMeResponse) 필드명에 맞춰 매핑
                setHostedPosts(data.myHostedPosts || []);
                setConfirmedPosts(data.myJoinedConfirmedPosts || []);
                setPendingPosts(data.myJoinedPendingPosts || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        loadData();
    }, [isLoggedIn, navigate]);

    // 삭제 핸들러
    const handleDelete = async (postId) => {
        if (!window.confirm("정말 이 모임을 삭제하시겠습니까?")) return;
        try {
            await deletePost(postId);
            alert("삭제되었습니다.");
            loadData();
        } catch (e) {
            alert("삭제 실패: " + (e.response?.data?.error || "오류 발생"));
        }
    };

    // 카드 컴포넌트 (전체 클릭 이동 + 삭제 버튼 + 상태 뱃지)
    const PostCard = ({ post, color, isHost, statusText }) => {
        // 확정 여부 확인
        const isConfirmed = post.withMeInfo?.isConfirmed;

        return (
            <div
                key={post.id}
                onClick={() => navigate(`/detail/${post.id}`)}
                style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderLeft: `5px solid ${color}`,
                    marginBottom: 16,
                    position: "relative",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
                {/* 작성자 관리 버튼 영역 */}
                {isHost && (
                    <div style={{ position: "absolute", top: 15, right: 15, zIndex: 10 }}>
                        {!isConfirmed ? (
                            // 1. 확정 전: 삭제 버튼만 표시
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                style={{
                                    background: "#ff6b6b", color: "white", border: "none",
                                    padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12
                                }}
                            >
                                삭제
                            </button>
                        ) : (
                            // 2. 확정 후: 읽기 전용 뱃지 (삭제 불가)
                            <span style={{
                                background: "#e5e7eb", color: "#374151", padding: "5px 10px",
                                borderRadius: 6, fontSize: 12, fontWeight: "bold", border: "1px solid #d1d5db"
                            }}>
                                🔒 확정됨 (삭제 불가)
                            </span>
                        )}
                    </div>
                )}

                {/* 참여자용 상태 뱃지 */}
                {!isHost && statusText && (
                    <span style={{
                        position: "absolute", top: 15, right: 15,
                        background: "#f3f4f6", color: "#666", padding: "4px 8px",
                        borderRadius: 4, fontSize: 12, fontWeight: "bold"
                    }}>
                        {statusText}
                    </span>
                )}

                <h2 style={{ fontSize: 18, marginBottom: 8, paddingRight: isHost ? 80 : 0 }}>
                    <span style={{ color: "#333" }}>{post.title}</span>
                </h2>

                {post.withMeInfo && (
                    <div style={{ fontSize: 14, color: "#555" }}>
                        <p>📅 시간: {post.withMeInfo.meetingTime.replace("T", " ")}</p>
                        <p>📍 장소: {post.withMeInfo.meetingLocation}</p>
                        <p>👥 인원: {post.withMeInfo.currentParticipants} / {post.withMeInfo.maxParticipants}명</p>

                        {isHost && (
                            <div style={{
                                marginTop: 12, padding: "10px", backgroundColor: "#f8f9fa",
                                borderRadius: "8px", border: "1px solid #e9ecef"
                            }}>
                                <strong style={{ color: "#333", display: "block", marginBottom: "4px" }}>📋 참여자 명단:</strong>
                                <span style={{ color: "#4b6cff" }}>
                                    {post.withMeInfo.participantNicknames && post.withMeInfo.participantNicknames.length > 0
                                        ? post.withMeInfo.participantNicknames.join(", ")
                                        : "아직 참여자가 없습니다."}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="main-page">
            <Header isLoggedIn={isLoggedIn} logout={logout} />
            <div className="banner-spacing" />

            <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
                <h1 style={{ marginBottom: 30 }}>나의 With Me</h1>

                {loading ? (
                    <p>로딩 중...</p>
                ) : (
                    <>
                        {/* 1. 내가 만든 모임 (관리용) */}
                        <section style={{ marginBottom: 40 }}>
                            <h2 style={{
                                borderBottom: "2px solid #fff",
                                paddingBottom: 10,
                                marginBottom: 20,
                                color: "#fff"
                            }}>
                                👑 내가 만든 모임 (관리)
                            </h2>
                            {hostedPosts.length === 0 ? (
                                <p style={{ color: "rgba(255,255,255,0.7)" }}>직접 만든 모임이 없습니다.</p>
                            ) : (
                                hostedPosts.map(post => <PostCard key={post.id} post={post} color="#4b6cff" isHost={true} />)
                            )}
                        </section>

                        {/* 2. 참여 - 확정된 약속 */}
                        <section style={{ marginBottom: 40 }}>
                            {/* ✅ [수정] 흰색 글씨 + 밝은 연두색 테두리 */}
                            <h2 style={{
                                borderBottom: "2px solid #4ade80",
                                paddingBottom: 10,
                                marginBottom: 20,
                                color: "#fff"
                            }}>
                                ✅ 참여 - 확정된 약속
                            </h2>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 15 }}>
                                * 모집 마감 30분 전이 지나 확정된 약속입니다.
                            </p>
                            {confirmedPosts.length === 0 ? (
                                <p style={{ color: "rgba(255,255,255,0.7)" }}>확정된 약속이 없습니다.</p>
                            ) : (
                                confirmedPosts.map(post => <PostCard key={post.id} post={post} color="#22c55e" isHost={false} />)
                            )}
                        </section>

                        {/* 3. 참여 - 대기 중인 약속 */}
                        <section>
                            {/* ✅ [수정] 흰색 글씨 + 밝은 노란색 테두리 */}
                            <h2 style={{
                                borderBottom: "2px solid #facc15",
                                paddingBottom: 10,
                                marginBottom: 20,
                                color: "#fff"
                            }}>
                                ⏳ 참여 - 대기 중인 약속
                            </h2>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 15 }}>
                                * 아직 확정되지 않았습니다. 취소 가능합니다.
                            </p>
                            {pendingPosts.length === 0 ? (
                                <p style={{ color: "rgba(255,255,255,0.7)" }}>참여 대기 중인 약속이 없습니다.</p>
                            ) : (
                                pendingPosts.map(post => <PostCard key={post.id} post={post} color="#f59e0b" isHost={false} statusText="대기 중" />)
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default WithMePage;