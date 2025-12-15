// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup, sendEmailVerification } from "../api/client";
import Footer from "../components/Footer";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    verificationCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendVerification = async () => {
    const emailInput = formData.email.trim();

    if (!emailInput) {
      alert("학교 이메일을 입력해주세요.");
      return;
    }

    const lowerEmail = emailInput.toLowerCase();
    const isValidDomain =
      lowerEmail.endsWith("@smu.ac.kr") || lowerEmail.endsWith("@sangmyung.kr");

    if (!isValidDomain) {
      alert("상명대학교 이메일(@smu.ac.kr 또는 @sangmyung.kr)만 사용 가능합니다.");
      return;
    }

    try {
      setEmailSending(true);
      await sendEmailVerification(emailInput);
      alert(`인증 코드가 ${emailInput}로 발송되었습니다.\n이메일함을 확인해주세요.`);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "메일 발송 실패";
      alert(`메일 발송 실패: ${msg}`);
    } finally {
      setEmailSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (
      !formData.email ||
      !formData.password ||
      !formData.nickname ||
      !formData.verificationCode
    ) {
      alert("모든 필드(인증번호 포함)를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const usernameExtracted = formData.email.split("@")[0];

      const payload = {
        username: usernameExtracted,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        verificationCode: formData.verificationCode,
      };

      console.log("RegisterPage - Sending payload:", payload);

      await signup(payload);

      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      console.error("RegisterPage - Error:", err);

      const data = err.response?.data;

      let finalMsg = data?.message || data?.error;

      if (typeof data === "object" && data && !finalMsg) {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          finalMsg = `${firstKey}: ${data[firstKey]}`;
        }
      }

      if (!finalMsg) {
        finalMsg = err.message || "알 수 없는 오류가 발생했습니다.";
      }

      alert(`회원가입 실패: ${finalMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* ✅ 가운데 컨텐츠 영역 */}
      <div className="register-page-inner">
        <div className="register-container">
          <div className="register-icon">
            <span>🎓</span>
          </div>

          <h1>
            <Link to="/" className="logo-link">
              스뮤니티
            </Link>{" "}
            회원가입
          </h1>
          <p className="subtitle">상명대학교 커뮤니티</p>

          <form onSubmit={handleSubmit} className="register-form">
            {/* 이메일 입력 + 인증 버튼 */}
            <div className="form-group">
              <label htmlFor="email">학교 이메일</label>
              <div className="input-with-button">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="예: 202310123@smu.ac.kr"
                  autoFocus
                />
                <button
                  type="button"
                  className="verify-btn"
                  onClick={handleSendVerification}
                  disabled={emailSending}
                >
                  {emailSending ? "전송 중..." : "인증"}
                </button>
              </div>
              <p className="helper-text">
                @smu.ac.kr 또는 @sangmyung.kr 전체 주소를 입력해주세요.
              </p>
            </div>

            {/* 인증번호 입력 */}
            <div className="form-group">
              <label htmlFor="verificationCode">인증번호</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="이메일로 받은 6자리 코드"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="form-group">
              <label htmlFor="password">비밀번호 (6자 이상)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 확인"
              />
            </div>

            {/* 닉네임 입력 */}
            <div className="form-group">
              <label htmlFor="nickname">닉네임 (3-15자)</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="닉네임"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="login-link">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            <span style={{ margin: "0 10px", color: "#ddd" }}>|</span>
            <Link to="/" className="gray-link">
              메인으로
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ 페이지 맨 아래 공통 Footer */}
      <Footer />
    </div>
  );
};

export default RegisterPage;
