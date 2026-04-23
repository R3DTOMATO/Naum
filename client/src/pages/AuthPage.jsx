import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/feed');
        }
      } else {
        result = await register(formData.username, formData.email, formData.password);
        if (result.success) {
          alert(result.message);
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '' });
        }
      }

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError('예상치 못한 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? '로그인' : '회원가입'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="사용자명"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>
        
        <button 
          type="button" 
          className="switch-mode"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setFormData({ username: '', email: '', password: '' });
          }}
        >
          {isLogin ? '회원가입하기' : '로그인하기'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
