<<<<<<< Updated upstream
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
>>>>>>> Stashed changes
import MainPage from "./pages/MainPage";
import BoardPage from "./pages/BoardPage";
import NewPostPage from "./pages/NewPostPage";
import DetailPage from "./pages/DetailPage";
<<<<<<< Updated upstream
import CommunityPage from "./pages/CommunityPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyInfoPage from "./pages/MyInfoPage";

// 로그인한 사람만 들어가게 하는 보호 라우트 (선택 사항)
import { useAuth } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";
=======
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyInfoPage from "./pages/MyInfoPage";
import WithMePage from "./pages/WithMePage";
import MediaShortsPage from "./pages/MediaShortsPage";
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
          {/* 사진 · 동영상 쇼츠 페이지 */}
          <Route
            path="/media-shorts"
            element={<PrivateRoute element={<MediaShortsPage />} />}
          />

>>>>>>> Stashed changes
          {/* 게시판 목록: /board/free, /board/job ... */}
          <Route
            path="/board/:type"
            element={<PrivateRoute element={<BoardPage />} />}
          />

<<<<<<< Updated upstream
          {/* 새 글 작성 페이지: /board/free/new, /board/job/new ... */}
=======
          {/* 새 글 작성 페이지: /board/:type/new */}
>>>>>>> Stashed changes
          <Route
            path="/board/:type/new"
            element={<PrivateRoute element={<NewPostPage />} />}
          />

<<<<<<< Updated upstream
          {/* 게시글 상세 페이지: /detail/1 */}
=======
          {/* 게시글 상세 페이지: /detail/:id */}
>>>>>>> Stashed changes
          <Route
            path="/detail/:id"
            element={<PrivateRoute element={<DetailPage />} />}
          />

<<<<<<< Updated upstream
            {/* 내 정보 페이지 */}
=======
          {/* 내 정보 페이지 */}
>>>>>>> Stashed changes
          <Route
            path="/myinfo"
            element={<PrivateRoute element={<MyInfoPage />} />}
          />

<<<<<<< Updated upstream
          {/* 예전 Community용 (필요시 유지) */}
          <Route path="/community" element={<CommunityPage />} />
=======
          {/* With Me 페이지 */}
          <Route
            path="/withme"
            element={<PrivateRoute element={<WithMePage />} />}
          />
>>>>>>> Stashed changes

          {/* 인증 관련 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
