import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginAPI } from '../api/client' // API 함수 import
import { useAuth } from '../contexts/AuthContext' // 인증 컨텍스트
import '../styles/LoginPage.css' // 스타일

const LoginPage = () => {
    const navigate = useNavigate()
    const { login: setLoginState } = useAuth() // 컨텍스트의 로그인 상태 변경 함수

    const [formData, setFormData] = useState({
        id: '',
        password: '',
        autoLogin: false,
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 유효성 검사
        if (!formData.id || !formData.password) {
            alert('아이디와 비밀번호를 입력해주세요.')
            return
        }

        try {
            setLoading(true)

            // 백엔드가 요구하는 필드명(username)으로 변환하여 전송
            const payload = {
                username: formData.id,
                password: formData.password,
            }

            // 1. 로그인 API 요청
            const data = await loginAPI(payload)

            // 2. [핵심] 백엔드가 준 토큰을 로컬 스토리지에 저장
            // (백엔드 응답 구조에 따라 data.token, data.accessToken 등으로 수정 필요할 수 있음)
            // 지금은 data 자체가 토큰이거나, data 객체 안에 token 필드가 있다고 가정합니다.
            if (data && data.token) {
                localStorage.setItem('token', data.token)
                console.log('로그인 성공! 토큰 저장됨:', data.token)
            } else if (data && typeof data === 'string' && data.startsWith('ey')) {
                // 혹시 백엔드가 JSON 객체가 아니라 토큰 문자열만 바로 반환하는 경우
                localStorage.setItem('token', data)
            }

            // 3. 앱 전체 로그인 상태 업데이트 (Context)
            setLoginState()

            // 4. 메인 페이지로 이동
            navigate('/')

        } catch (err) {
            console.error('Login Error:', err)
            alert(`로그인 실패: ${err.message || '아이디 또는 비밀번호를 확인해주세요.'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="mascot">
                    <div className="mascot-duck">🐤</div>
                </div>

                <h1><Link to="/" className="logo-link">sm-connect</Link></h1>
                <p className="subtitle">상명대학교 커뮤니티</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            placeholder="아이디"
                            autoFocus
                            className="id-input"
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호"
                            className="password-input"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="autoLogin"
                                checked={formData.autoLogin}
                                onChange={handleChange}
                            />
                            <span>자동 로그인</span>
                        </label>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>

                    {/* 회원가입 링크를 1단계 페이지(/signup)로 연결 */}
                    <Link to="/register" className="signup-btn">
                        회원가입
                    </Link>
                </form>

                <div className="footer-links">
                    <Link to="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                        계정&amp;비번찾기
                    </Link>
                    <Link to="/" className="home-link">
                        메인으로
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage