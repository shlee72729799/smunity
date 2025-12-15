// src/pages/MediaShortsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMediaPosts, setMediaPostsStore } from "../store/mediaStore";
import "../styles/MediaShortsPage.css";
import Footer from "../components/Footer";

const truncate = (text, maxLen) => {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
};

const getCommentsCount = (post) => {
  if (Array.isArray(post.comments)) return post.comments.length;
  if (typeof post.commentCount === "number") return post.commentCount;
  return 0;
};

const MediaShortsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserName =
    user?.nickname ||
    user?.username ||
    user?.loginId ||
    user?.userId ||
    user?.email ||
    user?.id ||
    "알 수 없음";

  // 공용 스토어에서 초기값 가져오기
  const [posts, setPosts] = useState(() => getMediaPosts() || []);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // 정렬 모드
  const [sortMode, setSortMode] = useState("time-desc");

  // 새 글 작성 모달
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createFile, setCreateFile] = useState(null);
  const [createPreviewUrl, setCreatePreviewUrl] = useState("");
  const [createMediaType, setCreateMediaType] = useState(null);

  const [newComment, setNewComment] = useState("");

  // posts가 바뀔 때마다 공용 스토어에 반영
  useEffect(() => {
    setMediaPostsStore(posts);
  }, [posts]);

  const sortedPosts = [...posts].sort((a, b) => {
    const num = (v) => (typeof v === "number" ? v : 0);
    const dateNum = (v) => {
      if (!v) return 0;
      const t = new Date(v).getTime();
      return Number.isNaN(t) ? 0 : t;
    };

    switch (sortMode) {
      case "time-asc":
        return dateNum(a.createdAt) - dateNum(b.createdAt);
      case "likes-desc":
        return num(b.likeCount) - num(a.likeCount);
      case "views-desc":
        return num(b.viewCount) - num(a.viewCount);
      case "comments-desc":
        return getCommentsCount(b) - getCommentsCount(a);
      case "time-desc":
      default:
        return dateNum(b.createdAt) - dateNum(a.createdAt);
    }
  });

  // 상세 열 때 조회수 +1
  const openDetail = (id) => {
    setPosts((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, viewCount: (p.viewCount ?? 0) + 1 } : p
      );
      setMediaPostsStore(next);
      return next;
    });
    setSelectedPostId(id);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedPostId(null);
    setNewComment("");
  };

  const handleLike = (id) => {
    setPosts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.liked;
        const current = p.likeCount ?? 0;
        return {
          ...p,
          liked,
          likeCount: liked ? current + 1 : Math.max(0, current - 1),
        };
      });
      setMediaPostsStore(next);
      return next;
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    setPosts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setMediaPostsStore(next);
      return next;
    });
    if (selectedPostId === id) closeDetail();
  };

  const handleAddComment = () => {
    const text = newComment.trim();
    if (!text || selectedPostId == null) return;

    setPosts((prev) => {
      const next = prev.map((p) =>
        p.id === selectedPostId
          ? {
              ...p,
              comments: [
                ...(p.comments ?? []),
                { id: Date.now(), author: currentUserName, content: text },
              ],
            }
          : p
      );
      setMediaPostsStore(next);
      return next;
    });

    setNewComment("");
  };

  // 새 게시글 작성 모달 열기/닫기
  const handleCreatePost = () => setIsCreateOpen(true);

  const handleCreateClose = () => {
    setIsCreateOpen(false);
    setCreateTitle("");
    setCreateContent("");
    setCreateFile(null);
    setCreatePreviewUrl("");
    setCreateMediaType(null);
  };

  const handleCreateFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setCreateFile(null);
      setCreatePreviewUrl("");
      setCreateMediaType(null);
      return;
    }

    setCreateFile(file);
    const isVideo = file.type.startsWith("video");
    setCreateMediaType(isVideo ? "video" : "image");

    const previewUrl = URL.createObjectURL(file);
    setCreatePreviewUrl(previewUrl);
  };

  const handleCreateSubmit = () => {
    if (!createFile) {
      alert("사진 또는 동영상을 선택해 주세요.");
      return;
    }
    if (!createTitle.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }

    const newPost = {
      id: Date.now(),
      author: currentUserName,
      title: createTitle.trim(),
      content: createContent.trim(),
      mediaType: createMediaType ?? "image",
      mediaUrl: createPreviewUrl,
      likeCount: 0,
      viewCount: 0,
      liked: false,
      comments: [],
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    setPosts((prev) => {
      const next = [newPost, ...prev];
      setMediaPostsStore(next);
      return next;
    });
    handleCreateClose();
  };

  const modalPost =
    selectedPostId != null ? posts.find((p) => p.id === selectedPostId) : null;

  const canDelete = (post) =>
    post.isMine === true || post.author === currentUserName;

  return (
    <div className="shorts-page">
      {/* 상단 헤더 */}
      <header className="shorts-header">
        <button className="shorts-back-btn" type="button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>사진 · 동영상</h1>
        <button className="shorts-add-btn" type="button" onClick={handleCreatePost}>
          +
        </button>
      </header>

      {/* 정렬/필터 영역 */}
      <div className="shorts-toolbar">
        <span className="shorts-count">{sortedPosts.length}개의 글</span>
        <select
          className="shorts-sort-select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="time-desc">최신순 (하향식)</option>
          <option value="time-asc">오래된순 (상향식)</option>
          <option value="likes-desc">추천수 많은 순</option>
          <option value="views-desc">조회수 많은 순</option>
          <option value="comments-desc">댓글수 많은 순</option>
        </select>
      </div>

      {/* 게시글 목록 */}
      <div className="shorts-list">
        {sortedPosts.length === 0 ? (
          <div className="shorts-empty">아직 등록된 사진·동영상 게시글이 없습니다.</div>
        ) : (
          sortedPosts.map((post) => (
            <article key={post.id} className="shorts-list-item">
              {/* 썸네일 */}
              <div className="shorts-thumb" onClick={() => openDetail(post.id)}>
                {post.mediaType === "video" ? (
                  <video
                    src={post.mediaUrl}
                    muted
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
              </div>

              {/* 제목 + 정보 */}
              <div className="shorts-list-main" onClick={() => openDetail(post.id)}>
                <h2 className="shorts-list-title">{truncate(post.title, 50)}</h2>

                <div className="shorts-list-meta">
                  <span className="shorts-author">{post.author}</span>
                  {post.createdAt && (
                    <span className="shorts-date">
                      {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </div>

                <div className="shorts-list-stats">
                  <button
                    type="button"
                    className={`like-btn like-btn-inline ${post.liked ? "liked" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                  >
                    ❤️ {post.likeCount ?? 0}
                  </button>
                  <span>👁 {post.viewCount ?? 0}</span>
                  <span>💬 {getCommentsCount(post)}</span>
                </div>
              </div>

              {/* 삭제 버튼 (내 글만) */}
              {canDelete(post) && (
                <button
                  type="button"
                  className="shorts-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(post.id);
                  }}
                >
                  삭제
                </button>
              )}
            </article>
          ))
        )}
      </div>

      {/* 새 게시글 작성 모달 */}
      {isCreateOpen && (
        <div className="shorts-create-overlay" onClick={handleCreateClose}>
          <div className="shorts-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shorts-create-header">
              <span>사진 · 동영상 업로드</span>
              <button type="button" className="shorts-create-close" onClick={handleCreateClose}>
                ✕
              </button>
            </div>

            <div className="shorts-create-body">
              <div className="shorts-create-left">
                <label className="shorts-file-label">
                  파일 업로드를 하려면 클릭하세요 (Click to upload file)
                  <input type="file" accept="image/*,video/*" onChange={handleCreateFileChange} />
                </label>

                <div className="shorts-create-preview">
                  {createPreviewUrl ? (
                    createMediaType === "video" ? (
                      <video
                        src={createPreviewUrl}
                        controls
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : (
                      <img
                        src={createPreviewUrl}
                        alt="미리보기"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    )
                  ) : (
                    <span className="shorts-preview-placeholder">
                      선택한 사진/동영상이 여기 미리보기로 표시됩니다.
                    </span>
                  )}
                </div>
              </div>

              <div className="shorts-create-right">
                <div className="shorts-create-field">
                  <label>제목</label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="제목을 입력하세요."
                  />
                </div>

                <div className="shorts-create-field">
                  <label>내용</label>
                  <textarea
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder="게시글 내용을 입력하세요."
                    rows={6}
                  />
                </div>

                <button type="button" className="shorts-create-submit" onClick={handleCreateSubmit}>
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 팝업 */}
      {isDetailOpen && modalPost && (
        <div className="shorts-modal-overlay" onClick={closeDetail}>
          <div className="shorts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shorts-modal-header">
              <span>사진 · 동영상 게시글</span>
              <button type="button" className="shorts-modal-close" onClick={closeDetail}>
                ✕
              </button>
            </div>

            <div className="shorts-modal-body">
              <div className="shorts-modal-media">
                {modalPost.mediaType === "image" ? (
                  <img
                    src={modalPost.mediaUrl}
                    alt={modalPost.title}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : (
                  <video
                    src={modalPost.mediaUrl}
                    controls
                    autoPlay
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
              </div>

              <div className="shorts-modal-right">
                <div className="shorts-modal-main">
                  <h2 className="shorts-modal-title">{modalPost.title}</h2>
                  <p className="shorts-modal-author">{modalPost.author}</p>
                  <p className="shorts-modal-content">{modalPost.content}</p>

                  <div className="shorts-modal-stats">
                    <button
                      type="button"
                      className={`like-btn ${modalPost.liked ? "liked" : ""}`}
                      onClick={() => handleLike(modalPost.id)}
                    >
                      ❤️ {modalPost.likeCount ?? 0}
                    </button>
                    <span>👁 {modalPost.viewCount ?? 0}</span>
                    <span>💬 {getCommentsCount(modalPost)}</span>
                  </div>
                </div>

                <div className="shorts-modal-comment-input">
                  <input
                    type="text"
                    placeholder="댓글을 입력하세요."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComment();
                    }}
                  />
                  <button type="button" onClick={handleAddComment}>
                    등록
                  </button>
                </div>

                <div className="shorts-modal-comments">
                  {getCommentsCount(modalPost) === 0 ? (
                    <p className="comment-empty">첫 댓글을 달아보세요.</p>
                  ) : (
                    (modalPost.comments ?? []).map((c) => (
                      <div key={c.id} className="comment-item">
                        <span className="comment-author">{c.author}</span>
                        <span className="comment-content">{c.content}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer는 항상 페이지 맨 아래에 1번만 */}
      <Footer />
    </div>
  );
};

export default MediaShortsPage;
