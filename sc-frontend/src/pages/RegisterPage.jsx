import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, sendEmailVerification } from '../api/client'
import '../styles/RegisterPage.css'

const RegisterPage = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        verificationCode: '',
    })

    const [loading, setLoading] = useState(false)
    const [emailSending, setEmailSending] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    // 이메일 인증 버튼 클릭 핸들러
    const handleSendVerification = async () => {
        const emailInput = formData.email.trim();

        if (!emailInput) {
            alert('학교 이메일을 입력해주세요.');
            return;
        }

        // 도메인 유효성 검사
        const lowerEmail = emailInput.toLowerCase();
        const isValidDomain = lowerEmail.endsWith('@smu.ac.kr') || lowerEmail.endsWith('@sangmyung.kr');

        if (!isValidDomain) {
            alert('상명대학교 이메일(@smu.ac.kr 또는 @sangmyung.kr)만 사용 가능합니다.');
            return;
        }

        try {
            setEmailSending(true);
            await sendEmailVerification(emailInput);
            alert(`인증 코드가 ${emailInput}로 발송되었습니다.\n이메일함을 확인해주세요.`);
        } catch (err) {
            console.error(err);
            // 에러 메시지 처리
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || '메일 발송 실패';
            alert(`메일 발송 실패: ${msg}`);
        } finally {
            setEmailSending(false);
        }
    }

    // 회원가입 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault()

        // 1. 비밀번호 일치 검사
        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }

        // 2. 빈칸 검사
        if (!formData.email || !formData.password || !formData.nickname || !formData.verificationCode) {
            alert('모든 필드(인증번호 포함)를 입력해주세요.')
            return
        }

        try {
            setLoading(true)

            // 3. 이메일에서 아이디(학번) 추출 (예: 2023123@smu.ac.kr -> 2023123)
            const usernameExtracted = formData.email.split('@')[0];

            const payload = {
                username: usernameExtracted,    // 추출한 학번을 아이디로 사용
                email: formData.email,          // 전체 이메일
                password: formData.password,
                name: formData.nickname,
                verificationCode: formData.verificationCode // 인증 코드 포함
            }

            console.log('RegisterPage - Sending payload:', payload)

            // 4. 회원가입 요청
            await signup(payload)

            alert('회원가입이 완료되었습니다! 로그인해주세요.')
            navigate('/login')

        } catch (err) {
            console.error('RegisterPage - Error:', err);

            // ✅ [핵심 수정] 백엔드에서 보낸 에러 메시지를 정확히 파싱하여 보여줌
            const data = err.response?.data;

            // Case 1: 백엔드가 { message: "..." } 또는 { error: "..." } 로 보낸 경우
            let finalMsg = data?.message || data?.error;

            // Case 2: Validation 오류로 { 필드명: "에러내용" } 객체가 온 경우
            if (typeof data === 'object' && !finalMsg) {
                const firstKey = Object.keys(data)[0];
                if (firstKey) {
                    finalMsg = `${firstKey}: ${data[firstKey]}`;
                }
            }

            // Case 3: 그 외 알 수 없는 오류
            if (!finalMsg) {
                finalMsg = err.message || "알 수 없는 오류가 발생했습니다.";
            }

            alert(`회원가입 실패: ${finalMsg}`);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-icon">
                    <span>🎓</span>
                </div>

                <h1><Link to="/" className="logo-link">스뮤니티</Link> 회원가입</h1>
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
                                {emailSending ? '전송 중...' : '인증'}
                            </button>
                        </div>
                        <p className="helper-text">@smu.ac.kr 또는 @sangmyung.kr 전체 주소를 입력해주세요.</p>
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
                        {loading ? '가입 중...' : '회원가입'}
                    </button>
                </form>

                <div className="login-link">
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                    <span style={{ margin: "0 10px", color: "#ddd" }}>|</span>
                    {/* ✅ 여기에 className="gray-link" 추가 */}
                    <Link to="/" className="gray-link">메인으로</Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage