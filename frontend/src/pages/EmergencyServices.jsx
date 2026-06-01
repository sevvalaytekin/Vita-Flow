import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Activity, Users, Phone, Map, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/emergency.css';

// Haversine mesafe hesabı
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

const EmergencyServices = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [registeredHospitalId, setRegisteredHospitalId] = useState(null);
  const [userQueueNumber, setUserQueueNumber] = useState(null);

  // Overpass API ile gerçek hastane verisi çek
  const fetchNearbyHospitals = (lat, lon) => {
    setLoading(true);
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
        if (!data.elements || data.elements.length === 0) {
          setHospitals([]);
          setLoading(false);
          toast.warn('Yakınızda hastane bulunamadı.', { autoClose: 3000 });
          return;
        }

        const results = data.elements
          .filter((el) => {
            // İsmi olan hastaneleri filtrele
            if (!el.tags?.name) return false;
            // Koordinat kontrolü — way/relation için center olmalı
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            return elLat != null && elLon != null;
          })
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            const dist = getDistance(lat, lon, elLat, elLon);
            const timeMin = Math.max(1, Math.round(dist * 3.5));

            // Simüle edilmiş kapasite verileri (gerçek API olmadığı için)
            const totalCap = Math.floor(Math.random() * 30) + 10;
            const usedCap = Math.floor(Math.random() * totalCap);
            const fullness = Math.round((usedCap / totalCap) * 100);
            const queueCount = Math.floor(Math.random() * 15) + 1;
            const score = Math.max(10, Math.round(100 - dist * 3 - fullness * 0.3));

            let status = 'Uygun';
            if (fullness > 80) status = 'Yoğun';
            else if (fullness > 60) status = 'Orta Yoğun';

            return {
              id: el.id,
              name: el.tags.name,
              address: [el.tags['addr:street'], el.tags['addr:district'], el.tags['addr:city']]
                .filter(Boolean).join(', ') || el.tags['addr:full'] || 'Adres bilgisi harita sisteminde kayıtlı değil',
              distance: `${dist.toFixed(1)} km`,
              traffic: `${timeMin} dk`,
              capacity: `${usedCap}/${totalCap}`,
              queue: `${queueCount} kişi`,
              fullness,
              score,
              status,
              phone: el.tags.phone || el.tags['contact:phone'] || '',
              lat: elLat,
              lon: elLon,
            };
          })
          .sort((a, b) => b.score - a.score);

        setHospitals(results);
        setLoading(false);

        if (results.length > 0) {
          toast.info(`Konumunuza göre ${results.length} hastane bulundu.`, { autoClose: 2000 });
        } else {
          toast.warn('Yakınızda hastane bulunamadı.', { autoClose: 3000 });
        }
      })
      .catch((err) => {
        console.error('Overpass API hatası:', err);
        setLocationError('Hastane verisi alınamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        toast.error('Hastane verisi alınamadı.');
      });
  };

  // Mevcut konumu al ve hastaneleri getir
  const getLocationAndFetch = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum özelliğini desteklemiyor.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchNearbyHospitals(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLoading(false);
        setLocationError('Gerçek konum alınamadı. Örnek (İstanbul) konumu üzerinden test verileri gösteriliyor.');
        toast.warn('Konum izni alınamadı, örnek konum kullanılıyor.');
        // İstanbul fallback
        fetchNearbyHospitals(41.0082, 28.9784);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Sayfa yüklendiğinde otomatik konum al
  useEffect(() => {
    getLocationAndFetch();
  }, []);

  // Google Maps yol tarifi aç
  const handleDirections = (hospital) => {
    if (hospital.lat && hospital.lon) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`, '_blank');
    }
  };

  const handleRegister = (hospital) => {
    // Zaten kayıt olduysa engelle
    if (registeredHospitalId) {
      toast.warn('Zaten bir hastaneye kayıt oldunuz. Birden fazla kayıt yapılamaz.');
      return;
    }

    // Kapasite kontrolü
    const [used, total] = hospital.capacity.split('/').map(Number);
    if (used >= total) {
      toast.error(`${hospital.name} kapasitesi dolu! Kayıt yapılamaz.`);
      return;
    }

    // Kuyruk sayısından sıra numarası hesapla
    const currentQueue = parseInt(hospital.queue) || 0;
    const newQueueNumber = currentQueue + 1;

    // Kayıt durumunu kaydet
    setRegisteredHospitalId(hospital.id);
    setUserQueueNumber(newQueueNumber);

    // Hastane state'ini güncelle (kuyruk +1)
    setHospitals(prev => prev.map(h => {
      if (h.id === hospital.id) {
        return {
          ...h,
          queue: `${newQueueNumber} kişi`,
        };
      }
      return h;
    }));

    toast.success(
      `${hospital.name} için acil kayıt talebiniz oluşturuldu. Sıra numaranız: #${newQueueNumber}`,
      { autoClose: 5000 }
    );
  };

  const handleCancelRegistration = () => {
    if (!registeredHospitalId) return;

    const hospitalName = hospitals.find(h => h.id === registeredHospitalId)?.name || '';

    // Kuyruktan çıkar
    setHospitals(prev => prev.map(h => {
      if (h.id === registeredHospitalId) {
        const currentQueue = Math.max(0, (parseInt(h.queue) || 0) - 1);
        return {
          ...h,
          queue: `${currentQueue} kişi`,
        };
      }
      return h;
    }));

    setRegisteredHospitalId(null);
    setUserQueueNumber(null);

    toast.info(`${hospitalName} sıranız iptal edildi. Başka bir hastaneye kayıt olabilirsiniz.`, { autoClose: 4000 });
  };

  // Simüle edilmiş kuyruk ilerlemesi
  useEffect(() => {
    let interval;
    if (registeredHospitalId && userQueueNumber > 0) {
      interval = setInterval(() => {
        if (userQueueNumber <= 1) {
          setRegisteredHospitalId(null);
          setUserQueueNumber(null);
          toast.success('Sıranız geldi! Lütfen doktor odasına geçiniz.', { autoClose: 8000, icon: '👨‍⚕️' });
        } else {
          const nextQueue = userQueueNumber - 1;
          setUserQueueNumber(nextQueue);
          toast.info(`Sıranız ilerledi. Güncel sıra numaranız: #${nextQueue}`);
          
          setHospitals(prevList => prevList.map(h => {
            if (h.id === registeredHospitalId) {
              const currentQueue = Math.max(0, (parseInt(h.queue) || 0) - 1);
              return {
                ...h,
                queue: `${currentQueue} kişi`,
              };
            }
            return h;
          }));
        }
      }, 120000); // 2 dakikada bir (120,000 ms) ilerlesin
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [registeredHospitalId, userQueueNumber]);

  // Toplam istatistikler
  const totalCapacity = hospitals.reduce((sum, h) => {
    const parts = h.capacity.split('/');
    return sum + parseInt(parts[1] || 0);
  }, 0);

  const freeCapacity = hospitals.reduce((sum, h) => {
    const parts = h.capacity.split('/');
    return sum + (parseInt(parts[1] || 0) - parseInt(parts[0] || 0));
  }, 0);

  const avgQueue = hospitals.length > 0
    ? Math.round(hospitals.reduce((sum, h) => sum + parseInt(h.queue), 0) / hospitals.length)
    : 0;

  if (loading) {
    return (
      <div className="loading-state">
        <Loader size={32} className="spin-animation" style={{ marginBottom: '1rem' }} />
        <p>Konum alınıyor ve yakın hastaneler aranıyor...</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Acil Servis Durumu</h1>
          <p className="page-subtitle">40 km² alan içerisindeki acil servislerin anlık durumu</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
          onClick={getLocationAndFetch}
        >
          <MapPin size={16} /> Konumumu Güncelle
        </button>
      </div>

      {locationError && (
        <div className="optimization-notice" style={{ background: '#fef2f2', color: '#dc2626', marginBottom: '1rem' }}>
          <Activity size={16} />
          <span>{locationError}</span>
          <button 
            onClick={getLocationAndFetch}
            style={{ marginLeft: 'auto', padding: '0.4rem 1rem', borderRadius: '8px', background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {hospitals.length === 0 && !locationError && (
        <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <MapPin size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Yakınınızda hastane bulunamadı.</p>
          <button className="btn-primary" onClick={getLocationAndFetch} style={{ marginTop: '1rem' }}>
            <MapPin size={16} /> Konumumu Güncelle
          </button>
        </div>
      )}

      {hospitals.length > 0 && (
        <>
          <div className="stats-row">
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Bulunan Hastane</span>
                <span className="stat-value">{hospitals.length}</span>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Toplam Kapasite</span>
                <span className="stat-value">{totalCapacity}</span>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Boş Kapasite</span>
                <span className="stat-value">{freeCapacity}</span>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: '#ffedd5', color: '#f97316' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Ort. Kuyruk</span>
                <span className="stat-value">{avgQueue} kişi</span>
              </div>
            </div>
          </div>

          <div className="optimization-notice">
            <Activity size={16} />
            <span>Gerçek konumunuza göre mesafe, tahmini trafik ve kapasite durumuna göre optimize edilmiş sıralama</span>
          </div>

          <div className="hospital-list">
            {hospitals.map((hospital, index) => (
              <div key={hospital.id} className="hospital-card glass-panel">
                <div className="hc-header">
                  <div className="hc-title-wrapper">
                    <span className="rank-badge">#{index + 1}</span>
                    <div>
                      <h3 className="hc-title">{hospital.name}</h3>
                      <p className="hc-address"><MapPin size={12} /> {hospital.address}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${hospital.status === 'Uygun' ? 'status-good' : hospital.status === 'Yoğun' ? 'status-bad' : 'status-warn'}`}>
                    {hospital.status}
                  </span>
                </div>

                <div className="hc-metrics">
                  <div className="metric">
                    <Navigation size={16} className="metric-icon" />
                    <div>
                      <span className="metric-label">Mesafe</span>
                      <span className="metric-value">{hospital.distance}</span>
                    </div>
                  </div>
                  <div className="metric">
                    <Clock size={16} className="metric-icon" style={{color: '#f97316'}} />
                    <div>
                      <span className="metric-label">Trafik</span>
                      <span className="metric-value">{hospital.traffic}</span>
                    </div>
                  </div>
                  <div className="metric">
                    <Activity size={16} className="metric-icon" style={{color: '#10b981'}} />
                    <div>
                      <span className="metric-label">Kapasite</span>
                      <span className="metric-value">{hospital.capacity}</span>
                    </div>
                  </div>
                  <div className="metric">
                    <Users size={16} className="metric-icon" style={{color: '#a855f7'}} />
                    <div>
                      <span className="metric-label">Kuyruk</span>
                      <span className="metric-value">{hospital.queue}</span>
                    </div>
                  </div>
                </div>

                <div className="hc-progress">
                  <div className="progress-labels">
                    <span>Doluluk Oranı</span>
                    <span>{hospital.fullness}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill ${hospital.fullness > 80 ? 'bg-danger' : hospital.fullness > 60 ? 'bg-warning' : 'bg-primary'}`} 
                      style={{ width: `${hospital.fullness}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="hc-score">
                  <Activity size={16} /> Optimizasyon Skoru: <strong>{hospital.score}/100</strong>
                </div>

                <div className="hc-actions">
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => handleDirections(hospital)}>
                    <Map size={16}/> Yol Tarifi Al
                  </button>
                  {hospital.phone ? (
                    <a href={`tel:${hospital.phone}`} className="btn-outline" style={{ textDecoration: 'none' }}>
                      <Phone size={16}/> {hospital.phone}
                    </a>
                  ) : (
                    <button className="btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      <Phone size={16}/> Numara Yok
                    </button>
                  )}
                  {(() => {
                    const [used, total] = hospital.capacity.split('/').map(Number);
                    const isFull = used >= total;
                    const isRegisteredHere = registeredHospitalId === hospital.id;
                    const isRegisteredElsewhere = registeredHospitalId && !isRegisteredHere;
                    const isDisabled = isFull || isRegisteredHere || isRegisteredElsewhere;

                    let btnText = 'Acile Kayıt Ol';
                    let btnTitle = `Kuyrukta ${hospital.queue} — sıra numaranız #${(parseInt(hospital.queue) || 0) + 1}`;

                    if (isRegisteredHere) {
                      btnText = `Sıra No: #${userQueueNumber}`;
                      btnTitle = 'Bu hastaneye zaten kayıt oldunuz';
                    } else if (isRegisteredElsewhere) {
                      btnText = 'Zaten Sıranız Var';
                      btnTitle = 'Başka bir hastaneye kayıt oldunuz';
                    } else if (isFull) {
                      btnText = 'Kapasite Dolu';
                      btnTitle = 'Kapasite dolu — kayıt yapılamaz';
                    }

                    return (
                      <>
                        <button
                          className={`btn-primary ${isDisabled ? 'btn-disabled' : ''} ${isRegisteredHere ? 'btn-registered' : ''}`}
                          onClick={() => handleRegister(hospital)}
                          disabled={isDisabled}
                          title={btnTitle}
                        >
                          {btnText}
                        </button>
                        {isRegisteredHere && (
                          <button
                            className="btn-cancel"
                            onClick={handleCancelRegistration}
                            title="Sıranızı iptal edin"
                          >
                            İptal Et
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmergencyServices;
