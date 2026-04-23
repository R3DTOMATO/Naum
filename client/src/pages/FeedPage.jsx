import { useEffect, useState } from 'react'
import api from '../api/axios'
import PostCard from '../components/PostCard'
import CommentSection from '../components/CommentSection'
import EmotionButtons from '../components/LikeButton'

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openComments, setOpenComments] = useState(new Set()) // 댓글이 열린 포스트들을 추적
  const [commentCounts, setCommentCounts] = useState({}) // 각 포스트의 댓글 수
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showCommentInput, setShowCommentInput] = useState(null) // 댓글 모달이 열린 포스트 ID

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get('/posts')
        setPosts(response.data)
        
        // 댓글 수 초기화
        const counts = {}
        response.data.forEach(post => {
          counts[post._id] = post.commentsCount || 0
        })
        setCommentCounts(counts)
        
        setError(null)
      } catch (error) {
        console.error('Error fetching posts:', error)
        setError('게시물을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const toggleComments = (postId) => {
    setOpenComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleCommentAdded = (postId, newCommentCount) => {
    setCommentCounts(prev => ({
      ...prev,
      [postId]: newCommentCount
    }))
  }

  const toggleCommentInput = (postId) => {
    setShowCommentInput(prev => prev === postId ? null : postId)
  }

  const selectedPost = posts.find(p => p._id === showCommentInput)

  if (loading) {
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "50vh"}}>
        <p>로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "50vh"}}>
        <p style={{color: "red"}}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      gap: "1.5rem", 
      padding: isMobile ? "0" : "2rem", 
      maxWidth: "470px", 
      margin: "0 auto", 
    }}>
      {posts.length === 0 ? (
        <div style={{textAlign: "center", padding: "2rem"}}>
          <p>아직 게시물이 없습니다.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post._id} style={{
            backgroundColor: "white",
            borderRadius: isMobile ? "0" : "8px",
            border: "1px solid #dbdbdb",
            overflow: "hidden"
          }}>
            {/* 헤더: 프로필 + 유저명 + 시간 */}
            <div style={{
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img
                  src={post.userId?.profileImg ? `http://localhost:5000${post.userId.profileImg}` : '/default-profile.svg'}
                  alt="profile"
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #dbdbdb"
                  }}
                  onError={(e) => { e.target.src = '/default-profile.svg' }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "#262626" }}>
                    {post.userId?.nickname || post.userId?.username || '익명'}
                  </span>
                  <span style={{ color: "#8e8e8e", fontSize: "0.875rem" }}>
                    · {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "1.25rem", color: "#262626", padding: "0.25rem"
              }}>
                ···
              </button>
            </div>

            {/* 이미지 */}
            {post.imageUrl ? (
              <div style={{
                width: "100%",
                aspectRatio: "4/5",
                backgroundColor: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <img
                  src={`http://localhost:5000${post.imageUrl}`}
                  alt="post"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            ) : null}

            {/* 액션 버튼 + 감정 버튼 */}
            <div style={{ padding: "0.5rem 1rem 0 1rem" }}>
              <EmotionButtons 
                postId={post._id} 
                commentCount={commentCounts[post._id] || 0}
                isInstagramStyle={true}
                onCommentClick={() => toggleCommentInput(post._id)}
                showAllEmotions={true}
              />
            </div>

            {/* 좋아요 수 */}
            <div style={{
              padding: "0 1rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#262626"
            }}>
              좋아요 {(post.reactions?.happy?.length || 0).toLocaleString()}개
            </div>

            {/* 본문 내용 */}
            {post.content && (
              <div style={{ padding: "0.25rem 1rem" }}>
                <p style={{ margin: "0", fontSize: "0.875rem", lineHeight: "1.4" }}>
                  <span style={{ fontWeight: "600", marginRight: "0.5rem" }}>
                    {post.userId?.nickname || post.userId?.username || '익명'}
                  </span>
                  {post.content}
                </p>
              </div>
            )}

            {/* 댓글 수 표시 (클릭하면 댓글 모달 열기) */}
            {(commentCounts[post._id] || 0) > 0 && (
              <div 
                onClick={() => toggleCommentInput(post._id)}
                style={{ 
                  padding: "0.25rem 1rem", 
                  fontSize: "0.875rem", 
                  color: "#8e8e8e", 
                  cursor: "pointer" 
                }}
              >
                댓글 {commentCounts[post._id]}개 모두 보기
              </div>
            )}

            {/* 작성 일자 */}
            <div style={{
              padding: "0.25rem 1rem 0.75rem 1rem",
              fontSize: "0.625rem",
              color: "#8e8e8e",
              textTransform: "uppercase",
              letterSpacing: "0.02em"
            }}>
              {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))
      )}

      {/* 댓글 모달 (인스타그램 데스크톱 스타일) */}
      {selectedPost && (
        <div 
          onClick={() => setShowCommentInput(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          {/* X 닫기 버튼 */}
          <button 
            onClick={() => setShowCommentInput(null)}
            style={{
              position: "fixed", top: "1rem", right: "1rem",
              background: "none", border: "none", color: "white",
              fontSize: "1.75rem", cursor: "pointer", zIndex: 1001
            }}
          >
            ✕
          </button>

          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              backgroundColor: "white",
              borderRadius: "4px",
              overflow: "hidden",
              maxWidth: isMobile ? "95vw" : "900px",
              maxHeight: isMobile ? "90vh" : "600px",
              width: "100%",
              height: isMobile ? "auto" : "600px"
            }}
          >
            {/* 왼쪽: 이미지 */}
            <div style={{
              flex: isMobile ? "none" : "1",
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: isMobile ? "300px" : "100%",
              minWidth: 0
            }}>
              {selectedPost.imageUrl ? (
                <img
                  src={`http://localhost:5000${selectedPost.imageUrl}`}
                  alt="post"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", color: "#262626", padding: "2rem",
                  textAlign: "center", backgroundColor: "white", width: "100%", height: "100%"
                }}>
                  {selectedPost.title && <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>{selectedPost.title}</p>}
                  {selectedPost.content && <p style={{ fontSize: "1rem", marginTop: "0.5rem" }}>{selectedPost.content}</p>}
                </div>
              )}
            </div>

            {/* 오른쪽: 헤더 + 댓글 + 액션 + 입력 */}
            <div style={{
              width: isMobile ? "100%" : "340px",
              display: "flex",
              flexDirection: "column",
              borderLeft: isMobile ? "none" : "1px solid #dbdbdb"
            }}>
              {/* 헤더 */}
              <div style={{
                padding: "0.875rem 1rem",
                borderBottom: "1px solid #efefef",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <img
                  src={selectedPost.userId?.profileImg ? `http://localhost:5000${selectedPost.userId.profileImg}` : '/default-profile.svg'}
                  alt="profile"
                  style={{ width: "2rem", height: "2rem", borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = '/default-profile.svg' }}
                />
                <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "#262626" }}>
                  {selectedPost.userId?.nickname || selectedPost.userId?.username || '익명'}
                </span>
              </div>

              {/* 댓글 영역 (스크롤) */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem"
              }}>
                {/* 원본 글 */}
                {selectedPost.content && (
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "0.75rem",
                    marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #efefef"
                  }}>
                    <img
                      src={selectedPost.userId?.profileImg ? `http://localhost:5000${selectedPost.userId.profileImg}` : '/default-profile.svg'}
                      alt="profile"
                      style={{ width: "2rem", height: "2rem", borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => { e.target.src = '/default-profile.svg' }}
                    />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: "1.4" }}>
                        <span style={{ fontWeight: "600", marginRight: "0.5rem" }}>
                          {selectedPost.userId?.nickname || selectedPost.userId?.username || '익명'}
                        </span>
                        {selectedPost.content}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#8e8e8e", margin: "0.5rem 0 0 0" }}>
                        {selectedPost.createdAt && new Date(selectedPost.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <CommentSection 
                  postId={selectedPost._id} 
                  onCommentAdded={(newCount) => handleCommentAdded(selectedPost._id, newCount)}
                  isInstagramStyle={true}
                  showInput={false}
                />
              </div>

              {/* 하단: 감정 버튼 + 좋아요 수 + 날짜 + 댓글 입력 */}
              <div style={{ borderTop: "1px solid #efefef" }}>
                <div style={{ padding: "0.5rem 1rem 0 1rem" }}>
                  <EmotionButtons 
                    postId={selectedPost._id} 
                    commentCount={commentCounts[selectedPost._id] || 0}
                    isInstagramStyle={true}
                    onCommentClick={() => {}}
                    showAllEmotions={true}
                  />
                </div>
                <div style={{ padding: "0 1rem", fontSize: "0.875rem", fontWeight: "600", color: "#262626" }}>
                  좋아요 {(selectedPost.reactions?.happy?.length || 0).toLocaleString()}개
                </div>
                <div style={{ padding: "0.25rem 1rem 0.5rem", fontSize: "0.625rem", color: "#8e8e8e" }}>
                  {selectedPost.createdAt && new Date(selectedPost.createdAt).toLocaleDateString()}
                </div>
                {/* 댓글 입력 */}
                <div style={{ borderTop: "1px solid #efefef", padding: "0.5rem 1rem" }}>
                  <CommentSection 
                    postId={selectedPost._id} 
                    onCommentAdded={(newCount) => handleCommentAdded(selectedPost._id, newCount)}
                    isInstagramStyle={true}
                    showInput={true}
                    showListOnly={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

