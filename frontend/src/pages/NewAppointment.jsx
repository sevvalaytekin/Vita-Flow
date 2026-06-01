import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addAppointment } from '../features/appointmentSlice';
// City center coordinates for Overpass API queries
const cityCoords = {
  '34': { name: 'İstanbul', lat: 41.0082, lon: 28.9784 },
  '06': { name: 'Ankara', lat: 39.9334, lon: 32.8597 },
  '35': { name: 'İzmir', lat: 38.4237, lon: 27.1428 },
};

const districtsByCity = {
  '34': [
    'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
    'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü',
    'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt',
    'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
    'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
    'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
    'Ümraniye', 'Üsküdar', 'Zeytinburnu'
  ],
  '06': [
    'Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya',
    'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana',
    'Kalecik', 'Kahramankazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan',
    'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'
  ],
  '35': [
    'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova',
    'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe',
    'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz',
    'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar',
    'Selçuk', 'Tire', 'Torbalı', 'Urla'
  ]
};

const doctorsByClinic = {
  acil: ['Uzm. Dr. Emre Kaya', 'Uzm. Dr. Selin Arslan', 'Dr. Burak Demir'],
  aile: ['Uzm. Dr. Fatma Yıldız', 'Uzm. Dr. Hakan Öztürk', 'Dr. Ayşe Çelik'],
  agiz_dis: ['Dt. Merve Aksoy', 'Dt. Oğuzhan Şahin', 'Dt. Elif Korkmaz'],
  allerji: ['Prof. Dr. Nilgün Atakan', 'Doç. Dr. Serkan Yılmaz', 'Uzm. Dr. Zeynep Aydın'],
  anestezi: ['Prof. Dr. Mustafa Arslan', 'Uzm. Dr. Deniz Kara', 'Uzm. Dr. Gül Erdoğan'],
  beyin_cerrahi: ['Prof. Dr. Uğur Türe', 'Doç. Dr. Hakan Bilen', 'Uzm. Dr. Ali Şimşek'],
  cocuk: ['Prof. Dr. Canan Hasanoğlu', 'Uzm. Dr. Burcu Özen', 'Uzm. Dr. Murat Koç'],
  cocuk_cerrahi: ['Prof. Dr. Halil Tuğtepe', 'Doç. Dr. Elif Erol', 'Uzm. Dr. Kerem Yılmaz'],
  dahiliye: ['Prof. Dr. Ahmet Yılmaz', 'Doç. Dr. Mehmet Akar', 'Uzm. Dr. Sevgi Özkan'],
  dermatoloji: ['Prof. Dr. Şebnem Özkan', 'Uzm. Dr. Derya Koç', 'Uzm. Dr. Baran Yılmaz'],
  endokrinoloji: ['Prof. Dr. İlhan Satman', 'Doç. Dr. Elif Özdemir', 'Uzm. Dr. Tolga Akın'],
  enfeksiyon: ['Prof. Dr. Haluk Eraksoy', 'Doç. Dr. Serap Şimşek', 'Uzm. Dr. Volkan Korten'],
  fizik_tedavi: ['Prof. Dr. Dilşad Sindel', 'Uzm. Dr. Esra Demirci', 'Uzm. Dr. Can Güneş'],
  gastroenteroloji: ['Prof. Dr. Kadir Demir', 'Doç. Dr. Fatih Beşışık', 'Uzm. Dr. Nihan Aksoy'],
  genel_cerrahi: ['Prof. Dr. Korhan Taviloğlu', 'Doç. Dr. Orhan Alimoğlu', 'Uzm. Dr. Barış Yılmaz'],
  gogus_cerrahi: ['Prof. Dr. Akif Turna', 'Doç. Dr. Hasan Çaylak', 'Uzm. Dr. Murat Özgül'],
  gogus: ['Prof. Dr. Benan Müsellim', 'Uzm. Dr. Gülşah Günlüoğlu', 'Uzm. Dr. Emel Çağlar'],
  goz: ['Prof. Dr. Nur Acar Göçgil', 'Uzm. Dr. Ayşe Demir', 'Uzm. Dr. Serkan Özkaya'],
  hematoloji: ['Prof. Dr. Teoman Soysal', 'Doç. Dr. Zafer Başlar', 'Uzm. Dr. Burhan Ferhanoğlu'],
  infertilite: ['Prof. Dr. Bülent Tıraş', 'Doç. Dr. Hakan Özörnek', 'Uzm. Dr. Ayşe Seyhan'],
  kadin_dogum: ['Prof. Dr. Recai Pabuçcu', 'Uzm. Dr. Elif Cansu', 'Uzm. Dr. Gamze Sınacı'],
  kalp_damar: ['Prof. Dr. Bingür Sönmez', 'Doç. Dr. Kaan Kırali', 'Uzm. Dr. Osman Akdemir'],
  kardiyoloji: ['Prof. Dr. Vedat Aytekin', 'Doç. Dr. Cevat Kırma', 'Uzm. Dr. Gönül Açıksarı'],
  kbb: ['Prof. Dr. Desiderio Passàli', 'Uzm. Dr. Selçuk İnanlı', 'Uzm. Dr. Elif Baysal'],
  nefroloji: ['Prof. Dr. Alaattin Yıldız', 'Doç. Dr. Nihan Turhan', 'Uzm. Dr. Sinan Trabulus'],
  noroloji: ['Prof. Dr. Oğuzhan Çoban', 'Doç. Dr. Esme Ekizoğlu', 'Uzm. Dr. Betül Baykan'],
  nukleer_tip: ['Prof. Dr. Halil Turgut Turoğlu', 'Uzm. Dr. Cüneyt Türkmen', 'Uzm. Dr. Şule Akın'],
  onkoloji: ['Prof. Dr. Adnan Aydıner', 'Doç. Dr. Yeşim Eralp', 'Uzm. Dr. Sezer Sağlam'],
  ortopedi: ['Prof. Dr. Cengiz Şen', 'Doç. Dr. Murat Bozkurt', 'Uzm. Dr. Emre Çullu'],
  patoloji: ['Prof. Dr. Sıtkı Tuzlalı', 'Uzm. Dr. Mine Güllüoğlu', 'Uzm. Dr. Nihan Haberal'],
  plastik_cerrahi: ['Prof. Dr. Atilla Arıncı', 'Doç. Dr. Karaca Başaran', 'Uzm. Dr. Gaye Toplu'],
  psikiyatri: ['Prof. Dr. Cengiz Kılıç', 'Uzm. Dr. Aslı Engin', 'Uzm. Dr. Barış Önen Ünsalver'],
  radyasyon: ['Prof. Dr. Gökhan Özyiğit', 'Uzm. Dr. Senem Demirci', 'Uzm. Dr. Cem Parlak'],
  radyoloji: ['Prof. Dr. Okan Akhan', 'Uzm. Dr. Deniz Akata', 'Uzm. Dr. Elif Çelik'],
  romatoloji: ['Prof. Dr. Haner Direskeneli', 'Doç. Dr. Ömer Karadağ', 'Uzm. Dr. Sinem Nihal Esatoğlu'],
  uroloji: ['Prof. Dr. Ateş Kadıoğlu', 'Doç. Dr. Asıf Yıldırım', 'Uzm. Dr. Emre Huri']
};

