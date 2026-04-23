import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function EmotionButtons({ postId, commentCount = 0, isInstagramStyle = false, onCommentClick, showAllEmotions = false }) {
  const { user } = useAuth()
  const [userEmotion, setUserEmotion] = useState(null) // 현재 유저의 감정
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [emotionCounts, setEmotionCounts] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    fear: 0,
    surprise: 0
  })
  const [loading, setLoading] = useState(false)

  const emotions = [
    { key: 'happy', emoji: '😊', label: '행복' },
    { key: 'sad', emoji: '😢', label: '슬픔' },
    { key: 'angry', emoji: '😠', label: '분노' },
    { key: 'fear', emoji: '😨', label: '두려움' },
    { key: 'surprise', emoji: '😮', label: '놀람' }
  ]

  useEffect(() => {
    if (!user || !postId) return

    const fetchEmotionStatus = async () => {
      try {
        const response = await api.get(`/posts/${postId}`)
        const post = response.data
        
        // 감정별 카운트 설정
        const counts = {
          happy: post.reactions?.happy?.length || 0,
          sad: post.reactions?.sad?.length || 0,
          angry: post.reactions?.angry?.length || 0,
          fear: post.reactions?.fear?.length || 0,
          surprise: post.reactions?.surprise?.length || 0
        }
        setEmotionCounts(counts)
        
        // 좋아요 상태 확인 (happy 감정을 좋아요로 사용)
        const liked = post.reactions?.happy?.includes(user.id) || false
        setIsLiked(liked)
        setLikeCount(counts.happy)
        
        // 현재 유저의 감정 상태 확인
        let currentEmotion = null
        for (const emotion of emotions) {
          if (post.reactions?.[emotion.key]?.includes(user.id)) {
            currentEmotion = emotion.key
            break
          }
        }
        setUserEmotion(currentEmotion)
      } catch (error) {
        console.error('Error fetching emotion status:', error)
      }
    }

    fetchEmotionStatus()
  }, [user, postId])

  const handleLikeClick = async () => {
    if (!user) {
      alert('로그인이 필요합니다')
      return
    }

    if (loading) return

    try {
      setLoading(true)
      const response = await api.post(`/posts/${postId}/emotion`, {
        emotion: 'happy'
      })
      
      setEmotionCounts(response.data.emotionCounts)
      setUserEmotion(response.data.userEmotion)
      setIsLiked(response.data.userEmotion === 'happy')
      setLikeCount(response.data.emotionCounts.happy)
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('좋아요 처리에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  const handleEmotionClick = async (emotion) => {
    if (!user) {
      alert('로그인이 필요합니다')
      return
    }

    if (loading) return

    try {
      setLoading(true)
      const response = await api.post(`/posts/${postId}/emotion`, {
        emotion: emotion
      })
      
      setEmotionCounts(response.data.emotionCounts)
      setUserEmotion(response.data.userEmotion)
      setIsLiked(response.data.userEmotion === 'happy')
      setLikeCount(response.data.emotionCounts.happy)
    } catch (error) {
      console.error('Error toggling emotion:', error)
      alert('감정 반응 처리에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (isInstagramStyle) {
    return (
      <div>
        {/* 감정 버튼들 + 댓글 버튼 */}
        {showAllEmotions && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '0.5rem 0'
          }}>
            {emotions.map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => handleEmotionClick(key)}
                disabled={loading}
                title={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.5rem',
                  background: userEmotion === key ? '#e3f2fd' : 'transparent',
                  border: userEmotion === key ? '2px solid #2196f3' : '1px solid #ddd',
                  borderRadius: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1rem' }}>{emoji}</span>
                <span>{emotionCounts[key]}</span>
              </button>
            ))}
            {/* 댓글 버튼 */}
            <button
              onClick={onCommentClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                padding: '0.25rem 0.5rem',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1rem' }}>💬</span>
              <span>댓글</span>
            </button>
          </div>
        )}
      </div>
    )
  }

// 기본 스타일 (기존 방식)
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      {/* 감정 버튼들 */}
      {emotions.map(({ key, emoji, label }) => (
        <button
          key={key}
          onClick={() => handleEmotionClick(key)}
          disabled={loading}
          title={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.875rem',
            padding: '0.25rem 0.5rem',
            background: userEmotion === key ? '#e3f2fd' : 'transparent',
            border: userEmotion === key ? '2px solid #2196f3' : '1px solid #ddd',
            borderRadius: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '1rem' }}>{emoji}</span>
          <span>{emotionCounts[key]}</span>
        </button>
      ))}
      
      {/* 댓글 버튼 */}
      <div
        title="댓글"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.875rem',
          padding: '0.25rem 0.5rem',
          background: 'transparent',
          border: '1px solid #ddd',
          borderRadius: '1rem'
        }}
      >
        <span style={{ fontSize: '1rem' }}>💬</span>
        <span>{commentCount}</span>
      </div>
    </div>
  )
}
