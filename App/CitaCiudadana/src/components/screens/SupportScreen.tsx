import React from 'react';

interface SupportScreenProps {
  setScreen: (screen: number) => void;
}

const SupportScreen: React.FC<SupportScreenProps> = ({ setScreen }) => {
  return (
    <section id="screen23" className="screen" style={{'padding': '0', 'background': '#fdfdfd'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px', 'boxShadow': '0 2px 4px rgba(0,0,0,0.05)'}}>
            <button className="icon-btn" aria-label="Botón de menú o retroceso" onClick={() => { setScreen(8) }} style={{'opacity': '1', 'background': 'transparent'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#326789" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{'width': '26px', 'height': '26px'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <h2 style={{'fontWeight': '800', 'margin': '0', 'color': '#2c4251', 'fontSize': '18px'}}>Soporte / Ayuda</h2>
            <div style={{'width': '28px'}}></div>
        </header>
        <div className="content-area" style={{'padding': '80px 20px 80px', 'textAlign': 'center'}}>
            
            <div style={{'background': '#e8f0f4', 'width': '80px', 'height': '80px', 'borderRadius': '50%', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'margin': '0 auto 20px'}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#326789" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            
            <h3 style={{'color': '#2c4251', 'fontSize': '18px', 'fontWeight': '800', 'marginBottom': '10px'}}>¿Cómo podemos ayudarte?</h3>
            <p style={{'color': '#777', 'fontSize': '13px', 'marginBottom': '30px', 'padding': '0 10px'}}>Nuestro equipo está disponible 24/7 para resolver tus dudas sobre la app o sobre las clínicas.</p>
            
            <button onClick={() => window.location.href = 'tel:8001234567'} style={{'background': '#326789', 'color': 'white', 'width': '100%', 'padding': '16px', 'borderRadius': '12px', 'fontWeight': '600', 'fontSize': '14px', 'border': 'none', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'marginBottom': '15px', 'boxShadow': '0 4px 10px rgba(50, 103, 137, 0.2)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Llamar a Servicio al Cliente
            </button>
            
            <button onClick={() => window.location.href = 'mailto:soporte@citaciudadana.com'} style={{'background': 'white', 'color': '#326789', 'border': '2px solid #326789', 'width': '100%', 'padding': '14px', 'borderRadius': '12px', 'fontWeight': '600', 'fontSize': '14px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#326789" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Enviar un Correo
            </button>
            
            <div style={{'marginTop': '30px', 'textAlign': 'left'}}>
                <h4 style={{'color': '#2c4251', 'fontSize': '14px', 'fontWeight': '700', 'marginBottom': '10px'}}>Preguntas Frecuentes</h4>
                <div style={{'background': 'white', 'borderRadius': '10px', 'padding': '15px', 'border': '1px solid #eee', 'marginBottom': '10px'}}>
                    <strong style={{'fontSize': '13px', 'color': '#333'}}>¿Cómo cancelar una cita?</strong>
                    <p style={{'fontSize': '11px', 'color': '#777', 'margin': '5px 0 0'}}>Ve a la sección "Mis Citas", selecciona la cita y presiona Cancelar con 24hrs de anticipación.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default SupportScreen;