const clinicLabels = {
  aile: 'Aile Hekimliği', agiz_dis: 'Ağız ve Diş Sağlığı', allerji: 'Allerji ve İmmünoloji',
  anestezi: 'Anesteziyoloji ve Reanimasyon', beyin_cerrahi: 'Beyin ve Sinir Cerrahisi', cocuk: 'Çocuk Hastalıkları (Pediatri)',
  cocuk_cerrahi: 'Çocuk Cerrahisi', dahiliye: 'Dahiliye (İç Hastalıkları)', dermatoloji: 'Dermatoloji (Cilt Hastalıkları)',
  endokrinoloji: 'Endokrinoloji ve Metabolizma', enfeksiyon: 'Enfeksiyon Hastalıkları', fizik_tedavi: 'Fizik Tedavi ve Rehabilitasyon',
  gastroenteroloji: 'Gastroenteroloji', genel_cerrahi: 'Genel Cerrahi', gogus_cerrahi: 'Göğüs Cerrahisi',
  gogus: 'Göğüs Hastalıkları (Pulmonoloji)', goz: 'Göz Hastalıkları', hematoloji: 'Hematoloji',
  infertilite: 'İnfertilite (Tüp Bebek)', kadin_dogum: 'Kadın Hastalıkları ve Doğum', kalp_damar: 'Kalp ve Damar Cerrahisi',
  kardiyoloji: 'Kardiyoloji', kbb: 'Kulak Burun Boğaz (KBB)', nefroloji: 'Nefroloji', noroloji: 'Nöroloji',
  nukleer_tip: 'Nükleer Tıp', onkoloji: 'Onkoloji (Tıbbi)', ortopedi: 'Ortopedi ve Travmatoloji',
  patoloji: 'Patoloji', plastik_cerrahi: 'Plastik ve Rekonstrüktif Cerrahi', psikiyatri: 'Psikiyatri',
  radyasyon: 'Radyasyon Onkolojisi', radyoloji: 'Radyoloji', romatoloji: 'Romatoloji', uroloji: 'Üroloji'
};

