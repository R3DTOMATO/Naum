import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function FriendRequestsPage() {
  const { user: currentUser } = useAuth()
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    fetchFriendRequests()
  }, [currentUser])

  const fetchFriendRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // 받은 친구 요청
      const receivedResponse = await api.get('/users/friend-requests/received')
      setReceivedRequests(receivedResponse.data)

      // 보낸 친구 요청
      const sentResponse = await api.get('/users/friend-requests/sent')
      setSentRequests(sentResponse.data)

    } catch (err) {
      console.error('친구 요청 목록 로딩 오류:', err)
      setError('친구 요청 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (senderId) => {
    try {
      await api.post(`/users/friend-request/accept/${senderId}`)
      alert('친구 요청을 수락했습니다.')
      fetchFriendRequests() // 목록 새로고침
    } catch (error) {
      alert(error.response?.data?.message || '친구 요청 수락에 실패했습니다.')
    }
  }

  const handleRejectRequest = async (senderId) => {
    try {
      await api.post(`/users/friend-request/reject/${senderId}`)
      alert('친구 요청을 거부했습니다.')
      fetchFriendRequests() // 목록 새로고침
    } catch (error) {
      alert(error.response?.data?.message || '친구 요청 거부에 실패했습니다.')
    }
  }

  if (loading) return <div style={{ padding: '1.5rem' }}>🔄 로딩 중...</div>
  if (error) return <div style={{ padding: '1.5rem', color: 'red' }}>❌ {error}</div>

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        👥 친구 요청 관리
      </h1>

      {/* 받은 친구 요청 */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'semibold', 
          marginBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem'
        }}>
          📥 받은 친구 요청 ({receivedRequests.length}개)
        </h2>

        {receivedRequests.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ color: '#6B7280' }}>받은 친구 요청이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receivedRequests.map(request => (
              <div 
                key={request._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={`/profile/${request.from._id}`} style={{ textDecoration: 'none' }}>
                    <img
                      src={request.from.profileImg ? `http://localhost:5000${request.from.profileImg}` : '/default-profile.svg'}
                      alt="프로필"
                      style={{ 
                        width: '3rem', 
                        height: '3rem', 
                        borderRadius: '9999px', 
                        objectFit: 'cover',
                        border: '2px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.target.src = '/default-profile.svg';
                      }}
                    />
                  </Link>
                  <div>
                    <Link 
                      to={`/profile/${request.from._id}`} 
                      style={{ 
                        textDecoration: 'none',
                        color: '#1f2937',
                        fontWeight: '600'
                      }}
                    >
                      {request.from.nickname || request.from.username}
                    </Link>
                    <p style={{ 
                      margin: '0.25rem 0 0 0', 
                      fontSize: '0.875rem', 
                      color: '#6b7280' 
                    }}>
                      @{request.from.username}
                    </p>
                    {request.date && (
                      <p style={{ 
                        margin: '0.25rem 0 0 0', 
                        fontSize: '0.75rem', 
                        color: '#9ca3af' 
                      }}>
                        {new Date(request.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAcceptRequest(request.from._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ✅ 수락
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.from._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ❌ 거부
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 보낸 친구 요청 */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'semibold', 
          marginBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem'
        }}>
          📤 보낸 친구 요청 ({sentRequests.length}개)
        </h2>

        {sentRequests.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
            <p style={{ color: '#6B7280' }}>보낸 친구 요청이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sentRequests.map(request => (
              <div 
                key={request._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={`/profile/${request.to._id}`} style={{ textDecoration: 'none' }}>
                    <img
                      src={request.to.profileImg ? `http://localhost:5000${request.to.profileImg}` : '/default-profile.svg'}
                      alt="프로필"
                      style={{ 
                        width: '3rem', 
                        height: '3rem', 
                        borderRadius: '9999px', 
                        objectFit: 'cover',
                        border: '2px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.target.src = '/default-profile.svg';
                      }}
                    />
                  </Link>
                  <div>
                    <Link 
                      to={`/profile/${request.to._id}`} 
                      style={{ 
                        textDecoration: 'none',
                        color: '#1f2937',
                        fontWeight: '600'
                      }}
                    >
                      {request.to.nickname || request.to.username}
                    </Link>
                    <p style={{ 
                      margin: '0.25rem 0 0 0', 
                      fontSize: '0.875rem', 
                      color: '#6b7280' 
                    }}>
                      @{request.to.username}
                    </p>
                    {request.date && (
                      <p style={{ 
                        margin: '0.25rem 0 0 0', 
                        fontSize: '0.75rem', 
                        color: '#9ca3af' 
                      }}>
                        {new Date(request.date).toLocaleDateString()}에 요청
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  ⏳ 대기 중
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}