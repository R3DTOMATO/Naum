import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function ProfileSetup() {
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('/default-profile.svg')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.')
        return
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.')
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const resetToDefaultImage = () => {
    setSelectedImage(null)
    setImagePreview('/default-profile.svg')
  }

  const uploadProfileImage = async () => {
    if (!selectedImage) return null

    const formData = new FormData()
    formData.append('profileImg', selectedImage)

    try {
      const response = await api.post('/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.imageUrl
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error('이미지 업로드에 실패했습니다.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      let profileImageUrl = null
      
      // 이미지가 선택된 경우 업로드
      if (selectedImage) {
        profileImageUrl = await uploadProfileImage()
      }
      
      // 프로필 정보 업데이트
      const updateData = {
        nickname: nickname.trim(),
        bio: bio.trim()
      }

      // 이미지 URL이 있으면 추가
      if (profileImageUrl) {
        updateData.profileImg = profileImageUrl
      }
      
      const response = await api.put('/users/profile', updateData)
      
      alert('프로필 설정 완료!')
      navigate('/') // 피드 페이지로 이동
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error.response?.data?.message || error.message || '프로필 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", width: "20rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "#B31B1B", textAlign: "center" }}>프로필 설정</h2>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c66',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* 프로필 이미지 섹션 */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
            프로필 이미지
          </label>
          
          {/* 이미지 미리보기 */}
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={imagePreview}
              alt="프로필 미리보기"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #e5e7eb",
                backgroundColor: "#f9fafb"
              }}
            />
          </div>

          {/* 파일 선택 버튼들 */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <label
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "0.375rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                opacity: loading ? 0.6 : 1
              }}
            >
              이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                disabled={loading}
              />
            </label>
            
            <button
              type="button"
              onClick={resetToDefaultImage}
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6b7280",
                color: "white",
                borderRadius: "0.375rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                opacity: loading ? 0.6 : 1
              }}
            >
              기본 이미지
            </button>
          </div>
          
          <p style={{ 
            fontSize: "0.75rem", 
            color: "#6b7280", 
            marginTop: "0.5rem",
            lineHeight: "1.2"
          }}>
            JPG, PNG 파일만 가능 (최대 5MB)
          </p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
            닉네임 *
          </label>
          <input
            type="text"
            placeholder="표시될 닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "0.75rem", 
              border: "1px solid #D1D5DB", 
              borderRadius: "0.5rem",
              fontSize: "1rem"
            }}
            disabled={loading}
            required
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
            자기소개
          </label>
          <textarea
            placeholder="간단한 자기소개를 적어주세요 (선택사항)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ 
              width: "100%", 
              padding: "0.75rem", 
              border: "1px solid #D1D5DB", 
              borderRadius: "0.5rem",
              fontSize: "1rem",
              resize: "vertical"
            }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: "100%", 
            backgroundColor: loading ? "#9CA3AF" : "#B31B1B", 
            color: "white", 
            padding: "0.75rem", 
            borderRadius: "0.5rem",
            border: "none",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s"
          }}
        >
          {loading ? '저장 중...' : '저장하고 시작하기'}
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/')}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "0.5rem",
            backgroundColor: "transparent",
            color: "#6B7280",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #D1D5DB",
            fontSize: "0.875rem",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          나중에 설정하기
        </button>
      </form>
    </div>
  )
}
