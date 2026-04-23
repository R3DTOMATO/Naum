import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function FriendFollowButtons({ targetUserId, userData, onUpdate }) {
  const { user: currentUser } = useAuth()
  const [relationshipStatus, setRelationshipStatus] = useState({
    isFriend: false,
    isFollowing: false,
    hasReceivedFriendRequest: false,
    hasSentFriendRequest: false
  })
  const [loading, setLoading] = useState(false)

  // 관계 상태 확인
  useEffect(() => {
    if (!targetUserId || !currentUser || !userData) return

    const checkRelationship = () => {
      const isFriend = userData.friends?.some(friend => 
        (friend._id || friend) === currentUser.id
      )
      const isFollowing = userData.followers?.some(follower => 
        (follower._id || follower) === currentUser.id
      )
      
      // 친구 요청 상태는 별도 API 호출로 확인
      fetchFriendRequestStatus()

      setRelationshipStatus(prev => ({
        ...prev,
        isFriend,
        isFollowing
      }))
    }

    checkRelationship()
  }, [targetUserId, currentUser, userData])

  const fetchFriendRequestStatus = async () => {
    try {
      // 받은 친구 요청 확인
      const receivedResponse = await api.get('/users/friend-requests/received')
      const hasReceivedFriendRequest = receivedResponse.data.some(
        request => request.from._id === targetUserId
      )

      // 보낸 친구 요청 확인
      const sentResponse = await api.get('/users/friend-requests/sent')
      const hasSentFriendRequest = sentResponse.data.some(
        request => request.to._id === targetUserId
      )

      setRelationshipStatus(prev => ({
        ...prev,
        hasReceivedFriendRequest,
        hasSentFriendRequest
      }))
    } catch (error) {
      console.error('친구 요청 상태 확인 오류:', error)
    }
  }

  const handleFriendRequest = async () => {
    setLoading(true)
    try {
      await api.post(`/users/friend-request/${targetUserId}`)
      setRelationshipStatus(prev => ({ ...prev, hasSentFriendRequest: true }))
      alert('친구 요청을 보냈습니다.')
    } catch (error) {
      alert(error.response?.data?.message || '친구 요청 보내기에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleAcceptFriend = async () => {
    setLoading(true)
    try {
      await api.post(`/users/friend-request/accept/${targetUserId}`)
      setRelationshipStatus(prev => ({
        ...prev,
        isFriend: true,
        hasReceivedFriendRequest: false
      }))
      if (onUpdate) onUpdate()
      alert('친구 요청을 수락했습니다.')
    } catch (error) {
      alert(error.response?.data?.message || '친구 요청 수락에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleRejectFriend = async () => {
    setLoading(true)
    try {
      await api.post(`/users/friend-request/reject/${targetUserId}`)
      setRelationshipStatus(prev => ({
        ...prev,
        hasReceivedFriendRequest: false
      }))
      alert('친구 요청을 거부했습니다.')
    } catch (error) {
      alert(error.response?.data?.message || '친구 요청 거부에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleRemoveFriend = async () => {
    if (!window.confirm('정말 친구를 삭제하시겠습니까?')) return
    
    setLoading(true)
    try {
      await api.delete(`/users/friend/${targetUserId}`)
      setRelationshipStatus(prev => ({ ...prev, isFriend: false }))
      if (onUpdate) onUpdate()
      alert('친구를 삭제했습니다.')
    } catch (error) {
      alert(error.response?.data?.message || '친구 삭제에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleFollow = async () => {
    setLoading(true)
    try {
      await api.post(`/users/follow/${targetUserId}`)
      setRelationshipStatus(prev => ({ ...prev, isFollowing: true }))
      if (onUpdate) onUpdate()
      alert('팔로우를 시작했습니다.')
    } catch (error) {
      alert(error.response?.data?.message || '팔로우에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleUnfollow = async () => {
    setLoading(true)
    try {
      await api.post(`/users/unfollow/${targetUserId}`)
      setRelationshipStatus(prev => ({ ...prev, isFollowing: false }))
      if (onUpdate) onUpdate()
      alert('언팔로우했습니다.')
    } catch (error) {
      alert(error.response?.data?.message || '언팔로우에 실패했습니다.')
    }
    setLoading(false)
  }

  // 현재 사용자 자신의 프로필인 경우 버튼 표시하지 않음
  if (!targetUserId || !currentUser || targetUserId === currentUser.id) {
    return null
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      {/* 친구 관련 버튼 */}
      {relationshipStatus.isFriend ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            to={`/messages/${targetUserId}`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              display: 'inline-block'
            }}
          >
            💬 메시지 보내기
          </Link>
          <button
            onClick={handleRemoveFriend}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '처리 중...' : '👥 친구 삭제'}
          </button>
        </div>
      ) : relationshipStatus.hasReceivedFriendRequest ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAcceptFriend}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '처리 중...' : '✅ 친구 수락'}
          </button>
          <button
            onClick={handleRejectFriend}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '처리 중...' : '❌ 친구 거부'}
          </button>
        </div>
      ) : relationshipStatus.hasSentFriendRequest ? (
        <button
          disabled={true}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'not-allowed',
            opacity: 0.8
          }}
        >
          ⏳ 친구 요청 대기 중
        </button>
      ) : (
        <button
          onClick={handleFriendRequest}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '처리 중...' : '👤 친구 요청'}
        </button>
      )}

      {/* 팔로우 관련 버튼 */}
      {relationshipStatus.isFollowing ? (
        <button
          onClick={handleUnfollow}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '처리 중...' : '👥 언팔로우'}
        </button>
      ) : (
        <button
          onClick={handleFollow}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '처리 중...' : '➕ 팔로우'}
        </button>
      )}
    </div>
  )
}