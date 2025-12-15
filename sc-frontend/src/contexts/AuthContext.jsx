import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, logoutApi, checkSession } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // 로그인한 사용자 정보
    const [loading, setLoading] = useState(true); // 초기 로딩 상태

    // 새로고침 시 세션 체크
    useEffect(() => {
        const initAuth = async () => {
            try {
                const userData = await checkSession(); // 서버에 쿠키 보내서 확인
                setIsLoggedIn(true);
                setUser(userData);
            } catch (e) {
                // 세션이 없거나 만료됨
                setIsLoggedIn(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // 로그인 함수
    const login = async (formData) => {
        const data = await loginApi(formData); // 쿠키는 브라우저가 자동 저장
        setIsLoggedIn(true);
        setUser(data.user);
    };

    // 로그아웃 함수
    const logout = async () => {
        try {
            await logoutApi(); // 서버에 세션 삭제 요청
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    if (loading) return <div>Loading...</div>; // 깜빡임 방지용 로딩

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);