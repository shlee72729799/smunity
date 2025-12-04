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
            const msg = err.response?.data?.message || err.message || "로그인 실패";
            alert(msg);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* 상단 아이콘 */}
                <div className="login-icon">
                    <span>🐤</span>
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

                {/* ✅ 하단 링크 영역 수정됨 */}
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