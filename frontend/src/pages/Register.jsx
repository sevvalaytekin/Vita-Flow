import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, CreditCard, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { registerAsync, clearError } from '../features/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    tcNo: '',
    email: '',
    phone: '',
    priority: '',
    password: '',
    confirmPassword: '',
    kvkk: false
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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    // TC Kimlik No: tam 11 hane, sadece rakam
    const cleanTc = formData.tcNo.replace(/\s/g, '');
    if (!/^\d{11}$/.test(cleanTc)) {
      toast.error('TC Kimlik No tam 11 haneli olmalıdır.');
      return;
    }
    if (!formData.kvkk) {
      toast.error('Lütfen KVKK metnini onaylayın.');
      return;
    }
    
    // Strip phone to digits only (DB column is varchar(11))
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '').slice(-11);

    const resultAction = await dispatch(registerAsync({
      username: formData.fullName || formData.tcNo,
      email: formData.email,
      password: formData.password,
      phone: cleanPhone || '00000000000'
    }));

    if (registerAsync.fulfilled.match(resultAction)) {
      // Geçici çözüm: Backend'e öncelik alanı eklenene kadar localStorage'da saklıyoruz.
      if (formData.priority) {
        localStorage.setItem(`vitaflow_priority_${formData.email}`, formData.priority);
      }
      toast.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      toast.error(resultAction.payload || 'Kayıt işlemi başarısız oldu.');
    }
  };

  return (
    <div className="auth-card glass-panel fade-in">
      <div className="auth-tabs">
        <Link to="/login" className="auth-tab">Giriş Yap</Link>
        <Link to="/register" className="auth-tab active">Kayıt Ol</Link>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        <div className="form-group">
          <label>Ad Soyad</label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input type="text" name="fullName" placeholder="Ahmet Yılmaz" onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label>TC Kimlik No</label>
          <div className="input-wrapper">
            <CreditCard size={18} className="input-icon" />
            <input type="text" name="tcNo" placeholder="12345678901" maxLength="11" minLength="11" pattern="\d{11}" inputMode="numeric" onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label>E-posta</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input type="email" name="email" placeholder="ornek@email.com" onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label>Telefon</label>
          <div className="input-wrapper">
            <Phone size={18} className="input-icon" />
            <input type="tel" name="phone" placeholder="+90 555 123 4567" onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label>Öncelik Durumu</label>
          <select name="priority" onChange={handleChange} required className="styled-select" disabled={loading}>
            <option value="">Öncelik durumunuzu seçin</option>
            <option value="none">Yok (Standart Kullanıcı)</option>
            <option value="doctor">Doktorun belirlediği öncelik</option>
            <option value="chronic">Kronik Hasta</option>
            <option value="elderly">65 Yaş Üstü</option>
            <option value="disabled">Engelli</option>
          </select>
        </div>

        <div className="form-group">
          <label>Şifre</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label>Şifre Tekrar</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input type="checkbox" name="kvkk" checked={formData.kvkk} onChange={handleChange} disabled={loading} />
            <span><a href="#">KVKK</a> ve <a href="#">Kullanım Şartları</a>'nı kabul ediyorum</span>
          </label>
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
        </button>
      </form>
    </div>
  );
};

export default Register;
