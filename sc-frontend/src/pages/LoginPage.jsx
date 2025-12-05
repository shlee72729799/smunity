import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/LoginPage.css'

const LoginPage = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

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

        if (!formData.id || !formData.password) {
            alert('아이디와 비밀번호를 입력해주세요.')
            return
        }

        try {
            setLoading(true)
            const payload = {
                username: formData.id,
                password: formData.password,
            }

            await login(payload)
            navigate('/')

        } catch (err) {
            console.error(err);

            // 백엔드 에러 메시지 파싱
            const data = err.response?.data;
            const errorMsg = data?.error || data?.message || err.message;

            // 사용자에게 명확한 메시지를 보여줌
            alert(`로그인 실패: ${errorMsg || '사용자명 또는 비밀번호가 올바르지 않습니다.'}`);

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

                <h1><Link to="/" className="logo-link">스뮤니티</Link></h1>
                <p className="subtitle">상명대학교 커뮤니티</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="id">아이디</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            autoFocus
                        />
                        {/* ✅ [추가] 안내 문구 */}
                        <p className="helper-text">학번(예: 202310123)을 입력하세요.</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                        />
                    </div>

                    <div className="checkbox-group">
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
                </form>

                <div className="login-footer">
                    <Link to="/register" className="footer-link">회원가입</Link>
                    <span className="divider">|</span>
                    <Link to="#" className="footer-link" onClick={(e) => e.preventDefault()}>아이디/비번 찾기</Link>
                    <span className="divider">|</span>
                    <Link to="/" className="footer-link">메인으로</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage