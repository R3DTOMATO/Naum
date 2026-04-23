import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  // 디버깅을 위해 post 데이터를 콘솔에 출력
  console.log('PostCard post data:', post);
  console.log('Image URL from post:', post.imageUrl);
  
  const imageUrl = post.imageUrl ? `http://localhost:5000${post.imageUrl}` : null;
  console.log('Final image URL:', imageUrl);
  
  return (
    <div style={{ backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        padding: "1rem",
        marginBottom: "1rem",
        width: "350px",           
        height: "100%",          
        display: "flex",          
        flexDirection: "column",  
        justifyContent: "flex-start" }}>
      
      {/* 사용자 정보 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem"}}>
        <Link to={`/profile/${post.userId?._id || post.userId}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src={post.userId?.profileImg ? `http://localhost:5000${post.userId.profileImg}` : '/default-profile.svg'}
            alt="profile"
            style={{ 
              width: "2rem", 
              height: "2rem", 
              borderRadius: "9999px",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.src = '/default-profile.svg';
            }}
          />
          <span style={{ 
            fontWeight: "600", 
            fontSize: "0.875rem", 
            color: "#0070f3", 
            cursor: "pointer",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.color = "#0051b5"}
          onMouseLeave={(e) => e.target.style.color = "#0070f3"}
          >
            {post.userId?.nickname || post.userId?.username || post.username || '익명'}
          </span>
        </Link>
      </div>
      
      {/* 게시물 제목 */}
      {post.title && (
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "bold" }}>
          {post.title}
        </h3>
      )}
      
      {/* 게시물 내용 */}
      <p style={{ fontSize: "0.875rem", lineHeight: "1.4", margin: "0 0 1rem 0" }}>
        {post.content}
      </p>
      
      {/* 게시물 이미지 */}
      {imageUrl && (
        <>
          <img
            src={imageUrl}
            alt="post"
            style={{ width: "100%", height: "auto", borderRadius: "0.5rem", marginBottom: "1rem" }}
            onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
            onError={(e) => {
              console.error('❌ Image load failed for URL:', imageUrl);
              console.error('❌ Error target src:', e.target.src);
              // 이미지 로드 실패 시 placeholder 표시
              e.target.style.display = 'none';
              if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('image-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.style.cssText = 'width: 100%; height: 200px; border-radius: 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666; margin-bottom: 1rem; border: 1px solid #ddd;';
                placeholder.innerHTML = `
                  <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
                  <div>이미지를 불러올 수 없습니다</div>
                  <div style="font-size: 0.75rem; margin-top: 0.5rem; text-align: center; word-break: break-all;">
                    ${imageUrl}
                  </div>
                `;
                e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
              }
            }}
          />
        </>
      )}
      
      {/* 게시물 날짜 */}
      {post.createdAt && (
        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "auto" }}>
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
