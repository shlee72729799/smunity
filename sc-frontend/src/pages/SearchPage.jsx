// src/pages/SearchPage.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { searchPosts, fetchTop10Posts } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "../styles/BoardPage.css"; // BoardPage의 리스트 스타일 재사용

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("query") || "";
    const { isLoggedIn, logout } = useAuth();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [headerPopularPosts, setHeaderPopularPosts] = useState([]);

    useEffect(() => {
        // 헤더용 인기글 로드
        fetchTop10Posts().then(data => setHeaderPopularPosts(Array.isArray(data) ? data : []));

        if (!keyword.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        const loadResults = async () => {
            setLoading(true);
            try {
                const data = await searchPosts(keyword.trim());
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Search failed:", e);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, [keyword]);

    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString("ko-KR");
    };


    return (
        <div className="board-page">
            <Header popularPosts={headerPopularPosts} />
            <div className="board-banner-spacing" />

            <div className="board-page-inner" style={{ maxWidth: 900, margin: "0 auto" }}>
                <header className="board-main-header">
                    <h1 className="board-main-title">
                        🔍 '{keyword}' 검색 결과
                    </h1>
                </header>

                <main className="board-right-column" style={{ width: '100%' }}>
                    <div className="board-main-list-header">
                        총 {loading ? "..." : results.length}개의 게시글 발견
                    </div>

                    {loading ? (
                        <div className="board-main-empty">검색 중입니다...</div>
                    ) : results.length === 0 ? (
                        <div className="board-main-empty">
                            '{keyword}'에 해당하는 게시글이 없습니다.
                        </div>
                    ) : (
                        <ul className="board-main-post-list">
                            {results.map((post) => (
                                <li key={post.id} className="board-main-post-item">
                                    <div className="board-main-post-left">
                                        <Link to={`/detail/${post.id}`} className="board-main-post-title-link">
                                            {post.title}
                                        </Link>
                                        <div className="board-main-post-meta">
                                            <span className="board-main-author">{post.writerName || "익명"}</span>
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
            </div>
            <Footer />
        </div>
    );
};

export default SearchPage;