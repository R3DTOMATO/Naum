import { createContext, useEffect, useState, useContext } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 사용자 로그인
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '로그인 실패' 
      }
    }
  }

  // 사용자 회원가입
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      return { success: true, message: '회원가입 성공! 로그인해주세요.' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '회원가입 실패' 
      }
    }
  }

  // 사용자 로그아웃
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // 현재 사용자 정보 확인
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      // 토큰이 유효하지 않으면 제거
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
