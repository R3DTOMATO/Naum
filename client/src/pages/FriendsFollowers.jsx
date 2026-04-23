import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function FriendsFollowersPage() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('friends') // 'friends', 'followers', 'following'
  const [friends, setFriends] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    fetchAllData()
  }, [currentUser])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 친구 목록
      try {
        const friendsResponse = await api.get('/users/friends')
        setFriends(friendsResponse.data)
      } catch (friendErr) {
        console.error('친구 목록 로딩 오류:', friendErr.response?.data || friendErr.message)
        setFriends([]) // 빈 배열로 설정
      }

      // 팔로워 목록
      try {
        const followersResponse = await api.get('/users/followers')
        setFollowers(followersResponse.data)
      } catch (followerErr) {
        console.error('팔로워 목록 로딩 오류:', followerErr.response?.data || followerErr.message)
        setFollowers([]) // 빈 배열로 설정
      }

      // 팔로잉 목록
      try {
        const followingResponse = await api.get('/users/following')
        setFollowing(followingResponse.data)
      } catch (followingErr) {
        console.error('팔로잉 목록 로딩 오류:', followingErr.response?.data || followingErr.message)
        setFollowing([]) // 빈 배열로 설정
      }

    } catch (err) {
      console.error('전체 데이터 로딩 오류:', err)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('정말 친구를 삭제하시겠습니까?')) return
    
    try {
      await api.delete(`/users/friend/${friendId}`)
      alert('친구를 삭제했습니다.')
      fetchAllData() // 데이터 새로고침
    } catch (error) {
      alert(error.response?.data?.message || '친구 삭제에 실패했습니다.')
    }
  }

  const handleUnfollow = async (userId) => {
    try {
      await api.post(`/users/unfollow/${userId}`)
      alert('언팔로우했습니다.')
      fetchAllData() // 데이터 새로고침
    } catch (error) {
      alert(error.response?.data?.message || '언팔로우에 실패했습니다.')
    }
  }

  const renderUserList = (users, type) => {
    if (users.length === 0) {
      const emptyMessage = {
        friends: '친구가 없습니다.',
        followers: '팔로워가 없습니다.',
        following: '팔로잉 중인 사용자가 없습니다.'
      }
      
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {type === 'friends' ? '👥' : type === 'followers' ? '👤' : '➕'}
          </div>
          <p style={{ color: '#6B7280' }}>{emptyMessage[type]}</p>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users.map(user => (
          <div 
            key={user._id} 
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
              <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none' }}>
                <img
                  src={user.profileImg ? `http://localhost:5000${user.profileImg}` : '/default-profile.svg'}
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
                  to={`/profile/${user._id}`} 
                  style={{ 
                    textDecoration: 'none',
                    color: '#1f2937',
                    fontWeight: '600'
                  }}
                >
                  {user.nickname || user.username}
                </Link>
                <p style={{ 
                  margin: '0.25rem 0 0 0', 
                  fontSize: '0.875rem', 
                  color: '#6b7280' 
                }}>
                  @{user.username}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link 
                to={`/profile/${user._id}`}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                👁️ 프로필 보기
              </Link>
              
              {type === 'friends' && (
                <>
                  <Link 
                    to={`/messages/${user._id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    💬 메시지
                  </Link>
                  <button
                    onClick={() => handleRemoveFriend(user._id)}
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
                    ❌ 친구 삭제
                  </button>
                </>
              )}
              
              {type === 'following' && (
                <button
                  onClick={() => handleUnfollow(user._id)}
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
                  👥 언팔로우
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) return <div style={{ padding: '1.5rem' }}>🔄 로딩 중...</div>
  if (error) return <div style={{ padding: '1.5rem', color: 'red' }}>❌ {error}</div>

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        👥 친구 & 팔로우 관리
      </h1>

      {/* 탭 네비게이션 */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { key: 'friends', label: `👥 친구 (${friends.length})`, count: friends.length },
          { key: 'followers', label: `👤 팔로워 (${followers.length})`, count: followers.length },
          { key: 'following', label: `➕ 팔로잉 (${following.length})`, count: following.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: activeTab === tab.key ? '#3b82f6' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '0.5rem 0.5rem 0 0',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div>
        {activeTab === 'friends' && (
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'semibold', 
              marginBottom: '1rem'
            }}>
              👥 친구 목록 ({friends.length}명)
            </h2>
            {renderUserList(friends, 'friends')}
          </div>
        )}

        {activeTab === 'followers' && (
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'semibold', 
              marginBottom: '1rem'
            }}>
              👤 나를 팔로우하는 사람 ({followers.length}명)
            </h2>
            {renderUserList(followers, 'followers')}
          </div>
        )}

        {activeTab === 'following' && (
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'semibold', 
              marginBottom: '1rem'
            }}>
              ➕ 내가 팔로우하는 사람 ({following.length}명)
            </h2>
            {renderUserList(following, 'following')}
          </div>
        )}
      </div>
    </div>
  )
}