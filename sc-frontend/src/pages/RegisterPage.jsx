import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendVerificationEmail } from '../api/client' // API 함수 import
import '../styles/RegisterPage.css' // 기존 스타일 파일 사용

const RegisterPage = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 1. 상명대 도메인 유효성 검사
        if (!email.endsWith('@sangmyung.kr') && !email.endsWith('@smu.ac.kr')) {
            alert('상명대학교 이메일(@sangmyung.kr, @smu.ac.kr)만 사용할 수 있습니다.')
            return
        }

        try {
            setLoading(true)
            // 2. 백엔드로 인증 메일 발송 요청
            await sendVerificationEmail(email)

            // 3. 성공 시 메시지 표시 (폼 숨김)
            setMessage('✅ 인증 메일이 발송되었습니다. 학교 메일함을 확인해주세요.')
        } catch (err) {
            console.error('Email verification failed:', err)
            alert(`발송 실패: ${err.message || '알 수 없는 오류가 발생했습니다.'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                {/* 상단 아이콘 영역 */}
                <div className="register-icon">
                    <span>🏫</span>
                </div>

                {/* 타이틀 영역 */}
                <h1><Link to="/" className="logo-link">sm-connect</Link> 학생 인증</h1>
                <p className="subtitle">안전한 커뮤니티를 위해 학교 이메일을 인증해주세요.</p>

                {/* 메시지가 있으면 성공 화면, 없으면 입력 폼 표시 */}
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
                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                            메일에 포함된 <b>링크를 클릭</b>하면<br />
                            회원가입 정보를 입력하는 페이지로 이동합니다.
                        </p>
                    </div>
                )}

                {/* 하단 링크 */}
                <div className="login-link">
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage