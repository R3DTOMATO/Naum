// src/pages/PublicProfilePage.jsx
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import FriendFollowButtons from '../components/FriendFollowButtons'

export default function PublicProfilePage() {
  const { userId: urlUserId } = useParams()
  const { user: currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // URL에서 userId가 없으면 현재 로그인한 사용자의 ID 사용
  const userId = urlUserId || currentUser?.id

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 사용자 정보 가져오기
      const userResponse = await api.get(`/users/${userId}`)
      setUserData(userResponse.data)

      // 사용자의 게시물 가져오기
      const postsResponse = await api.get(`/posts/user/${userId}`)
      setPosts(postsResponse.data)
      
    } catch (err) {
      console.error('프로필 페이지 오류:', err)
      setError('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentUser) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    if (!userId || userId === 'undefined') {
      setError('사용자 정보를 불러올 수 없습니다.')
      setLoading(false)
      return
    }

    console.log('Loading profile for userId:', userId)  // 디버깅용

    fetchData()
  }, [userId, currentUser])

  const handleProfileUpdate = () => {
    fetchData() // 프로필 데이터 새로고침
  }

  if (loading) return <div style={{ padding: '1.5rem' }}>🔄 프로필 로딩 중...</div>
  if (error) return <div style={{ padding: '1.5rem', color: 'red' }}>❌ {error}</div>
  if (!userData) return <div style={{ padding: '1.5rem', color: 'red' }}>❌ 유저를 찾을 수 없습니다.</div>

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
        <img
          src={userData.profileImg ? `http://localhost:5000${userData.profileImg}` : '/default-profile.svg'}
          alt="프로필"
          style={{ 
            width: '6rem', 
            height: '6rem', 
            borderRadius: '9999px', 
            objectFit: 'cover', 
            border: '3px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            flexShrink: 0
          }}
          onError={(e) => {
            e.target.src = '/default-profile.svg';
          }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
            {userData.nickname || userData.username || '사용자명 없음'}
            {userId === currentUser?.id && (
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                (내 프로필)
              </span>
            )}
          </h2>
          <p style={{ color: '#4B5563', margin: '0' }}>
            @{userData.username || '사용자명 없음'}
          </p>
          {userData.email && (
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              📧 {userData.email}
            </p>
          )}
          {userData.bio && (
            <p style={{ color: '#4B5563', fontSize: '0.875rem', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
              💭 {userData.bio}
            </p>
          )}
          {userData.date && (
            <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
              📅 가입일: {new Date(userData.date).toLocaleDateString()}
            </p>
          )}
          
          {/* 통계 정보 */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginTop: '0.75rem', 
            fontSize: '0.875rem', 
            color: '#4B5563' 
          }}>
            <span>📄 게시물 {posts.length}개</span>
            <span>👥 친구 {userData.friends?.length || 0}명</span>
            <span>👤 팔로워 {userData.followers?.length || 0}명</span>
            <span>➕ 팔로잉 {userData.following?.length || 0}명</span>
          </div>
          
          {/* 친구/팔로우 버튼 */}
          <FriendFollowButtons 
            targetUserId={userId} 
            userData={userData}
            onUpdate={handleProfileUpdate}
          />
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1rem', color: '#1f2937' }}>
        📄 작성한 게시물 ({posts.length}개)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ color: '#6B7280', fontSize: '1rem' }}>
              아직 게시물이 없습니다.
            </p>
            {userId === currentUser?.id && (
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                첫 번째 게시물을 작성해보세요!
              </p>
            )}
          </div>
        ) : (
          posts.map(post => {
            // 감정별 반응 수 계산
            const getTotalReactions = (reactions) => {
              if (!reactions) return 0;
              return (reactions.happy?.length || 0) + 
                     (reactions.sad?.length || 0) + 
                     (reactions.angry?.length || 0) + 
                     (reactions.fear?.length || 0) + 
                     (reactions.surprise?.length || 0);
            };
            
            return (
              <div key={post._id} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
                backgroundColor: '#fff',
                transition: 'box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'}
              >
                <h4 style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.125rem', 
                  margin: '0 0 0.5rem 0',
                  color: '#1f2937'
                }}>
                  {post.title || '제목 없음'}
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#4B5563', 
                  lineHeight: '1.5', 
                  margin: '0 0 1rem 0' 
                }}>
                  {post.content?.slice(0, 200) || '내용 없음'}
                  {post.content && post.content.length > 200 && '...'}
                </p>
                
                {/* 게시물 이미지 미리보기 */}
                {post.imageUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={`http://localhost:5000${post.imageUrl}`}
                      alt="게시물 이미지"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontSize: '0.75rem', 
                  color: '#6B7280',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>❤️ 반응 {getTotalReactions(post.reactions)}개</span>
                    <span>💬 댓글 {post.comments?.length || 0}개</span>
                  </div>
                  {post.createdAt && (
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}   