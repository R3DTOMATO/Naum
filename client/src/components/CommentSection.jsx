import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function CommentSection({ postId, onCommentAdded, isInstagramStyle = false, showInput = true, showListOnly }) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/posts/${postId}/comments`)
        setComments(response.data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchComments()
    }
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || !comment.trim() || submitting) return

    try {
      setSubmitting(true)
      const response = await api.post(`/posts/${postId}/comments`, {
        content: comment.trim()
      })
      
      // 새 댓글을 기존 댓글 목록에 추가
      const newComments = [...comments, response.data];
      setComments(newComments);
      setComment('');
      
      // 부모 컴포넌트에게 댓글 추가된 것을 알림
      if (onCommentAdded) {
        onCommentAdded(newComments.length);
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('댓글 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: isInstagramStyle ? "1rem 0" : "1rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#8e8e8e" }}>댓글 로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={isInstagramStyle ? { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.75rem' 
    } : { 
      marginTop: "1rem" 
    }}>
      {/* 댓글 목록 */}
      {showListOnly !== false && (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isInstagramStyle ? '0.75rem' : '0.5rem',
        maxHeight: isInstagramStyle ? 'none' : '300px',
        overflowY: isInstagramStyle ? 'visible' : 'auto'
      }}>
        {comments.length === 0 ? (
          <p style={{ 
            color: "#8e8e8e", 
            textAlign: "center", 
            padding: "1rem",
            fontSize: isInstagramStyle ? "0.9rem" : "0.875rem"
          }}>
            아직 댓글이 없습니다.
          </p>
        ) : (
          comments.map(c => (
            <div key={c._id} style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: isInstagramStyle ? "0.75rem" : "0.5rem"
            }}>
              <img
                src={c.userId?.profileImg ? `http://localhost:5000${c.userId.profileImg}` : '/default-profile.svg'}
                alt="프로필"
                style={{ 
                  width: isInstagramStyle ? "2rem" : "1.5rem", 
                  height: isInstagramStyle ? "2rem" : "1.5rem", 
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  e.target.src = '/default-profile.svg'
                }}
              />
              <div style={{ flex: 1 }}>
                {isInstagramStyle ? (
                  <p style={{
                    margin: '0',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ 
                      fontWeight: "600", 
                      marginRight: "0.5rem",
                      color: "#262626"
                    }}>
                      {c.userId?.nickname || c.userId?.username || c.username || '익명'}
                    </span>
                    {c.content}
                  </p>
                ) : (
                  <div>
                    <span style={{ fontWeight: "600" }}>{c.userId?.nickname || c.userId?.username || c.username || '익명'}:</span>
                    <span style={{ marginLeft: "0.5rem" }}>{c.content}</span>
                  </div>
                )}
                {c.createdAt && (
                  <div style={{ 
                    fontSize: isInstagramStyle ? "0.75rem" : "0.75rem", 
                    color: "#8e8e8e", 
                    marginTop: "0.25rem" 
                  }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      )}
      
      {/* 댓글 입력 */}
      {user && showInput && (
        <form onSubmit={handleSubmit} style={{
          display: "flex", 
          gap: isInstagramStyle ? "0.75rem" : "0.5rem",
          alignItems: "center",
          padding: isInstagramStyle ? "0.75rem 0 0 0" : "0.75rem 0",
          borderTop: isInstagramStyle ? "1px solid #efefef" : "none"
        }}>
          {isInstagramStyle && (
            <div style={{
              fontSize: '1.25rem',
              cursor: 'pointer'
            }}>
              😊
            </div>
          )}
          <input
            type="text"
            placeholder={isInstagramStyle ? "Add a comment..." : "댓글을 입력하세요"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            style={{ 
              flex: 1, 
              border: isInstagramStyle ? "none" : "1px solid #D1D5DB", 
              borderRadius: isInstagramStyle ? "0" : "0.5rem", 
              padding: isInstagramStyle ? "0.5rem 0" : "0.5rem", 
              fontSize: isInstagramStyle ? "0.9rem" : "0.875rem",
              outline: "none",
              backgroundColor: "transparent",
              borderBottom: isInstagramStyle ? "1px solid #dbdbdb" : "none"
            }}
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            style={{ 
              backgroundColor: isInstagramStyle ? "transparent" : (submitting || !comment.trim() ? "#9CA3AF" : "#B31B1B"), 
              color: isInstagramStyle ? (submitting || !comment.trim() ? "#c7c7c7" : "#0095f6") : "white", 
              padding: isInstagramStyle ? "0.5rem 0" : "0.25rem 0.75rem", 
              borderRadius: isInstagramStyle ? "0" : "0.5rem",
              border: "none",
              cursor: submitting || !comment.trim() ? "not-allowed" : "pointer",
              fontSize: isInstagramStyle ? "0.9rem" : "0.875rem",
              fontWeight: isInstagramStyle ? "600" : "normal"
            }}
          >
            {submitting ? (isInstagramStyle ? 'Posting...' : '등록 중...') : (isInstagramStyle ? 'Post' : '등록')}
          </button>
        </form>
      )}
    </div>
  )
}
