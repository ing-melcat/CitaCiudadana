import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonIcon, IonCard, IonCardContent, IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonLabel } from '@ionic/react';
import { home, calendar, search, list, person, addCircle, calendarOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <span style={{ color: 'var(--ion-color-secondary)' }}>Cita</span>
            <span style={{ color: 'var(--ion-color-success)' }}>Ciudadana</span>
          </IonTitle>
          <IonButtons slot="end">
            <div className="profile-icon">
              <IonIcon icon={person} />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="greeting-pill">
          Hola <strong>@Nombre</strong>
        </div>

        <div className="actions-grid">
          <IonCard className="action-card primary-bg">
            <IonCardContent>
              <h3>AGENDAR NUEVA CITA</h3>
              <div className="icon-bottom-right">
                <IonIcon icon={addCircle} />
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard className="action-card secondary-bg">
            <IonCardContent className="center-content">
              <IonIcon icon={list} className="large-icon" />
              <p>MIS CITAS</p>
            </IonCardContent>
          </IonCard>
        </div>

        <IonCard className="appointment-card highlight">
          <IonCardContent>
            <div className="top-row">
              <strong>PROXIMA CITA</strong> 
              <span>10 / 10 / 2025</span>
            </div>
            <h2 className="time">11:30 - 12:30 AM</h2>
            <div className="pill-label">REVISION MEDICA</div>
          </IonCardContent>
        </IonCard>

        <IonCard className="appointment-card">
          <IonCardContent>
            <div className="top-row">
              <strong>CITAS FUTURAS</strong> 
              <span>20 / 11 / 2026</span>
            </div>
            <h2 className="time">11:30 - 12:30 AM</h2>
            <div className="pill-label">REALIZACION DE ESTUDIOS</div>
          </IonCardContent>
        </IonCard>

        <button className="emergency-btn">
          TIENES UNA EMERGENCIA <span className="emoji">🚑</span>
        </button>
      </IonContent>

      <IonTabBar slot="bottom" className="custom-tab-bar">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={home} />
        </IonTabButton>
        <IonTabButton tab="calendar">
          <IonIcon icon={calendarOutline} />
        </IonTabButton>
        <IonTabButton tab="search">
          <IonIcon icon={search} />
        </IonTabButton>
        <IonTabButton tab="list">
          <IonIcon icon={list} />
        </IonTabButton>
        <IonTabButton tab="profile">
          <IonIcon icon={person} />
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default Home;
