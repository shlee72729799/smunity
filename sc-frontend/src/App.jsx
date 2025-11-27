import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import MainPage from './pages/MainPage'
import DetailPage from './pages/DetailPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import SignupFinalPage from './pages/SignupFinalPage' // [추가]

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/detail" element={<DetailPage />} />
                    <Route path="/detail/:id" element={<DetailPage />} />

                    {/* 1단계: 이메일 인증 */}
                    <Route path="/register" element={<RegisterPage />} />

                    {/* 2단계: 최종 가입 (메일 링크용) */}
                    <Route path="/signup-final" element={<SignupFinalPage />} />

                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App