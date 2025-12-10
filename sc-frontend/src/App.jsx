import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainPage from "./pages/MainPage";
import BoardPage from "./pages/BoardPage";
import NewPostPage from "./pages/NewPostPage";
import DetailPage from "./pages/DetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyInfoPage from "./pages/MyInfoPage";
import WithMePage from "./pages/WithMePage";

function PrivateRoute({ element }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 메인 홈 */}
          <Route path="/" element={<MainPage />} />

          {/* 게시판 목록: /board/free, /board/job ... */}
          <Route
            path="/board/:type"
            element={<PrivateRoute element={<BoardPage />} />}
          />

          {/* 새 글 작성 페이지: /board/free/new, /board/job/new ... */}
          <Route
            path="/board/:type/new"
            element={<PrivateRoute element={<NewPostPage />} />}
          />

          {/* 게시글 상세 페이지: /detail/1 */}
          <Route
            path="/detail/:id"
            element={<PrivateRoute element={<DetailPage />} />}
          />

            {/* 내 정보 페이지 */}
          <Route
            path="/myinfo"
            element={<PrivateRoute element={<MyInfoPage />} />}
          />
            {/* With Me 페이지 라우트 */}
          <Route path="/withme" element={<PrivateRoute element={<WithMePage />} />}
          />

          {/* 예전 Community용 (필요시 유지)
          <Route path="/community" element={<CommunityPage />} />
           */}

          {/* 인증 관련 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