const NewAppointment = ({ isEmbedded, onAppointmentCreated }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [searchMode, setSearchMode] = useState('general');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const [formData, setFormData] = useState({
    city: '',
    district: '',
    clinic: '',
    hospital: '',
    doctor: '',
    date: ''
  });

  // Dynamic hospital list from Overpass API
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  // Fetch hospitals from Overpass API based on city and optional district
  const fetchHospitals = useCallback(async (cityCode, district) => {
    if (!cityCode || !cityCoords[cityCode]) {
      setHospitals([]);
      return;
    }
    setHospitalsLoading(true);

    let query;

    if (district) {
      // Step 1: Get the exact OSM area ID for this district via Nominatim
      const cityName = cityCoords[cityCode].name;
      let areaId = null;
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(district + ', ' + cityName)}&format=json&limit=1&addressdetails=1&featuretype=settlement`,
          { headers: { 'Accept-Language': 'tr' } }
        );
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          const osmId = parseInt(geoData[0].osm_id);
          const osmType = geoData[0].osm_type;
          // Convert OSM ID to Overpass area ID
          if (osmType === 'relation') {
            areaId = osmId + 3600000000;
          } else if (osmType === 'way') {
            areaId = osmId + 2400000000;
          }
        }
      } catch (e) {
        console.error('Nominatim hatası:', e);
      }

      if (areaId) {
        // Step 2: Query hospitals within the exact district boundary
        query = `
          [out:json][timeout:30];
          (
            node["amenity"="hospital"](area:${areaId});
            way["amenity"="hospital"](area:${areaId});
            relation["amenity"="hospital"](area:${areaId});
            node["amenity"="clinic"](area:${areaId});
            way["amenity"="clinic"](area:${areaId});
            node["healthcare"="hospital"](area:${areaId});
            way["healthcare"="hospital"](area:${areaId});
          );
          out center body 300;
        `;
      } else {
        // Fallback: use bounding box if area ID not found
        const geoRes2 = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(district + ', ' + cityName + ', Turkey')}&format=json&limit=1`
        );
        const geoData2 = await geoRes2.json();
        if (geoData2.length > 0 && geoData2[0].boundingbox) {
          const bb = geoData2[0].boundingbox;
          query = `
            [out:json][timeout:30];
            (
              node["amenity"="hospital"](${bb[0]},${bb[2]},${bb[1]},${bb[3]});
              way["amenity"="hospital"](${bb[0]},${bb[2]},${bb[1]},${bb[3]});
              node["amenity"="clinic"](${bb[0]},${bb[2]},${bb[1]},${bb[3]});
              way["amenity"="clinic"](${bb[0]},${bb[2]},${bb[1]},${bb[3]});
            );
            out center body 300;
          `;
        } else {
          // Last fallback: city-wide
          const { lat, lon } = cityCoords[cityCode];
          query = `
            [out:json][timeout:30];
            (
              node["amenity"="hospital"](around:50000,${lat},${lon});
              way["amenity"="hospital"](around:50000,${lat},${lon});
              relation["amenity"="hospital"](around:50000,${lat},${lon});
            );
            out center body 200;
          `;
        }
      }
    } else {
      // City-level query
      const { lat, lon } = cityCoords[cityCode];
      query = `
        [out:json][timeout:30];
        (
          node["amenity"="hospital"](around:50000,${lat},${lon});
          way["amenity"="hospital"](around:50000,${lat},${lon});
          relation["amenity"="hospital"](around:50000,${lat},${lon});
        );
        out center body 200;
      `;
    }

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`API hatası: ${res.status}`);
      const data = await res.json();

      const results = (data.elements || [])
        .filter(el => el.tags?.name)
        .map(el => ({
          id: String(el.id),
          name: el.tags.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      // Deduplicate by name
      const unique = [];
      const seen = new Set();
      for (const h of results) {
        if (!seen.has(h.name)) {
          seen.add(h.name);
          unique.push(h);
        }
      }

      setHospitals(unique);
    } catch (err) {
      console.error('Overpass API hatası:', err);
      toast.warn('Canlı hastane verileri çekilemedi, varsayılan hastaneler listeleniyor.');
      setHospitals([
        { id: 'mock-1', name: 'Şehir Hastanesi' },
        { id: 'mock-2', name: 'Eğitim ve Araştırma Hastanesi' },
        { id: 'mock-3', name: 'Acıbadem Hastanesi' },
        { id: 'mock-4', name: 'Memorial Hastanesi' },
        { id: 'mock-5', name: 'Medipol Hastanesi' }
      ]);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals(formData.city, formData.district);
  }, [formData.city, formData.district, fetchHospitals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city') {
      setFormData({ ...formData, city: value, district: '', hospital: '', doctor: '' });
    } else if (name === 'district') {
      setFormData({ ...formData, district: value, hospital: '' });
    } else if (name === 'clinic') {
      setFormData({ ...formData, clinic: value, doctor: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleClear = () => {
    setFormData({
      city: '',
      district: '',
      clinic: '',
      hospital: '',
      doctor: '',
      date: ''
    });
    setHospitals([]);
  };

  const handleSearch = () => {
    if (searchMode === 'general' && !formData.clinic) {
      toast.warn('Lütfen en azından bir klinik (branş) seçiniz.');
      return;
    }
    setStep(2);
    setSelectedSlotIndex(null);
  };

  // Generate options for step 2
  const appointmentOptions = (formData.date ? [0, 1, 2] : [0, 1, 2, 3]).map((index) => {
    const displayHospital = formData.hospital 
      ? (hospitals.find(h => h.id === formData.hospital)?.name || 'Seçilen Hastane') 
      : (hospitals.length > index ? hospitals[index % hospitals.length].name : 'Bölge Devlet Hastanesi');
    
    const displayClinic = formData.clinic ? clinicLabels[formData.clinic] : 'Klinik';
      
    const displayDoctor = formData.doctor 
      ? formData.doctor 
      : (formData.clinic && doctorsByClinic[formData.clinic] ? doctorsByClinic[formData.clinic][index % doctorsByClinic[formData.clinic].length] : 'Uzm. Dr. Hekim');
      
    const dateObj = formData.date ? new Date(formData.date) : new Date();
    
    if (!formData.date) {
      dateObj.setDate(dateObj.getDate() + index); // Today, Tomorrow, etc.
      const times = [[10, 30], [14, 15], [9, 15], [15, 45]];
      dateObj.setHours(times[index][0], times[index][1], 0);
    } else {
      const times = [[9, 0], [11, 30], [14, 45], [16, 15]];
      dateObj.setHours(times[index][0], times[index][1], 0);
    }
    
    const displayDate = dateObj.toLocaleDateString('tr-TR');
    const displayTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return {
      hospital: displayHospital,
      clinic: displayClinic,
      doctor: displayDoctor,
      dateDisplay: displayDate,
      timeDisplay: displayTime,
      fullDateStr: dateObj.toISOString() // to store in Redux
    };
  });

  const handleConfirm = () => {
    if (selectedSlotIndex === null) {
      toast.warn('Lütfen bir randevu saati seçiniz.');
      return;
    }

    const selectedOption = appointmentOptions[selectedSlotIndex];
    
    const newAppointment = {
      id: Date.now(),
      hospital: selectedOption.hospital,
      doctor: `${selectedOption.clinic} - ${selectedOption.doctor}`,
      date: selectedOption.fullDateStr,
      status: 'Onaylandı'
    };

    dispatch(addAppointment(newAppointment));
    toast.success('Randevunuz başarıyla oluşturuldu!');
    
    if (onAppointmentCreated) {
      onAppointmentCreated();
    } else {
      navigate('/appointments');
    }
  };

  const content = (
    <div className="auth-card glass-panel" style={{ maxWidth: '800px', width: '100%', margin: isEmbedded ? '0 auto' : undefined, boxShadow: isEmbedded ? 'none' : undefined, background: isEmbedded ? 'transparent' : undefined }}>
      {step === 1 && (
        <>
          {/* Search Mode Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
            <button
              className={searchMode === 'general' ? 'btn-primary' : 'btn-outline'}
              onClick={() => setSearchMode('general')}
              style={{ flex: 1 }}
            >
              Genel Randevu Ara
            </button>
            <button
              className={searchMode === 'location' ? 'btn-primary' : 'btn-outline'}
              onClick={() => setSearchMode('location')}
              style={{ flex: 1 }}
            >
              Konuma Göre Hastane Arama
            </button>
          </div>

          <div className="auth-form fade-in">
            {searchMode === 'general' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>İl</label>
                    <select className="styled-select" name="city" value={formData.city} onChange={handleChange}>
                      <option value="">İl Seçiniz</option>
                      <option value="34">İstanbul</option>
                      <option value="06">Ankara</option>
                      <option value="35">İzmir</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>İlçe</label>
                    <select className="styled-select" name="district" value={formData.district} onChange={handleChange} disabled={!formData.city}>
                      <option value="">-FARK ETMEZ-</option>
                      {formData.city && districtsByCity[formData.city]?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Klinik (Branş) *</label>
                  <select className="styled-select" name="clinic" value={formData.clinic} onChange={handleChange}>
                    <option value="">Klinik Seçiniz</option>
                    <option value="acil">Acil Tıp</option>
                    <option value="aile">Aile Hekimliği</option>
                    <option value="agiz_dis">Ağız ve Diş Sağlığı</option>
                    <option value="allerji">Allerji ve İmmünoloji</option>
                    <option value="anestezi">Anesteziyoloji ve Reanimasyon</option>
                    <option value="beyin_cerrahi">Beyin ve Sinir Cerrahisi</option>
                    <option value="cocuk">Çocuk Hastalıkları (Pediatri)</option>
                    <option value="cocuk_cerrahi">Çocuk Cerrahisi</option>
                    <option value="dahiliye">Dahiliye (İç Hastalıkları)</option>
                    <option value="dermatoloji">Dermatoloji (Cilt Hastalıkları)</option>
                    <option value="endokrinoloji">Endokrinoloji ve Metabolizma</option>
                    <option value="enfeksiyon">Enfeksiyon Hastalıkları</option>
                    <option value="fizik_tedavi">Fizik Tedavi ve Rehabilitasyon</option>
                    <option value="gastroenteroloji">Gastroenteroloji</option>
                    <option value="genel_cerrahi">Genel Cerrahi</option>
                    <option value="gogus_cerrahi">Göğüs Cerrahisi</option>
                    <option value="gogus">Göğüs Hastalıkları (Pulmonoloji)</option>
                    <option value="goz">Göz Hastalıkları</option>
                    <option value="hematoloji">Hematoloji</option>
                    <option value="infertilite">İnfertilite (Tüp Bebek)</option>
                    <option value="kadin_dogum">Kadın Hastalıkları ve Doğum</option>
                    <option value="kalp_damar">Kalp ve Damar Cerrahisi</option>
                    <option value="kardiyoloji">Kardiyoloji</option>
                    <option value="kbb">Kulak Burun Boğaz (KBB)</option>
                    <option value="nefroloji">Nefroloji</option>
                    <option value="noroloji">Nöroloji</option>
                    <option value="nukleer_tip">Nükleer Tıp</option>
                    <option value="onkoloji">Onkoloji (Tıbbi)</option>
                    <option value="ortopedi">Ortopedi ve Travmatoloji</option>
                    <option value="patoloji">Patoloji</option>
                    <option value="plastik_cerrahi">Plastik ve Rekonstrüktif Cerrahi</option>
                    <option value="psikiyatri">Psikiyatri</option>
                    <option value="radyasyon">Radyasyon Onkolojisi</option>
                    <option value="radyoloji">Radyoloji</option>
                    <option value="romatoloji">Romatoloji</option>
                    <option value="uroloji">Üroloji</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Hastane
                    {hospitalsLoading && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 'normal' }}>
                        (yükleniyor...)
                      </span>
                    )}
                    {!hospitalsLoading && formData.city && hospitals.length > 0 && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                        ({hospitals.length} hastane bulundu)
                      </span>
                    )}
                  </label>
                  <select
                    className="styled-select"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    disabled={!formData.city || hospitalsLoading}
                  >
                    <option value="">
                      {hospitalsLoading ? 'Hastaneler yükleniyor...' : '-FARK ETMEZ-'}
                    </option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Hekim</label>
                    <select
                      className="styled-select"
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleChange}
                      disabled={!formData.clinic}
                    >
                      <option value="">-FARK ETMEZ-</option>
                      {formData.clinic && doctorsByClinic[formData.clinic]?.map(doc => (
                        <option key={doc} value={doc}>{doc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tarih (İsteğe Bağlı)</label>
                    <input
                      type="date"
                      className="styled-select"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="btn-primary" onClick={handleSearch} style={{ flex: 2 }}>
                    🔍 Randevu Ara
                  </button>
                  <button className="btn-outline" onClick={handleClear} style={{ flex: 1, backgroundColor: '#ff4d4f', color: 'white', border: 'none' }}>
                    ↺ Temizle
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                <h3>En Yakın Hastaneleri Bul</h3>
                <p className="cn-desc" style={{ marginBottom: '1.5rem' }}>Cihazınızın konum bilgisini kullanarak size en yakın hastaneleri ve uygun randevuları listeleyebiliriz.</p>
                
                <div className="form-group" style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 1rem auto' }}>
                  <label>Klinik (Branş) Seçiniz *</label>
                  <select className="styled-select" name="clinic" value={formData.clinic} onChange={handleChange}>
                    <option value="">Klinik Seçiniz</option>
                    <option value="acil">Acil Tıp</option>
                    <option value="aile">Aile Hekimliği</option>
                    <option value="agiz_dis">Ağız ve Diş Sağlığı</option>
                    <option value="allerji">Allerji ve İmmünoloji</option>
                    <option value="anestezi">Anesteziyoloji ve Reanimasyon</option>
                    <option value="beyin_cerrahi">Beyin ve Sinir Cerrahisi</option>
                    <option value="cocuk">Çocuk Hastalıkları (Pediatri)</option>
                    <option value="cocuk_cerrahi">Çocuk Cerrahisi</option>
                    <option value="dahiliye">Dahiliye (İç Hastalıkları)</option>
                    <option value="dermatoloji">Dermatoloji (Cilt Hastalıkları)</option>
                    <option value="endokrinoloji">Endokrinoloji ve Metabolizma</option>
                    <option value="enfeksiyon">Enfeksiyon Hastalıkları</option>
                    <option value="fizik_tedavi">Fizik Tedavi ve Rehabilitasyon</option>
                    <option value="gastroenteroloji">Gastroenteroloji</option>
                    <option value="genel_cerrahi">Genel Cerrahi</option>
                    <option value="gogus_cerrahi">Göğüs Cerrahisi</option>
                    <option value="gogus">Göğüs Hastalıkları (Pulmonoloji)</option>
                    <option value="goz">Göz Hastalıkları</option>
                    <option value="hematoloji">Hematoloji</option>
                    <option value="infertilite">İnfertilite (Tüp Bebek)</option>
                    <option value="kadin_dogum">Kadın Hastalıkları ve Doğum</option>
                    <option value="kalp_damar">Kalp ve Damar Cerrahisi</option>
                    <option value="kardiyoloji">Kardiyoloji</option>
                    <option value="kbb">Kulak Burun Boğaz (KBB)</option>
                    <option value="nefroloji">Nefroloji</option>
                    <option value="noroloji">Nöroloji</option>
                    <option value="nukleer_tip">Nükleer Tıp</option>
                    <option value="onkoloji">Onkoloji (Tıbbi)</option>
                    <option value="ortopedi">Ortopedi ve Travmatoloji</option>
                    <option value="patoloji">Patoloji</option>
                    <option value="plastik_cerrahi">Plastik ve Rekonstrüktif Cerrahi</option>
                    <option value="psikiyatri">Psikiyatri</option>
                    <option value="radyasyon">Radyasyon Onkolojisi</option>
                    <option value="radyoloji">Radyoloji</option>
                    <option value="romatoloji">Romatoloji</option>
                    <option value="uroloji">Üroloji</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                  <label>Tarih (İsteğe Bağlı)</label>
                  <input
                    type="date"
                    className="styled-select"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <button className="btn-primary" onClick={() => {
                  if (!formData.clinic) {
                    toast.warn('Lütfen arama yapmadan önce bir klinik (branş) seçiniz.');
                    return;
                  }
                  toast.info('Konum izni isteniyor...');
                  setTimeout(() => setStep(2), 1500);
                }}>
                  Konumumu Kullanarak Ara
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {step === 2 && (
        <div className="auth-form fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Uygun Randevular</h3>
            <button className="btn-outline" onClick={() => setStep(1)} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
              ← Geri Dön
            </button>
          </div>

          <p className="cn-desc">Arama kriterlerinize uygun randevu saatleri aşağıda listelenmiştir.</p>

          <div className="demo-list" style={{ marginTop: '1rem' }}>
            {appointmentOptions.map((opt, index) => (
              <label key={index} className="checkbox-label" style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', marginBottom: '1rem', display: 'block' }}>
                <input 
                  type="radio" 
                  name="time" 
                  value={index} 
                  checked={selectedSlotIndex === index}
                  onChange={() => setSelectedSlotIndex(index)}
                  style={{ float: 'left', marginTop: '4px' }} 
                />
                <div style={{ marginLeft: '2rem' }}>
                  <strong>{opt.hospital}</strong><br/>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{opt.clinic} - {opt.doctor}</span><br/>
                  <span style={{ color: '#0ea5e9', fontWeight: '500' }}>{opt.dateDisplay} - {opt.timeDisplay}</span>
                </div>
              </label>
            ))}
          </div>

          <button className="btn-primary" onClick={handleConfirm} style={{ marginTop: '2rem', width: '100%' }}>
            Randevuyu Onayla
          </button>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Randevu Ara</h1>
        <p className="page-subtitle">Size uygun randevuyu bulmak için aşağıdaki formu doldurun veya konumunuza göre arayın.</p>
      </div>
      {content}
    </div>
  );
};

export default NewAppointment;
