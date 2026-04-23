import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImage) return null

    try {
      setImageUploading(true)
      const formData = new FormData()
      formData.append('postImg', selectedImage)
      
      console.log('Uploading image:', selectedImage.name, selectedImage.type);
      
      const response = await api.post('/upload/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Image upload response:', response.data);
      
      setUploadedImageUrl(response.data.imageUrl)
      return response.data.imageUrl
    } catch (error) {
      console.error('Image upload error:', error)
      console.error('Error response:', error.response?.data);
      setError('이미지 업로드에 실패했습니다.')
      return null
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadedImageUrl(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // 이미지가 선택되었으면 먼저 업로드
      let imageUrl = uploadedImageUrl
      if (selectedImage && !uploadedImageUrl) {
        imageUrl = await handleImageUpload()
      }
      
      console.log('Submitting post with data:', {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl
      });
      
      const response = await api.post('/posts', {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl
      })
      
      console.log('Post creation response:', response.data);
      
      // 게시물 작성 성공 후 피드 페이지로 이동
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      setError(error.response?.data?.message || '게시물 작성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>새 게시물 작성</h1>
      
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c66'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시물 제목을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게시물 내용을 입력하세요"
            rows={10}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            이미지 (선택사항)
          </label>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading || imageUploading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: '#f8f9fa'
            }}
          />
          
          {imagePreview && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>이미지 미리보기:</span>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={loading || imageUploading}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              </div>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              {imageUploading && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  color: '#007bff',
                  fontSize: '0.875rem'
                }}>
                  이미지 업로드 중...
                </div>
              )}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading || imageUploading}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              backgroundColor: (loading || imageUploading) ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: (loading || imageUploading) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '작성 중...' : imageUploading ? '이미지 업로드 중...' : '게시물 작성'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}