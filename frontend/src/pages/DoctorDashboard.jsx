import React, { useState } from 'react';
import { Stethoscope, Users, Calendar, Clock, AlertCircle, ArrowUpCircle, ChevronDown, Activity } from 'lucide-react';
import '../styles/doctor.css';

const MOCK_PATIENTS = [
  { id: 1, name: 'Ahmet Yılmaz', age: 42, priority: 2, condition: 'Kronik', nextAppt: '2026-01-24 10:00', history: 'Nöroloji kontrolü' },
  { id: 2, name: 'Fatma Kaya', age: 68, priority: 3, condition: '65+ yaş', nextAppt: '2026-01-24 11:30', history: 'Kardiyoloji takip' },
  { id: 3, name: 'Mehmet Demir', age: 35, priority: 4, condition: 'Engelli', nextAppt: '2026-01-25 09:00', history: 'Ortopedi kontrolü' },
  { id: 4, name: 'Zeynep Arslan', age: 55, priority: 1, condition: 'Doktor Öncelik', nextAppt: '2026-01-24 14:00', history: 'Onkoloji takip' },
  { id: 5, name: 'Ali Öztürk', age: 29, priority: 2, condition: 'Kronik', nextAppt: '2026-01-26 10:30', history: 'Diyabet kontrolü' },
];

const MOCK_SCHEDULE = {
  today: { total: 18, completed: 7, remaining: 11, cancelled: 2 },
  week: { total: 84, completed: 42, remaining: 42, cancelled: 5 },
};

const priorityLabels = {
  1: { text: 'Doktor Önceliği', color: '#ef4444', bg: '#fef2f2' },
  2: { text: 'Kronik Hasta', color: '#f59e0b', bg: '#fffbeb' },
  3: { text: '65+ Yaş', color: '#3b82f6', bg: '#eff6ff' },
  4: { text: 'Engelli', color: '#8b5cf6', bg: '#f5f3ff' },
};

const DoctorDashboard = () => {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [expandedPatient, setExpandedPatient] = useState(null);

  const handlePriorityChange = (patientId, newPriority) => {
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, priority: newPriority, condition: priorityLabels[newPriority].text } : p
    ));
  };

  const sortedPatients = [...patients].sort((a, b) => a.priority - b.priority);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doktor Paneli</h1>
          <p className="page-subtitle">Poliklinik randevu yoğunluğu ve hasta öncelik yönetimi</p>
        </div>
      </div>

      {/* Schedule Stats */}
      <div className="doctor-stats-grid">
        <div className="doctor-stat-card today">
          <div className="stat-header">
            <Calendar size={18} />
            <span>Bugün</span>
          </div>
          <div className="stat-body">
            <div className="stat-big-number">{MOCK_SCHEDULE.today.remaining}</div>
            <div className="stat-detail">kalan randevu</div>
            <div className="stat-sub">
              <span className="completed">{MOCK_SCHEDULE.today.completed} tamamlandı</span>
              <span className="cancelled">{MOCK_SCHEDULE.today.cancelled} iptal</span>
            </div>
          </div>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{
              width: `${(MOCK_SCHEDULE.today.completed / MOCK_SCHEDULE.today.total) * 100}%`
            }} />
          </div>
        </div>

        <div className="doctor-stat-card week">
          <div className="stat-header">
            <Activity size={18} />
            <span>Bu Hafta</span>
          </div>
          <div className="stat-body">
            <div className="stat-big-number">{MOCK_SCHEDULE.week.total}</div>
            <div className="stat-detail">toplam randevu</div>
            <div className="stat-sub">
              <span className="completed">{MOCK_SCHEDULE.week.completed} tamamlandı</span>
              <span className="cancelled">{MOCK_SCHEDULE.week.cancelled} iptal</span>
            </div>
          </div>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{
              width: `${(MOCK_SCHEDULE.week.completed / MOCK_SCHEDULE.week.total) * 100}%`
            }} />
          </div>
        </div>

        <div className="doctor-stat-card patients">
          <div className="stat-header">
            <Users size={18} />
            <span>Hastalarım</span>
          </div>
          <div className="stat-body">
            <div className="stat-big-number">{patients.length}</div>
            <div className="stat-detail">aktif hasta</div>
            <div className="stat-sub">
              <span className="priority-1">{patients.filter(p => p.priority === 1).length} öncelik 1</span>
              <span className="priority-2">{patients.filter(p => p.priority === 2).length} kronik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Priority Management */}
      <div className="tab-content glass-panel">
        <div className="section-header">
          <h3>
            <Stethoscope size={20} />
            Hasta Öncelik Yönetimi
          </h3>
          <p className="section-desc">BRS Kural: Doktor, kronik/kritik hastaları Öncelik 1'e çekebilir.</p>
        </div>

        <div className="patient-list">
          {sortedPatients.map(patient => {
            const pl = priorityLabels[patient.priority];
            const isExpanded = expandedPatient === patient.id;
            return (
              <div key={patient.id} className={`patient-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="patient-main" onClick={() => setExpandedPatient(isExpanded ? null : patient.id)}>
                  <div className="patient-info">
                    <div className="patient-name-row">
                      <strong>{patient.name}</strong>
                      <span className="patient-age">{patient.age} yaş</span>
                    </div>
                    <div className="patient-meta">
                      <Clock size={14} />
                      <span>{patient.nextAppt}</span>
                      <span className="patient-history">• {patient.history}</span>
                    </div>
                  </div>
                  <div className="patient-actions">
                    <span className="priority-tag" style={{ background: pl.bg, color: pl.color }}>
                      {pl.text}
                    </span>
                    <ChevronDown size={18} className={`expand-icon ${isExpanded ? 'rotated' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="patient-expanded fade-in">
                    <div className="priority-controls">
                      <span className="control-label">Öncelik Değiştir:</span>
                      {[1, 2, 3, 4].map(p => (
                        <button
                          key={p}
                          className={`priority-btn ${patient.priority === p ? 'active' : ''}`}
                          style={{
                            background: patient.priority === p ? priorityLabels[p].color : priorityLabels[p].bg,
                            color: patient.priority === p ? 'white' : priorityLabels[p].color,
                          }}
                          onClick={() => handlePriorityChange(patient.id, p)}
                        >
                          {p === 1 && <ArrowUpCircle size={14} />}
                          {priorityLabels[p].text}
                        </button>
                      ))}
                    </div>
                    {patient.priority !== 1 && (
                      <div className="priority-hint">
                        <AlertCircle size={14} />
                        <span>Kritik hastaları "Doktor Önceliği" seviyesine çekerek randevu tahsisinde birinci sıraya alabilirsiniz.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
