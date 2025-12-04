// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
    const { isLoggedIn, logout, user } = useAuth();

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

        {/* 가운데: 인기글 세로 슬라이드 */}
        <div className="header-center">
          <div className="ticker-vertical">
            <ul>
              <li>1위: 상명대 축제 일정 공개!</li>
              <li>2위: 학식 리뉴얼 후기</li>
              <li>3위: 공학관 리모델링 완료</li>
              <li>4위: 상명대 굿즈 출시</li>
              <li>5위: 중앙도서관 야간 개방</li>
              <li>6위: 상명대 로고 리뉴얼</li>
              <li>7위: 축제 동아리 공연 모집</li>
              <li>8위: 새 학기 강의 평가</li>
              <li>9위: 신입생 환영회 후기</li>
              <li>10위: 상명대 미디어관 완공</li>
            </ul>
          </div>
        </div>

        {/* 오른쪽: 로그인/회원가입/쪽지 */}
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
              <Link to="/messages" className="auth-btn">
                쪽지
              </Link>

              <Link to="/myinfo" className="auth-btn">
                내 정보
              </Link>

                <Link
                    to="/"
                    className="auth-btn"
                    onClick={(e) => {
                        e.preventDefault(); // 링크 이동 막고
                        logout(); // 로그아웃 함수 실행
                    }}
                >
                    로그아웃
                </Link>
            </>
          )}
        </div>
      </header>

      {/* 🔥 여기서 고정 푸터를 한 번만 렌더링 */}
      <Footer />
    </>
  );
};

export default Header;
