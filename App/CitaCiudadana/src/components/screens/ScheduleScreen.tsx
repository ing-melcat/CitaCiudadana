import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleScreenProps {
  setIsMenuOpen: (val: boolean) => void;
  setScreen: (val: number) => void;
  handleLoadProfile: () => void;
  symptoms: string;
  setSymptoms: (val: string) => void;
  suggestedSpecialty: string;
  setSearchQuery: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  saveAppointment: () => void;
  userName: string;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  setIsMenuOpen, setScreen, handleLoadProfile, symptoms, setSymptoms,
  suggestedSpecialty, setSearchQuery, selectedDate, setSelectedDate, saveAppointment, userName
}) => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = ["08:00 AM", "09:30 AM", "11:00 AM", "12:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
    let day = new Date(year, month, 1).getDay();
    // Adjust to make Monday the first day of the week (0) instead of Sunday
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <section id="screen11" className="screen" style={{ padding: '0', background: '#ffffff' }}>
      <header className="top-bar" style={{ height: '60px', padding: '0 15px' }}>
        <button className="icon-btn" aria-label="Botón de menú o retroceso" onClick={() => setIsMenuOpen(true)} style={{ opacity: 1 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className="top-bar-center" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#00d1b2', borderRadius: '5px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h2 style={{ fontWeight: 800, margin: 0 }}><span style={{ color: '#2c4251' }}>Cita</span><span style={{ color: '#00d1b2' }}>Ciudadana</span></h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'white', color: '#999', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontWeight: 500 }}>@{userName.split(' ')[0].toUpperCase()}</div>
          <div className="profile-icon-top" aria-label="Perfil" role="button" tabIndex={0} style={{ background: 'none', border: '2px solid white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }} onClick={handleLoadProfile}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="content-area" style={{ padding: '80px 20px 90px' }}
      >
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#2c4251', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>Agendar</h2>
          <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>Dinos qué sientes para sugerirte al mejor especialista.</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '25px', border: '1px solid #f0f4f8' }}>
          <h3 style={{ textAlign: 'left', width: '100%', fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d1b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>
            Tus Síntomas
          </h3>
          <textarea 
            className="textarea-pill" 
            placeholder="Ej. Me duele la cabeza y tengo fiebre..." 
            value={symptoms} 
            onChange={(e) => setSymptoms(e.target.value)} 
            style={{ width: '100%', background: '#f8fbfc', border: '1px solid #e0e8f0', borderRadius: '12px', padding: '15px', fontSize: '14px', minHeight: '100px', resize: 'none', color: '#333', transition: 'border-color 0.3s' }}
          ></textarea>

          <AnimatePresence>
            {suggestedSpecialty && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 15 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ background: 'linear-gradient(135deg, #e0fcf5 0%, #f0fdf9 100%)', border: '1px solid #bcece0', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}
              >
                <div style={{ background: '#00d1b2', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#009b84', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Especialidad Sugerida</strong><br />
                  <span style={{ color: '#2c4251', fontSize: '16px', fontWeight: 700 }}>{suggestedSpecialty}</span>
                </div>
                <button onClick={() => { setSearchQuery(suggestedSpecialty); setScreen(17); }} style={{ background: '#2c4251', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 10px rgba(44, 66, 81, 0.2)' }}>
                  Buscar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '25px', border: '1px solid #f0f4f8' }}>
          <h3 style={{ textAlign: 'left', width: '100%', fontSize: '14px', fontWeight: 700, marginBottom: '15px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Fecha de Asistencia
          </h3>
          
          <div style={{ background: '#f8fbfc', borderRadius: '12px', padding: '15px', border: '1px solid #e0e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: '#508ca4', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div style={{ fontWeight: 700, color: '#508ca4', fontSize: '13px', textAlign: 'center', textTransform: 'uppercase' }}>
                {monthNames[currentMonth]} {currentYear}
              </div>
              <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: '#508ca4', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '12px', color: '#888', fontWeight: 600, marginBottom: '10px' }}>
              <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`}></div>)}
              {[...Array(daysInMonth)].map((_, i) => {
                const d = i + 1;
                const dateStr = `${d} ${monthNames[currentMonth].substring(0,3)} ${currentYear}`;
                const isSelected = selectedDate === dateStr;
                return (
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    key={d} 
                    onClick={() => setSelectedDate(dateStr)} 
                    style={{
                      width: '32px', height: '32px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', borderRadius: '50%', fontSize: '13px', fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#00d1b2' : 'transparent', 
                      color: isSelected ? 'white' : '#444',
                      boxShadow: isSelected ? '0 4px 10px rgba(0, 209, 178, 0.4)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {d}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* TIME SLOTS SECTION */}
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '25px', border: '1px solid #f0f4f8' }}>
          <h3 style={{ textAlign: 'left', width: '100%', fontSize: '14px', fontWeight: 700, marginBottom: '15px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Hora Disponible
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {timeSlots.map(time => {
              const isSelected = selectedTime === time;
              return (
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  style={{
                    background: isSelected ? '#00d1b2' : '#f8fbfc',
                    color: isSelected ? 'white' : '#508ca4',
                    border: isSelected ? '1px solid #00d1b2' : '1px solid #e0e8f0',
                    borderRadius: '10px',
                    padding: '10px 5px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 10px rgba(0, 209, 178, 0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {time}
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Update the selectedDate to include the time if a time is selected
            if (selectedTime) {
                setSelectedDate(`${selectedDate} - ${selectedTime}`);
            }
            saveAppointment();
          }} 
          style={{
            background: 'linear-gradient(135deg, #00d1b2 0%, #00a88f 100%)', 
            width: '100%', 
            display: 'block', 
            padding: '16px', 
            fontSize: '15px', 
            borderRadius: '16px', 
            fontWeight: 700, 
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 20px rgba(0, 209, 178, 0.3)',
            cursor: 'pointer',
            letterSpacing: '0.5px'
          }}
        >
          CONFIRMAR CITA
        </motion.button>
      </motion.div>

      <nav className="bottom-nav">
        <button onClick={() => setScreen(8)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
        <button className="active" onClick={() => setScreen(11)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
        <button onClick={() => setScreen(10)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
        <button onClick={() => setScreen(13)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
        <button onClick={handleLoadProfile}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
      </nav>
    </section>
  );
};
