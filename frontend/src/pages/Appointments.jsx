import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NewAppointment from './NewAppointment';
import { BellRing, X, Calendar as CalendarIcon, MapPin, Search, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { setAppointments, setCancelledAppointments, takeAppointment } from '../features/appointmentSlice';
import '../styles/appointments.css';

const INITIAL_CANCELLED = [
  {
    id: 1,
    hospital: 'Acıbadem Maslak - Nöroloji',
    doctor: 'Dr. Zeynep Kaya',
    date: '2026-01-22 10:00',
    priorityLevel: 1,
    timeLeft: '18 saat',
    status: 'Onaylandı'
  },
  {
    id: 2,
    hospital: 'American Hospital - Kardiyoloji',
    doctor: 'Dr. Fatma Yıldız',
    date: '2026-01-23 13:30',
    priorityLevel: 2,
    timeLeft: '22 saat',
    status: 'Onaylandı'
  }
];

// Haversine mesafe hesabı (pure fonksiyon — component dışında kalabilir)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments, cancelledAppointments, hasClaimedPriority } = useSelector((state) => state.appointment);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('mine');
  const [showCancelledNotice, setShowCancelledNotice] = useState(true);
  const navigate = useNavigate();
  
  const currentUserId = user?.id || user?.email;
  const userAppointments = appointments.filter(a => a.userId === currentUserId);

  // Check if user has priority (not standard user)
  const hasPriority = user?.role && user.role !== 'Standart Kullanıcı' && user.role !== 'Kullanıcı';

  // Seed cancelled appointments into Redux on first load (if empty)
  useEffect(() => {
    if (cancelledAppointments.length === 0 && appointments.length === 0) {
      dispatch(setCancelledAppointments(INITIAL_CANCELLED));
    }
  }, []);

  const handleTakeAppointment = (id) => {
    dispatch(takeAppointment({ id, userId: currentUserId }));
    toast.success('Randevu başarıyla alındı!');
  };

  const handleCancelAppointment = (id) => {
    const updated = appointments.filter(a => a.id !== id);
    dispatch(setAppointments(updated));
    toast.info('Randevu iptal edildi.');
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Randevu Sistemi</h1>
          <p className="page-subtitle">Akıllı optimizasyon ile en uygun randevuyu alın</p>
        </div>
      </div>

      {hasPriority && showCancelledNotice && cancelledAppointments.length > 0 && (
        <div className="cancelled-notice-box glass-panel">
          <div className="cn-header">
            <div className="cn-title">
              <BellRing size={20} color="#2563eb" />
              <h4>İptal Edilen Randevular</h4>
            </div>
            <button className="cn-close" onClick={() => setShowCancelledNotice(false)}>
              <X size={20} />
            </button>
          </div>
          <p className="cn-desc">
            Önceliğinize göre {cancelledAppointments.length} adet iptal edilen randevu için bildirim aldınız.
            24 saat içinde seçim yapmazsanız randevular açık randevulara eklenecek.
          </p>

          <div className="cn-list">
            {cancelledAppointments.map(appt => (
              <div key={appt.id} className="cn-card">
                <div className="cn-info">
                  <h5>{appt.hospital}</h5>
                  <p>{appt.doctor} • {appt.date}</p>
                  <span className="priority-badge">{user?.role || 'Öncelikli Randevu'}</span>
                </div>
                <div className="cn-action">
                  <span className="time-left">Kalan süre: {appt.timeLeft}</span>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleTakeAppointment(appt.id)}
                    disabled={hasClaimedPriority}
                  >
                    {hasClaimedPriority ? 'Bir randevunuz var' : 'Randevuyu Al'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Yeni Randevu
        </button>
        <button
          className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          Randevularım ({userAppointments.length})
        </button>
      </div>

      <div className="tab-content glass-panel">
        {activeTab === 'new' && (
          <div className="new-appt-content fade-in" style={{ padding: '0.5rem' }}>
            <NewAppointment isEmbedded={true} onAppointmentCreated={() => setActiveTab('mine')} />
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="mine-appt-content fade-in">
            {userAppointments.length === 0 ? (
              <div className="empty-state">
                <CalendarIcon size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Henüz randevunuz bulunmamaktadır.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                  İptal edilen randevuları alarak veya yeni randevu oluşturarak başlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="my-appointments-list">
                {userAppointments.map(appt => (
                  <div key={appt.id} className="my-appt-card">
                    <div className="my-appt-left">
                      <div className="my-appt-date-badge">
                        <CalendarIcon size={16} />
                        <span>{formatDate(appt.date)}</span>
                        <Clock size={14} />
                        <span>{formatTime(appt.date)}</span>
                      </div>
                      <h4 className="my-appt-hospital">{appt.hospital}</h4>
                      <p className="my-appt-doctor">
                        <User size={14} />
                        {appt.doctor}
                      </p>
                    </div>
                    <div className="my-appt-right">
                      <span className={`status-badge status-${(appt.status || 'Onaylandı').toLowerCase().replace(/\s/g, '-')}`}>
                        <CheckCircle size={14} />
                        {appt.status || 'Onaylandı'}
                      </span>
                      <button
                        className="btn-cancel-appt"
                        onClick={() => handleCancelAppointment(appt.id)}
                        title="Randevuyu İptal Et"
                      >
                        <XCircle size={16} />
                        İptal Et
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Appointments;
