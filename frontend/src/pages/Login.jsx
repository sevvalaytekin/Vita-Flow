import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginAsync, clearError, getRoleBasedRedirect } from '../features/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (formData.email && formData.password) {
      const resultAction = await dispatch(loginAsync({ 
        email: formData.email, 
        password: formData.password 
      }));
      
      if (loginAsync.fulfilled.match(resultAction)) {
        // Decode roles from JWT to determine redirect
        let roles = ['ROLE_USER'];
        try {
          const base64Payload = resultAction.payload.accessToken.split('.')[1];
          const payload = JSON.parse(atob(base64Payload));
          roles = payload.roles || roles;
        } catch {}
        
        const redirectPath = getRoleBasedRedirect(roles);
        toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => navigate(redirectPath), 1500);
      } else {
        toast.error(resultAction.payload || 'Giriş yapılamadı.');
      }
    } else {
      toast.error('Lütfen tüm alanları doldurun.');
    }
  };

  return (
    <div className="auth-card glass-panel fade-in">
      <div className="auth-tabs">
        <Link to="/login" className="auth-tab active">Giriş Yap</Link>
        <Link to="/register" className="auth-tab">Kayıt Ol</Link>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        <div className="form-group">
          <label>E-posta</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              name="email"
              placeholder="ornek@email.com" 
              value={formData.email}
              onChange={handleChange}
              required 
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Şifre</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Beni hatırla</span>
          </label>
          <a href="#" className="forgot-password">Şifremi unuttum</a>
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="demo-accounts">
        <div className="demo-divider">
          <span>Demo Hesaplar</span>
        </div>
        <div className="demo-list">
          <p><strong>Admin:</strong> admin@vitaflow.com / 12345678</p>
          <p><strong>Doktor:</strong> doctor@vitaflow.com / 12345678</p>
          <p><strong>Kullanıcı:</strong> ahmet@gmail.com / 12345678</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

