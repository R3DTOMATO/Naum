import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { useParams, Link } from 'react-router-dom'

export default function MessageConversationPage() {
  const { partnerId } = useParams()
  const { user: currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [partnerInfo, setPartnerInfo] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!currentUser || !partnerId) {
      setError('잘못된 접근입니다.')
      setLoading(false)
      return
    }

    fetchMessages()
    markMessagesAsRead()
  }, [currentUser, partnerId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 파트너 정보 가져오기
      const partnerResponse = await api.get(`/users/${partnerId}`)
      setPartnerInfo(partnerResponse.data)
      
      // 메시지 목록 가져오기
      const messagesResponse = await api.get(`/messages/conversation/${partnerId}`)
      setMessages(messagesResponse.data)
    } catch (err) {
      console.error('메시지 로딩 오류:', err)
      if (err.response?.status === 403) {
        setError('친구한테만 메시지를 보낼 수 있습니다.')
      } else {
        setError('메시지를 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      await api.put(`/messages/read/${partnerId}`)
    } catch (err) {
      console.error('메시지 읽음 표시 오류:', err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return
    
    try {
      setSending(true)
      
      const response = await api.post('/messages/send', {
        receiverId: partnerId,
        content: newMessage.trim()
      })
      
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      
      // 텍스트 영역 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px'
      }
    } catch (err) {
      console.error('메시지 전송 오류:', err)
      if (err.response?.status === 403) {
        alert('친구한테만 메시지를 보낼 수 있습니다.')
      } else {
        alert('메시지 전송에 실패했습니다.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value)
    
    // 자동 높이 조절
    const textarea = e.target
    textarea.style.height = '40px'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
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
      textAlign: 'center',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ color: 'red', marginBottom: '1rem' }}>❌ {error}</div>
      <Link 
        to="/messages" 
        style={{ 
          color: '#B31B1B', 
          textDecoration: 'none',
          padding: '1rem 2rem',
          border: '2px solid #B31B1B',
          borderRadius: '1.5rem',
          transition: 'all 0.3s ease'
        }}
      >
        ← 메시지 목록으로 돌아가기
      </Link>
    </div>
  )

  return (
    <div style={{ 
      maxWidth: isMobile ? '100%' : '48rem', 
      margin: isMobile ? '0' : '0 auto',
      height: isMobile ? '100vh' : 'calc(100vh - 4rem)',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: isMobile ? '0' : '1.5rem',
      overflow: 'hidden',
      boxShadow: isMobile ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '1rem 1.25rem' : '1.5rem 2rem',
        background: 'linear-gradient(135deg, #B31B1B 0%, #9b1c1c 100%)',
        color: 'white',
        position: 'relative',
        minHeight: isMobile ? '60px' : 'auto',
        '&::after': {
          content: '',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(255, 255, 255, 0.2)'
        }
      }}>  
        <Link 
          to="/messages" 
          style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            textDecoration: 'none',
            marginRight: isMobile ? '0.75rem' : '1rem',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: '600',
            padding: isMobile ? '0.625rem' : '0.5rem',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: isMobile ? '40px' : '44px',
            minHeight: isMobile ? '40px' : '44px'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.15)'
            e.target.style.color = 'white'
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
        >
          ←
        </Link>
        <img
          src={partnerInfo?.profileImg ? `http://localhost:5000${partnerInfo.profileImg}` : '/default-profile.svg'}
          alt="프로필"
          style={{
            width: isMobile ? '2.5rem' : '3rem',
            height: isMobile ? '2.5rem' : '3rem',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: isMobile ? '0.5rem' : '1rem',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onError={(e) => {
            e.target.src = '/default-profile.svg'
          }}
        />
        <div>
          <h2 style={{ 
            fontSize: isMobile ? '1.125rem' : '1.25rem', 
            fontWeight: '700', 
            margin: '0', 
            color: 'white' 
          }}>
            {partnerInfo?.nickname || partnerInfo?.username}
          </h2>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'rgba(255, 255, 255, 0.7)', 
            margin: '0.25rem 0 0 0' 
          }}>
            @{partnerInfo?.username}
          </p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: isMobile ? '1rem' : '1.5rem',
        backgroundColor: 'transparent',
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(179, 27, 27, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(155, 28, 28, 0.05) 0%, transparent 50%)',
        paddingBottom: isMobile ? '1rem' : '1.5rem'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: '#6b7280'
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '1rem', 
              filter: 'grayscale(0.3)',
              opacity: '0.7'
            }}>💬</div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>아직 메시지가 없습니다</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((message, index) => {
              const isFromMe = message.sender._id === currentUser.id
              const showAvatar = index === 0 || 
                               messages[index - 1].sender._id !== message.sender._id
              
              return (
                <div key={message._id} style={{
                  display: 'flex',
                  flexDirection: isFromMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}>
                  {!isFromMe && (
                    <div style={{ width: '2rem', height: '2rem' }}>
                      {showAvatar && (
                        <img
                          src={message.sender.profileImg ? `http://localhost:5000${message.sender.profileImg}` : '/default-profile.svg'}
                          alt="프로필"
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '9999px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = '/default-profile.svg'
                          }}
                        />
                      )}
                    </div>
                  )}
                  
                  <div style={{
                    maxWidth: isMobile ? '85%' : '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isFromMe ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem',
                      background: isFromMe 
                        ? 'linear-gradient(135deg, #B31B1B 0%, #9b1c1c 100%)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      color: isFromMe ? 'white' : '#1f2937',
                      borderRadius: isFromMe ? '1.5rem 1.5rem 0.375rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.375rem',
                      boxShadow: isFromMe 
                        ? '0 8px 16px rgba(179, 27, 27, 0.3), 0 3px 6px rgba(0, 0, 0, 0.1)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
                      wordBreak: 'break-word',
                      fontSize: isMobile ? '0.875rem' : '0.9375rem',
                      lineHeight: '1.5',
                      backdropFilter: 'blur(10px)',
                      border: isFromMe ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      {message.content}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: isFromMe ? 'rgba(179, 27, 27, 0.7)' : '#9ca3af',
                      marginTop: '0.5rem',
                      paddingLeft: isFromMe ? '0' : '0.5rem',
                      paddingRight: isFromMe ? '0.5rem' : '0',
                      fontWeight: '500'
                    }}>
                      {formatMessageTime(message.createdAt)}
                      {isFromMe && message.isRead && ' · 읽음'}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력 */}
      <form onSubmit={sendMessage} style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: isMobile ? '0.5rem' : '0.75rem',
        padding: isMobile ? '1rem 1.25rem' : '1.5rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(179, 27, 27, 0.1)',
        position: 'relative',
        paddingBottom: isMobile ? 'calc(1rem + env(safe-area-inset-bottom))' : '1.5rem'
      }}>
        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          placeholder={isMobile ? "메시지 입력..." : "메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"}
          disabled={sending}
          style={{
            flex: 1,
            minHeight: isMobile ? '44px' : '48px',
            maxHeight: isMobile ? '100px' : '120px',
            padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
            border: '2px solid rgba(179, 27, 27, 0.1)',
            borderRadius: isMobile ? '1.25rem' : '1.5rem',
            resize: 'none',
            fontSize: isMobile ? '1rem' : '0.9375rem',
            fontFamily: 'inherit',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#B31B1B'
            e.target.style.boxShadow = '0 0 0 3px rgba(179, 27, 27, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(179, 27, 27, 0.1)'
            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        />
        {/* 전송 버튼 - 메시지가 있을 때만 나타남 */}
        {newMessage.trim() && (
          <button
            type="submit"
            disabled={sending}
            style={{
              padding: isMobile ? '0.875rem' : '1rem',
              width: isMobile ? '44px' : '3.5rem',
              height: isMobile ? '44px' : '3.5rem',
              background: sending 
                ? 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)' 
                : 'linear-gradient(135deg, #B31B1B 0%, #9b1c1c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: isMobile ? '1.125rem' : '1.25rem',
              cursor: sending ? 'not-allowed' : 'pointer',
              boxShadow: sending 
                ? 'none' 
                : '0 8px 16px rgba(179, 27, 27, 0.3), 0 3px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0) scale(1)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              if (!sending) {
                e.target.style.transform = 'translateY(-2px) scale(1.05)'
                e.target.style.boxShadow = '0 12px 20px rgba(179, 27, 27, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
            onMouseOut={(e) => {
              if (!sending) {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 8px 16px rgba(179, 27, 27, 0.3), 0 3px 6px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {sending ? '⏳' : '📨'}
          </button>
        )}
      </form>
    </div>
  )
}