import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const { appointments, cancelledAppointments } = useSelector((state) => state.appointment);
  const [activeTab, setActiveTab] = useState('new');
  const [showCancelledNotice, setShowCancelledNotice] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const fetchNearbyHospitals = (lat, lon) => {
    setLocationLoading(true);
    setLocationError(null);

    const query = `
      [out:json][timeout:60];
      (
        node["amenity"="hospital"](around:40000,${lat},${lon});
        way["amenity"="hospital"](around:40000,${lat},${lon});
        relation["amenity"="hospital"](around:40000,${lat},${lon});
      );
      out center body 50;
    `;

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API hatası: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const results = (data.elements || [])
          .filter((el) => {
            if (!el.tags?.name) return false;
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            return elLat != null && elLon != null;
          })
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            const dist = getDistance(lat, lon, elLat, elLon);
            const timeMin = Math.max(1, Math.round(dist * 3.5));
            const score = Math.max(10, Math.round(100 - dist * 5));
            return {
              id: el.id,
              name: el.tags.name,
              distance: `${dist.toFixed(1)} km`,
              time: `${timeMin} dk`,
              score,
              address: el.tags['addr:street'] || el.tags['addr:full'] || '',
            };
          })
          .sort((a, b) => b.score - a.score);

        setHospitals(results);
      })
      .catch((err) => {
        console.error('Overpass API hatası:', err);
        setLocationError('Hastane verisi alınamadı.');
      })
      .finally(() => setLocationLoading(false));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum desteklemiyor.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchNearbyHospitals(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLocationLoading(false);
        setLocationError('Konum izni reddedildi.');
      }
    );
  };

  // Seed cancelled appointments into Redux on first load (if empty)
  useEffect(() => {
    if (cancelledAppointments.length === 0 && appointments.length === 0) {
      dispatch(setCancelledAppointments(INITIAL_CANCELLED));
    }
  }, []);

  const handleTakeAppointment = (id) => {
    dispatch(takeAppointment(id));
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

      {showCancelledNotice && cancelledAppointments.length > 0 && (
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
                  <span className="priority-badge">Öncelik: {appt.priorityLevel}</span>
                </div>
                <div className="cn-action">
                  <span className="time-left">Kalan süre: {appt.timeLeft}</span>
                  <button className="btn-primary" onClick={() => handleTakeAppointment(appt.id)}>
                    Randevuyu Al
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
          Randevularım ({appointments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Açık Randevular
        </button>
      </div>

      <div className="tab-content glass-panel">
        {activeTab === 'new' && (
          <div className="new-appt-content fade-in">
            <h3>1. Hastane Seçin</h3>

            {hospitals.length === 0 && !locationLoading && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <button className="btn-primary" onClick={handleGetLocation}>
                  <MapPin size={16} style={{ marginRight: 6 }} />
                  Konumumu Kullan
                </button>
                {locationError && (
                  <p style={{ color: 'red', marginTop: '1rem' }}>{locationError}</p>
                )}
              </div>
            )}

            {locationLoading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <Clock size={24} style={{ marginBottom: 8 }} />
                <p>Yakındaki hastaneler aranıyor...</p>
              </div>
            )}

            {hospitals.length > 0 && (
              <>
                <div className="optimization-notice" style={{ marginBottom: '1rem' }}>
                  <Search size={16} />
                  <span>
                    Konumunuza göre {hospitals.length} hastane bulundu — mesafe ve skora göre sıralandı
                  </span>
                  <button
                    onClick={handleGetLocation}
                    style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Yenile
                  </button>
                </div>
                <div className="hospital-selection-list">
                  {hospitals.map((h) => (
                    <div key={h.id} className="hs-card">
                      <div className="hs-info">
                        <h4>{h.name}</h4>
                        <div className="hs-meta">
                          <span><MapPin size={14} /> {h.distance}</span>
                          <span><CalendarIcon size={14} /> {h.time}</span>
                          {h.address && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{h.address}</span>}
                        </div>
                      </div>
                      <div className="hs-score">~ {h.score}/100</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="mine-appt-content fade-in">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <CalendarIcon size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Henüz randevunuz bulunmamaktadır.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                  İptal edilen randevuları alarak veya yeni randevu oluşturarak başlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="my-appointments-list">
                {appointments.map(appt => (
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

        {activeTab === 'open' && (
          <div className="open-appt-content fade-in">
            <p className="cn-desc">
              24 saatten fazla bekleyen iptal edilmiş randevular burada görünür.
              İlk gelen alır mantığıyla çalışır.
            </p>
            <div className="empty-state">
              Şu anda açık randevu bulunmamaktadır.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
