import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/MainPage.css'
import { fetchCommunityList } from '../api/client'
import {
  popularPosts,
  freeBoardSeeds,
  anonymousBoard1,
  anonymousBoard2,
  jobBoardPosts,
  recruitmentPosts,
  defaultStaticContent,
} from '../data/boardData'

const MainPage = () => {
  const { isLoggedIn, logout } = useAuth()
  const freeBoard = freeBoardSeeds
  const boardRoutes = {
    popular: '/board/popular',
    free: '/board/free',
    anonymous1: '/board/anonymous1',
    anonymous2: '/board/anonymous2',
    job: '/board/job',
    recruit: '/board/recruit',
  }

  const [communityPosts, setCommunityPosts] = useState([])

  useEffect(() => {
    fetchCommunityList()
      .then((data) => {
        setCommunityPosts(Array.isArray(data) ? data : (data?.data ?? []))
      })
      .catch(() => {})
  }, [])

  const anonymous1 = anonymousBoard1
  const anonymous2 = anonymousBoard2
  const jobBoard = jobBoardPosts
  const recruitment = recruitmentPosts

  const defaultStaticContentMessage = defaultStaticContent

  const buildLinkProps = (post) => {
    if (post.id) {
      return { to: `/detail/${post.id}` }
    }
    return {
      to: '/detail',
      state: {
        post: {
          title: post.title,
          content: post.content || defaultStaticContentMessage,
        },
      },
    }
  }

  const BoardSection = ({ title, icon, iconText, posts, morePath = '/detail', titleLink }) => (
    <div className="board-section">
      <div className="board-header">
        <span className="board-icon">{iconText}</span>
        {titleLink ? (
          <Link to={titleLink} className="board-title-link">
            {title}
          </Link>
        ) : (
          <h3>{title}</h3>
        )}
        <Link to={morePath} className="more-link">+ 더보기</Link>
      </div>
      <ul className="post-list">
        {posts.map((post, index) => (
          <li key={post.id ?? `${title}-${index}`}>
            <Link {...buildLinkProps(post)} className="post-title">
              {post.title}
            </Link>
            {post.comments > 0 && <span className="comment-count">[{post.comments}]</span>}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-content">
          <Link to="/" className="logo">스뮤니티</Link>
          <nav className="main-nav">
            <a href="#community">커뮤니티</a>
            <a href="#career">커리어</a>
            <a href="#life">생활</a>
            <a href="#genealogy">족보실</a>
            <a href="#all">전체글</a>
            <a href="#popular">인기글</a>
          </nav>
          <div className="auth-links">
            {!isLoggedIn ? (
              <>
                <Link to="/register">회원가입</Link>
                <Link to="/login">로그인</Link>
              </>
            ) : (
              <>
                <a href="#mypage">내 페이지</a>
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>로그아웃</a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="banner-spacing" />

      <div className="main-content">
        <div className="content-grid">
          <BoardSection 
            title="오늘의 인기글" 
            icon="👍" 
            iconText="👍" 
            posts={popularPosts}
            titleLink={boardRoutes.popular}
            morePath={boardRoutes.popular}
          />
          <div className="board-section">
            <div className="board-header">
              <span className="board-icon">💬</span>
              <Link to={boardRoutes.free} className="board-title-link">자유게시판</Link>
              <Link to={boardRoutes.free} className="more-link">+ 더보기</Link>
            </div>
            <ul className="post-list">
              {freeBoard.map((post, index) => (
                <li key={`seed-${index}`}>
                  <Link {...buildLinkProps(post)} className="post-title">
                    {post.title}
                  </Link>
                  {post.comments > 0 && <span className="comment-count">[{post.comments}]</span>}
                </li>
              ))}
              {communityPosts.map((p) => (
                <li key={p.id}>
                  <Link className="post-title" to={`/detail/${p.id}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <BoardSection 
            title="익게1" 
            icon="👤" 
            iconText="👤" 
            posts={anonymous1}
            titleLink={boardRoutes.anonymous1}
            morePath={boardRoutes.anonymous1}
          />
          <BoardSection 
            title="익게2" 
            icon="💬" 
            iconText="💬" 
            posts={anonymous2}
            titleLink={boardRoutes.anonymous2}
            morePath={boardRoutes.anonymous2}
          />
          <BoardSection 
            title="취업게시판" 
            icon="💼" 
            iconText="💼" 
            posts={jobBoard}
            titleLink={boardRoutes.job}
            morePath={boardRoutes.job}
          />
          <BoardSection 
            title="모집공고" 
            icon="📢" 
            iconText="📢" 
            posts={recruitment}
            titleLink={boardRoutes.recruit}
            morePath={boardRoutes.recruit}
          />
        </div>
      </div>

      <footer className="main-footer">
        <a href="#mypage">내페이지</a>
        <a href="#schedule">학사일정</a>
        <a href="#notice">학교공지</a>
        <a href="#reading">열람실</a>
        <a href="#cafeteria">학식</a>
      </footer>
    </div>
  )
}

export default MainPage




