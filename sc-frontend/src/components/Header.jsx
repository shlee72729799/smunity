// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";

const Header = ({ popularPosts = [] }) => {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 검색어 입력 후 엔터 / 버튼 클릭 시 실행
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchKeyword.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
  };

  // 인기글 1~10위 항목을 클릭하면 그 제목으로 검색
  const handleClickPopularItem = (title) => {
    if (!title) return;
    navigate(`/search?query=${encodeURIComponent(title)}`);
  };

  return (
    <>
      <header className="header">
        {/* 왼쪽: 로고 + 제목 (전체 클릭 시 메인으로 이동) */}
        <Link to="/" className="header-left header-logo-link">
          <img
            src="/smu-logo.png"
            alt="상명대학교 로고"
            className="logo-image"
          />
          <span className="logo-title">smunity</span>
        </Link>

        {/* 가운데: 돋보기 + 실제 오늘의 인기글 Top 10 세로 슬라이드 + 검색 패널 */}
        <div className="header-center">
          <div
            className="header-search-wrapper"
            onMouseEnter={() => setSearchOpen(true)}
            onMouseLeave={() => setSearchOpen(false)}
          >
            {/* 돋보기 아이콘 */}
            <button
              type="button"
              className="search-icon-button"
              aria-label="게시글 검색"
            >
              {/* /public 폴더에 search-icon.png 하나 넣어두면 됨 */}
              <img
                src="/search-icon.png"
                alt="검색"
                className="search-icon-image"
              />
            </button>

            {/* 계속 내려가는 인기글 티커 */}
            <div className="ticker-vertical">
              <ul>
                {popularPosts.length > 0 ? (
                  popularPosts.slice(0, 10).map((post, index) => (
                    <li key={post.id ?? index}>
                      {index + 1}위: {post.title}
                    </li>
                  ))
                ) : (
                  <li>오늘의 인기글이 없습니다.</li>
                )}
              </ul>
            </div>

            {/* 호버 시: 돋보기+티커 위를 덮는 검색 패널 */}
            {searchOpen && (
              <div className="header-search-panel">
                {/* 위: 검색어 입력 */}
                <form
                  className="header-search-form"
                  onSubmit={handleSearchSubmit}
                >
                  <input
                    type="text"
                    className="header-search-input"
                    placeholder="게시글 검색..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <button type="submit" className="header-search-submit">
                    검색
                  </button>
                </form>

                {/* 아래: 오늘의 인기글 1~10위 목록 */}
                <ul className="search-popular-list">
                  {popularPosts.length > 0 ? (
                    popularPosts.slice(0, 10).map((post, index) => (
                      <li key={post.id ?? `panel-${index}`}>
                        <button
                          type="button"
                          className="search-popular-item-btn"
                          onClick={() => handleClickPopularItem(post.title)}
                        >
                          {index + 1}위: {post.title}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="search-popular-empty">
                      인기글이 없습니다.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 로그인/회원가입/With Me */}
        <div className="header-right">
          {!isLoggedIn ? (
            <>
              <Link to="/register" className="auth-btn">
                회원가입
              </Link>
              <Link to="/login" className="auth-btn">
                로그인
              </Link>
            </>
          ) : (
            <>
              <Link to="/withme" className="auth-btn">
                With Me
              </Link>

              <Link to="/myinfo" className="auth-btn">
                내 정보
              </Link>

              <Link
                to="/"
                className="auth-btn"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                로그아웃
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 고정 푸터 */}
      <Footer />
    </>
  );
};

export default Header;
