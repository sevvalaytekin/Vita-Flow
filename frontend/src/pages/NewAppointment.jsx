import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NewAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: '',
    polyclinic: '',
    doctor: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && formData.branch) setStep(2);
    else if (step === 2) {
      toast.success('Randevunuz başarıyla oluşturuldu!');
      navigate('/appointments');
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Yeni Randevu Oluştur</h1>
      </div>

      <div className="auth-card glass-panel" style={{ maxWidth: '600px' }}>
        {step === 1 && (
          <div className="auth-form">
            <div className="form-group">
              <label>Branş Seçin</label>
              <select className="styled-select" name="branch" value={formData.branch} onChange={handleChange}>
                <option value="">Seçiniz...</option>
                <option value="kardiyoloji">Kardiyoloji</option>
                <option value="noroloji">Nöroloji</option>
                <option value="dahiliye">Dahiliye</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Doktor (Opsiyonel)</label>
              <input 
                type="text" 
                className="styled-select" 
                name="doctor" 
                placeholder="Doktor adı girin..." 
                value={formData.doctor}
                onChange={handleChange}
              />
            </div>

            <button className="btn-primary" onClick={handleNext} disabled={!formData.branch}>
              Devam Et
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="auth-form fade-in">
            <h3>Uygun Saatler</h3>
            <p className="cn-desc">Seçtiğiniz branş için en uygun saatler listeleniyor.</p>
            <div className="demo-list">
              <label className="checkbox-label" style={{ padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                <input type="radio" name="time" value="10:00" />
                <span>Bugün 10:00 - Dr. Ahmet (Uygun)</span>
              </label>
              <label className="checkbox-label" style={{ padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                <input type="radio" name="time" value="14:30" />
                <span>Yarın 14:30 - Dr. Ayşe (Uygun)</span>
              </label>
            </div>
            
            <button className="btn-primary" onClick={handleNext}>
              Randevuyu Onayla
            </button>
            <button className="btn-outline" onClick={() => setStep(1)} style={{ marginTop: '0.5rem' }}>
              Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAppointment;
