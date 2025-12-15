import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostDetail } from "../api/client";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import "../styles/PostDetail.css";

const PostDetail = () => {
  const { id } = useParams(); // URL의 :id
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPostDetail(id)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="main-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
          로딩 중...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="main-page">
        <Header isLoggedIn={isLoggedIn} logout={logout} />
        <div className="banner-spacing" />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
          <p>{error || "게시글을 찾을 수 없습니다."}</p>
          <button onClick={() => navigate(-1)}>뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <Header isLoggedIn={isLoggedIn} logout={logout} />
      <div className="banner-spacing" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1>{post.title}</h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          조회수: {post.viewCount ?? 0}
        </p>
        <hr />
        <div style={{ whiteSpace: "pre-wrap", fontSize: 15 }}>
          {post.content}
        </div>

        <button
          style={{ marginTop: 16 }}
          onClick={() => navigate(-1)}
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
};

export default PostDetail;
