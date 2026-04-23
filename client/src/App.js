import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import FeedPage from './pages/FeedPage'
import CreatePostPage from './pages/CreatePost'
import ProfilePage from './pages/ProfileSetup'
import AuthPage from './pages/AuthPage'
import { useAuth } from './contexts/AuthContext'
import PublicProfilePage from './pages/PublicProfile'
import FriendRequestsPage from './pages/FriendRequests'
import FriendsFollowersPage from './pages/FriendsFollowers'
import MessagesListPage from './pages/MessagesList'
import MessageConversationPage from './pages/MessageConversation'

function App() {
  const { user } = useAuth()

  return (
    <Router>
      {/* 최상위 레이아웃 */}
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#FAF6F0',
        }}
      >
        {/* 사이드바 */}
        {user && <Sidebar />}

        {/* 콘텐츠 영역 */}
        <main
          style={{
            flex: 1,
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* 중앙 정렬된 콘텐츠 박스 */}
          <div
            style={{
              width: '100%',
              maxWidth: '48rem', // 48rem = Tailwind max-w-3xl
            }}
          >
            <Routes>
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/" element={user ? <FeedPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/feed" element={user ? <FeedPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/create" element={user ? <CreatePostPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/profile" element={user ? <PublicProfilePage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/profile/:userId" element={user ? <PublicProfilePage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/setup" element={user ? <ProfilePage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/friend-requests" element={user ? <FriendRequestsPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/friends" element={user ? <FriendsFollowersPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/messages" element={user ? <MessagesListPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/messages/:partnerId" element={user ? <MessageConversationPage /> : <AuthPage />} />
              <Route style={{ padding: '1rem', border: '1px solid #eee', alignItems: 'center', display: 'flex', justifyContent: 'center' }} path="/auth" element={<AuthPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
