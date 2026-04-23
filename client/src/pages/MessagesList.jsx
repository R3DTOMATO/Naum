import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function MessagesListPage() {
  const { user: currentUser } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    if (!currentUser) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    fetchConversations()
  }, [currentUser])

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/messages/conversations')
      setConversations(response.data)
    } catch (err) {
      console.error('대화 목록 로딩 오류:', err)
      setError('대화 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString()
  }

  if (loading) return (
    <div style={{ 
      padding: '1.5rem',
      textAlign: 'center',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>🔄 로딩 중...</div>
  )
  
  if (error) return (
    <div style={{ 
      padding: '1.5rem', 
      color: 'red',
      textAlign: 'center',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>❌ {error}</div>
  )

  return (
    <div style={{ 
      maxWidth: isMobile ? '100%' : '48rem', 
      margin: isMobile ? '0' : '0 auto', 
      padding: isMobile ? '0' : '1.5rem',
      minHeight: isMobile ? '100vh' : 'calc(100vh - 8rem)'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #B31B1B 0%, #9b1c1c 100%)',
        borderRadius: isMobile ? '0' : '1.5rem',
        padding: isMobile ? '2rem 1.25rem 2.5rem' : '2rem',
        marginBottom: isMobile ? '0' : '2rem',
        boxShadow: isMobile ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ 
              fontSize: isMobile ? '1.5rem' : '2rem', 
              fontWeight: '800', 
              margin: '0 0 0.5rem 0',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              💬 메시지
            </h1>
            <p style={{ 
              margin: '0', 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '0.875rem'
            }}>
              친구들과 대화를 확인해보세요
            </p>
          </div>
          <Link
            to="/friends"
            style={{
              padding: isMobile ? '0.625rem 1.25rem' : '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: isMobile ? '0.875rem' : '1rem',
              fontSize: isMobile ? '0.8125rem' : '0.875rem',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            👥 친구 목록
          </Link>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: isMobile ? '3rem 1.25rem' : '4rem 2rem', 
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          borderRadius: isMobile ? '0' : '1.5rem',
          border: '1px solid rgba(179, 27, 27, 0.1)',
          boxShadow: isMobile ? 'none' : '0 10px 25px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(10px)',
          margin: isMobile ? '0' : '0'
        }}>
          <div style={{ 
            fontSize: isMobile ? '4rem' : '5rem', 
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #B31B1B 0%, #9b1c1c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>💬</div>
          <h3 style={{ 
            color: '#374151', 
            fontSize: isMobile ? '1.125rem' : '1.25rem', 
            fontWeight: '700',
            marginBottom: '0.75rem',
            margin: '0 0 0.75rem 0'
          }}>
            아직 메시지 대화가 없습니다
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: isMobile ? '0.875rem' : '1rem', 
            margin: '0 0 2rem 0',
            lineHeight: '1.6'
          }}>
            친구들과 메시지를 주고받아보세요!
          </p>
          <Link
            to="/friends"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #B31B1B 0%, #9b1c1c 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '1.5rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              boxShadow: '0 8px 16px rgba(179, 27, 27, 0.3), 0 3px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 12px 20px rgba(179, 27, 27, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 16px rgba(179, 27, 27, 0.3), 0 3px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            👥 친구 목록 보기
          </Link>
        </div>
      ) : (
        <div style={{ 
          borderRadius: isMobile ? '0' : '1.5rem',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(179, 27, 27, 0.1)',
          boxShadow: isMobile ? 'none' : '0 10px 25px rgba(0, 0, 0, 0.08)',
          margin: isMobile ? '0' : '0'
        }}>
          {conversations.map(conv => (
            <Link
              key={conv.conversationId}
              to={`/messages/${conv.partner._id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                backgroundColor: 'transparent',
                borderBottom: conv.conversationId !== conversations[conversations.length - 1].conversationId 
                  ? '1px solid rgba(179, 27, 27, 0.08)' 
                  : 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(179, 27, 27, 0.05)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
              >
                {/* 프로필 이미지 */}
                <div style={{ position: 'relative', marginRight: isMobile ? '1rem' : '1.25rem' }}>
                  <img
                    src={conv.partner.profileImg ? `http://localhost:5000${conv.partner.profileImg}` : '/default-profile.svg'}
                    alt="프로필"
                    style={{
                      width: isMobile ? '3rem' : '3.5rem',
                      height: isMobile ? '3rem' : '3.5rem',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(179, 27, 27, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onError={(e) => {
                      e.target.src = '/default-profile.svg'
                    }}
                  />
                  {conv.unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                    }}>
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </div>
                  )}
                </div>

                {/* 대화 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem' 
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: conv.unreadCount > 0 ? '700' : '600',
                      margin: '0',
                      color: conv.unreadCount > 0 ? '#1f2937' : '#374151',
                      background: conv.unreadCount > 0 
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : 'none',
                      WebkitBackgroundClip: conv.unreadCount > 0 ? 'text' : 'unset',
                      WebkitTextFillColor: conv.unreadCount > 0 ? 'transparent' : 'unset',
                      backgroundClip: conv.unreadCount > 0 ? 'text' : 'unset'
                    }}>
                      {conv.partner.nickname || conv.partner.username}
                    </h3>
                    <span style={{
                      fontSize: '0.8125rem',
                      color: conv.unreadCount > 0 ? '#6366f1' : '#9ca3af',
                      flexShrink: 0,
                      fontWeight: conv.unreadCount > 0 ? '600' : '500',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: conv.unreadCount > 0 ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      borderRadius: '1rem'
                    }}>
                      {formatTimeAgo(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.8125rem',
                      color: '#8b5cf6',
                      fontWeight: conv.lastMessage.isFromMe ? '600' : '500'
                    }}>
                      {conv.lastMessage.isFromMe && '나: '}
                    </span>
                    <p style={{
                      fontSize: '0.9375rem',
                      color: conv.unreadCount > 0 ? '#1f2937' : '#6b7280',
                      fontWeight: conv.unreadCount > 0 ? '600' : '400',
                      margin: '0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.5'
                    }}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}