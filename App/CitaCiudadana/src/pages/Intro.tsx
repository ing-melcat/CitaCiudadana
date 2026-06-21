import { IonButton, IonContent, IonPage, IonIcon } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router';
import './Intro.css';

const introData = [
  {
    title: 'AGENDA UNA CITA AHORA !',
    subtitle: 'ESTAS LIST@ PARA AGENDAR TU CITA?',
    image: '/images/appointment.jpg',
  },
  {
    title: 'UNA SOLUCIÓN INTELIGENTE PARA TU SALUD',
    subtitle: 'Olvídate de Fila interminables y la preocupación por tus datos con Cita Ciudadana, tu trámite es seguro, rápido y confiable.',
    image: '/images/family.jpg',
  },
  {
    title: 'TU SEGURIDAD TAMBIÉN NOS IMPORTA',
    subtitle: '',
    image: '/images/doctor.jpg',
  }
];

const Intro: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const history = useHistory();

  const nextSlide = () => {
    if (slideIndex < introData.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      history.push('/home', 'forward');
    }
  };

  const current = introData[slideIndex];

  return (
    <IonPage>
      <IonContent className="intro-content" scrollY={false}>
        <div className="header-brand">
          <div className="brand-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>
          </div>
          <div className="brand-text">
            <h2>CitaCiudadana</h2>
            <p>Tu trámite, sin filas.</p>
          </div>
        </div>

        <h3 className="intro-title">{current.title}</h3>

        <div className="intro-image-container">
          <img src={current.image} alt="Intro representation" className="intro-image" />
        </div>

        {current.subtitle && (
          <p className="intro-subtitle">{current.subtitle}</p>
        )}

        <div className="bottom-controls">
          <div className="paginator">
            {introData.map((_, i) => (
              <div key={i} className={`dot ${i === slideIndex ? 'active' : ''}`}></div>
            ))}
          </div>
          <IonButton className="next-btn" shape="round" color="primary" onClick={nextSlide}>
            NEXT
            <IonIcon slot="end" icon={arrowForward} />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Intro;
