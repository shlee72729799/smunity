// src/pages/RegisterPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup, sendEmailVerification, checkEmailVerification } from "../api/client";
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

    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
    const [timerActive, setTimerActive] = useState(false);

    // 타이머 로직
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            clearInterval(interval);
            setTimerActive(false);
            alert("인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.");
            setIsEmailVerified(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    // 시간 포맷 (mm:ss)
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // 이메일 전송 핸들러
    const handleSendVerification = async () => {
        const emailInput = formData.email.trim();

        if (!emailInput) return alert("학교 이메일을 입력해주세요.");

        const lowerEmail = emailInput.toLowerCase();
        const isValidDomain =
            lowerEmail.endsWith("@smu.ac.kr") || lowerEmail.endsWith("@sangmyung.kr");

        if (!isValidDomain) {
            alert("상명대학교 이메일(@smu.ac.kr 또는 @sangmyung.kr)만 사용 가능합니다.");
            return;
        }

        try {
            setEmailSending(true);
            setIsEmailVerified(false);
            setFormData(prev => ({ ...prev, verificationCode: "" }));

            await sendEmailVerification(emailInput);

            alert("인증 코드가 발송되었습니다. (유효시간 5분)");

            setTimeLeft(300);
            setTimerActive(true);

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || "메일 발송 실패";
            alert(`메일 발송 실패: ${msg}`);
        } finally {
            setEmailSending(false);
        }
    };

    // 인증번호 확인 핸들러
    const handleVerifyCode = async () => {
        if (!formData.verificationCode) return alert("인증번호를 입력해주세요.");
        if (timeLeft === 0) return alert("인증 시간이 만료되었습니다. 재전송해주세요.");

        try {
            await checkEmailVerification(formData.email, formData.verificationCode);

            alert("이메일 인증이 완료되었습니다!");
            setIsEmailVerified(true);
            setTimerActive(false);
        } catch (err) {
            console.error(err);
            alert("인증번호가 일치하지 않거나 만료되었습니다.");
            setIsEmailVerified(false);
        }
    };

    // 회원가입 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEmailVerified) {
            alert("이메일 인증을 먼저 완료해주세요.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!formData.password || !formData.nickname) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            const usernameExtracted = formData.email.split("@")[0];

            await signup({
                username: usernameExtracted,
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
                verificationCode: formData.verificationCode,
            });

            alert("회원가입이 완료되었습니다! 로그인해주세요.");
            navigate("/login");
        } catch (err) {
            console.error("RegisterPage - Error:", err);
            const data = err.response?.data;
            let finalMsg = data?.message || data?.error || "회원가입 실패";
            alert(finalMsg);
        } finally {
            setLoading(false);
        }
    };

    // 버튼 스타일
    const buttonCommonStyle = {
        width: "auto",
        height: "44px",
        padding: "0 10px",
        fontSize: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        flexShrink: 0,
        whiteSpace: "nowrap",
        border: "none",
        color: "white",
        transition: "background-color 0.2s",
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
                                    disabled={isEmailVerified}
                                />
                                <button
                                    type="button"
                                    className="verify-btn"
                                    onClick={handleSendVerification}
                                    disabled={emailSending || isEmailVerified}
                                    style={{
                                        ...buttonCommonStyle,
                                        backgroundColor: (emailSending || isEmailVerified) ? "#ccc" : "#4b6cff",
                                        cursor: (emailSending || isEmailVerified) ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {isEmailVerified ? "완료" : emailSending ? "전송 중" : "인증번호 받기"}
                                </button>
                            </div>
                            <p className="helper-text">
                                @smu.ac.kr 또는 @sangmyung.kr 전체 주소를 입력해주세요.
                            </p>
                        </div>

                        {/* 인증번호 입력 + 타이머 + 확인 버튼*/}
                        <div className="form-group">
                            <label htmlFor="verificationCode">
                                인증번호
                                {/* 타이머 표시 (붉은색, mm:ss) */}
                                {timerActive && (
                                    <span style={{ color: "red", marginLeft: "8px", fontSize: "13px", fontWeight: "bold" }}>
                    {formatTime(timeLeft)}
                  </span>
                                )}
                            </label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    id="verificationCode"
                                    name="verificationCode"
                                    value={formData.verificationCode}
                                    onChange={handleChange}
                                    placeholder="인증번호 6자리"
                                    disabled={!timerActive || isEmailVerified}
                                />
                                <button
                                    type="button"
                                    className="verify-btn"
                                    onClick={handleVerifyCode}
                                    disabled={isEmailVerified || !timerActive}
                                    style={{
                                        ...buttonCommonStyle,
                                        backgroundColor: (isEmailVerified || !timerActive) ? "#ccc" : "#4b6cff",
                                        cursor: (isEmailVerified || !timerActive) ? "default" : "pointer"
                                    }}
                                >
                                    {isEmailVerified ? "인증됨" : "확인"}
                                </button>
                            </div>
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

                        {/* 가입 버튼 (인증 전까지 비활성화) */}
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading || !isEmailVerified}
                            style={{
                                backgroundColor: isEmailVerified ? "#4b6cff" : "#ccc",
                                cursor: isEmailVerified ? "pointer" : "not-allowed"
                            }}
                        >
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
