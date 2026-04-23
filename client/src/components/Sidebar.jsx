// src/components/Sidebar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  const handleLogout = async () => {
    await logout()
    navigate('/auth') // 로그아웃 후 인증 페이지로 이동
  }

  useEffect(() => {
    if (!user) return
    
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/messages/unread-count')
        setUnreadMessageCount(response.data.unreadCount)
      } catch (error) {
        console.error('읽지 않은 메시지 개수 조회 오류:', error)
      }
    }

    fetchUnreadCount()

    // 5초마다 읽지 않은 메시지 개수 업데이트 (실시간 알림 대용)
    const interval = setInterval(fetchUnreadCount, 5000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <div style={{height: "100vh", width: "16rem", backgroundColor: "#FAF6F0", borderRight: "1px solid #E5E7EB", padding: "1.5rem", position: "fixed", top: 0, left: 0}}>
      {/* 로고 */}
      <h1 style={{fontSize: "1.875rem", fontWeight: 800, color: "#B31B1B", marginBottom: "1rem", letterSpacing: "0.05em"}}>NAUM</h1>

      {/* 사용자 정보 */}
      {user && (
        <Link to={`/profile/${user.id || user._id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            marginBottom: "2rem", 
            padding: "1rem", 
            backgroundColor: "rgba(179, 27, 27, 0.1)", 
            borderRadius: "0.5rem",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(179, 27, 27, 0.15)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(179, 27, 27, 0.1)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <img
                src={user.profileImg ? `http://localhost:5000${user.profileImg}` : '/default-profile.svg'}
                alt="프로필 이미지"
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  objectFit: "cover",
                  backgroundColor: "#f3f4f6",
                  border: "2px solid rgba(179, 27, 27, 0.2)"
                }}
                onError={(e) => {
                  e.target.src = '/default-profile.svg';
                }}
              />
              <div>
                <p style={{fontSize: "0.875rem", color: "#B31B1B", fontWeight: "600", margin: "0"}}>
                  {user.nickname || user.username}
                </p>
                <p style={{fontSize: "0.75rem", color: "#6B7280", margin: "0.25rem 0 0 0"}}>
                  @{user.username}
                </p>
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center" }}>
              내 프로필 보기 →
            </div>
          </div>
        </Link>
      )}

      {/* 메뉴 */}
      <nav style={{display: "flex", flexDirection: "column", gap: "1.25rem", color: "#4B5563", fontWeight: 500, fontSize: "1rem"}}>
        <Link to="/" style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem"}}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>
          </svg> 
          홈
        </Link>
        <Link to="/create" style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem"}}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
          </svg> 
          글쓰기
        </Link>
        
        <Link to="/messages" style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem", position: "relative"}}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/>
          </svg>
          메시지
          {unreadMessageCount > 0 && (
            <span style={{
              position: 'absolute',
              left: '20px',
              top: '-8px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
            </span>
          )}
        </Link>
        
        {/* 친구/팔로우 섹션 */}
        <div style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            친구 & 팔로우
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link to="/friend-requests" style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", paddingLeft: "0.5rem"}}>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#1f1f1f">
                <path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-360-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/>
              </svg>
              친구 요청
            </Link>
            <Link to="/friends" style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", paddingLeft: "0.5rem"}}>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#1f1f1f">
                <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49.5 46.5T720-305v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h350v-15q0-20-10.5-34.5T639-389q-25-11-55.5-17t-63.5-6q-33 0-63.5 6t-55.5 17q-15 6-25.5 20.5T325-335v15ZM160-440q-33 0-56.5-23.5T80-520q0-33 23.5-56.5T160-600q33 0 56.5 23.5T240-520q0 33-23.5 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-33 23.5-56.5T800-600q33 0 56.5 23.5T880-520q0 33-23.5 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z"/>
              </svg>
              친구 & 팔로우
            </Link>
          </div>
        </div>

        <Link to={`/profile/${user?.id || user?._id || ''}`} style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem"}}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z"/>
          </svg>
          내 프로필
        </Link>
        <Link to="/setup" style={{color: "inherit", textDecoration: "none", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "0.5rem"}}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
          </svg>
          프로필 설정
        </Link>
        {user && (
          <button onClick={handleLogout} style={{
            color: "#EF4444", 
            textAlign: "left", 
            marginTop: "1rem",
            background: "none",
            border: "none",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EF4444">
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
            </svg>
            로그아웃
          </button>
        )}
      </nav>
    </div>
  )
}
