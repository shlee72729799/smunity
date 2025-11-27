import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signup } from '../api/client'
import '../styles/RegisterPage.css' // 스타일 재사용

const SignupFinalPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const signupToken = searchParams.get('signupToken') // URL에서 토큰 추출

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        nickname: '',
    })
    const [loading, setLoading] = useState(false)

    // 토큰 없으면 접근 차단
    useEffect(() => {
        if (!signupToken) {
            alert('잘못된 접근입니다. 이메일 인증부터 진행해주세요.')
            navigate('/register')
        }
    }, [signupToken, navigate])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }
        if (!formData.username || !formData.password || !formData.nickname) {
            alert('모든 필드를 입력해주세요.')
            return
        }

        try {
            setLoading(true)

            const payload = {
                signupToken: signupToken, // ★ 핵심: 토큰 포함
                username: formData.username,
                password: formData.password,
                name: formData.nickname, // 백엔드 UserEntity 필드명에 맞춤 (nickname -> name)
                // email은 토큰 안에 있으므로 안 보내도 됨 (백엔드 로직에 따름)
            }

            await signup(payload)
            alert('회원가입이 완료되었습니다! 로그인해주세요.')
            navigate('/login')
        } catch (err) {
            console.error('Signup Error:', err)
            alert(`회원가입 실패: ${err.message || err}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-icon">
                    <span>📝</span>
                </div>

                <h1><Link to="/" className="logo-link">sm-connect</Link> 가입 완료</h1>
                <p className="subtitle">나머지 정보를 입력해주세요.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">아이디</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="아이디"
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
                            placeholder="비밀번호"
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="nickname">이름(닉네임)</label>
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                            placeholder="활동명"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? '가입 완료' : '회원가입 완료'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SignupFinalPage