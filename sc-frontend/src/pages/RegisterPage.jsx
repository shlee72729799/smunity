import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendVerificationEmail, checkVerificationStatus } from '../api/client'
import '../styles/RegisterPage.css'

const RegisterPage = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // 타이머 및 폴링 상태
    const [timeLeft, setTimeLeft] = useState(0)
    const pollingId = useRef(null) // 폴링 반복자 저장용

    // 타이머 & 폴링 로직
    useEffect(() => {
        // 시간이 남아있을 때만 동작
        if (timeLeft > 0) {
            // 1. 화면 타이머 감소 (1초마다)
            const timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)

            // 2. 서버에 인증 상태 물어보기 (3초마다)
            if (!pollingId.current) {
                pollingId.current = setInterval(async () => {
                    try {
                        const data = await checkVerificationStatus(email)

                        // 인증 성공 시!
                        if (data && data.status === 'VERIFIED' && data.signupToken) {
                            clearInterval(pollingId.current) // 질문 중단
                            pollingId.current = null;

                            alert('인증이 완료되었습니다! 정보를 입력해주세요.')
                            // 토큰을 들고 다음 페이지로 자동 이동
                            navigate(`/signup-final?signupToken=${data.signupToken}`)
                        }
                    } catch (err) {
                        console.error("Polling error:", err)
                    }
                }, 3000)
            }

            // 청소(Cleanup) 함수: 컴포넌트가 사라지거나 시간이 다 되면 멈춤
            return () => {
                clearInterval(timerId)
                if (timeLeft <= 1 && pollingId.current) {
                    clearInterval(pollingId.current)
                    pollingId.current = null
                }
            }
        }
    }, [timeLeft, email, navigate])

    const formatTime = (seconds) => {
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
        const ss = String(seconds % 60).padStart(2, '0')
        return `${mm}:${ss}`
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.endsWith('@sangmyung.kr') && !email.endsWith('@smu.ac.kr')) {
            alert('상명대학교 이메일(@sangmyung.kr, @smu.ac.kr)만 사용할 수 있습니다.')
            return
        }

        try {
            setLoading(true)
            // 1. 메일 발송 요청
            const response = await sendVerificationEmail(email)

            // 2. 타이머 설정 -> useEffect 발동 -> 폴링 시작
            const duration = response.expiresIn || 300
            setTimeLeft(duration)

            setMessage('✅ 인증 메일이 발송되었습니다. 메일의 링크를 클릭해주세요.')

        } catch (err) {
            alert(`발송 실패: ${err.message || err}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-icon">
                    <span>🏫</span>
                </div>

                <h1><Link to="/" className="logo-link">sm-connect</Link> 학생 인증</h1>
                <p className="subtitle">안전한 커뮤니티를 위해 학교 이메일을 인증해주세요.</p>

                {!message ? (
                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="email">학교 이메일</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="학번@sangmyung.kr"
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? '전송 중...' : '인증메일 발송'}
                        </button>
                    </form>
                ) : (
                    <div style={{ marginTop: '20px', textAlign: 'center', lineHeight: '1.6' }}>
                        <p style={{ color: '#004094', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {message}
                        </p>

                        {timeLeft > 0 ? (
                            <p style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.5rem', marginTop: '15px' }}>
                                남은 시간: {formatTime(timeLeft)}
                            </p>
                        ) : (
                            <div style={{ marginTop: '15px' }}>
                                <p style={{ color: '#999', marginBottom: '10px' }}>인증 시간이 만료되었습니다.</p>
                                <button
                                    onClick={() => { setMessage(''); setTimeLeft(0); }}
                                    className="submit-btn"
                                    style={{ backgroundColor: '#666', width: 'auto', padding: '10px 20px' }}
                                >
                                    재전송 하기
                                </button>
                            </div>
                        )}

                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '20px' }}>
                            메일에 포함된 <b>링크를 클릭</b>하면<br />
                            자동으로 다음 단계로 이동합니다.
                        </p>
                    </div>
                )}

                <div className="login-link">
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage