import React from 'react';

interface TermsScreenProps {
  setScreen: (screen: number) => void;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ setScreen }) => {
  return (
    <section id="screen14" className="screen" style={{'padding': '0'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" aria-label="Botón de menú o retroceso" onClick={() => { setScreen(5) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div style={{'width': '28px'}}></div>
        </header>
        <div className="content-area" style={{'padding': '70px 20px 80px', 'textAlign': 'left', 'overflowY': 'auto', 'alignItems': 'flex-start'}}>
            <h3 style={{'color': '#326789', 'fontSize': '16px'}}>TÉRMINOS Y CONDICIONES</h3>
            <p style={{'fontSize': '11px', 'color': '#555', 'lineHeight': '1.6', 'marginTop': '10px'}}>
                Bienvenido a CitaCiudadana. Al registrarte y utilizar nuestra plataforma, aceptas los siguientes términos:
                <br /><br />
                <strong style={{'color': '#326789'}}>1. Uso del Servicio:</strong><br />La plataforma tiene como fin principal facilitar la agendación de citas médicas y brindar asesoría médica general a través de nuestra IA. No sustituye una consulta médica de emergencia presencial.
                <br /><br />
                <strong style={{'color': '#326789'}}>2. Responsabilidad:</strong><br />El usuario es responsable de proveer información verídica y mantener la confidencialidad de su cuenta y contraseña.
                <br /><br />
                <strong style={{'color': '#326789'}}>3. Disponibilidad:</strong><br />Las citas están sujetas a la disponibilidad de los especialistas en el momento de la confirmación.
            </p>
        </div>
    </section>
  );
};

export default TermsScreen;
