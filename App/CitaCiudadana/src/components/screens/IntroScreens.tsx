import React from 'react';

interface IntroScreensProps {
  screen: number;
  setScreen: (screen: number) => void;
}

export const IntroScreens: React.FC<IntroScreensProps> = ({ screen, setScreen }) => {
  return (
    <>
      {screen === 1 && (
        <section id="screen1" className="screen intro-screen active">
            <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'marginTop': '10px'}}>
                <div style={{'background': '#326789', 'borderRadius': '12px', 'width': '45px', 'height': '45px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>
                </div>
                <div style={{'textAlign': 'left'}}>
                    <h2 style={{'textTransform': 'none', 'marginBottom': '0', 'fontSize': '20px', 'color': '#184a68', 'fontWeight': '800'}}>CitaCiudadana</h2>
                    <p style={{'marginTop': '-2px', 'fontSize': '12px', 'color': '#508ca4', 'fontWeight': '600'}}>Tu trámite, sin filas.</p>
                </div>
            </div>

            <h3 style={{'color': '#326789', 'textTransform': 'uppercase', 'fontSize': '14px', 'marginTop': '30px', 'fontWeight': '800'}}>AGENDA UNA CITA AHORA !</h3>

            <div style={{'width': '100%', 'height': '260px', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'margin': '10px 0'}}>
                <img src="images/appointment.jpg" style={{'maxWidth': '100%', 'maxHeight': '100%', 'objectFit': 'contain', 'mixBlendMode': 'multiply'}} />
            </div>

            <h3 style={{'color': '#184a68', 'textTransform': 'uppercase', 'fontSize': '12px', 'marginTop': '10px', 'fontWeight': '800'}}>ESTAS LIST@ PARA AGENDAR TU CITA?</h3>

            <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between', 'width': '100%', 'marginTop': '20px', 'padding': '0 10px'}}>
                <div className="paginator" style={{'margin': '0', 'gap': '6px'}}>
                    <div className="dot active" style={{'background': '#326789', 'width': '10px', 'height': '10px'}}></div>
                    <div className="dot" style={{'background': 'white', 'border': '2px solid #ccc', 'width': '10px', 'height': '10px'}}></div>
                    <div className="dot" style={{'background': 'white', 'border': '2px solid #ccc', 'width': '10px', 'height': '10px'}}></div>
                </div>
                <button className="main-btn" aria-label="Botón de acción principal" onClick={() => { setScreen(2) }} style={{'width': 'auto', 'padding': '8px 25px', 'borderRadius': '20px', 'background': '#326789', 'fontSize': '12px', 'fontWeight': '500'}}>NEXT</button>
            </div>
        </section>
      )}

      {screen === 2 && (
        <section id="screen2" className="screen intro-screen">
            <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'marginTop': '10px'}}>
                <div style={{'background': '#326789', 'borderRadius': '12px', 'width': '45px', 'height': '45px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>
                </div>
                <div style={{'textAlign': 'left'}}>
                    <h2 style={{'textTransform': 'none', 'marginBottom': '0', 'fontSize': '20px', 'color': '#184a68', 'fontWeight': '800'}}>CitaCiudadana</h2>
                    <p style={{'marginTop': '-2px', 'fontSize': '12px', 'color': '#508ca4', 'fontWeight': '600'}}>Tu trámite, sin filas.</p>
                </div>
            </div>

            <h3 style={{'color': '#326789', 'textTransform': 'uppercase', 'fontSize': '13px', 'marginTop': '30px', 'fontWeight': '800'}}>UNA SOLUCIÓN INTELIGENTE<br />PARA TU SALUD</h3>

            <div style={{'width': '100%', 'height': '260px', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'margin': '10px 0'}}>
                <img src="images/family.jpg" style={{'maxWidth': '100%', 'maxHeight': '100%', 'objectFit': 'contain', 'mixBlendMode': 'multiply'}} />
            </div>

            <p style={{'fontSize': '10px', 'fontWeight': '500', 'color': '#184a68', 'marginTop': '10px', 'padding': '0 10px'}}>Olvídate de Fila interminables y la<br />preocupación por tus datos con Cita<br />Ciudadana, tu trámite es seguro, rápido y<br />confiable.</p>

            <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between', 'width': '100%', 'marginTop': '20px', 'padding': '0 10px'}}>
                <div className="paginator" style={{'margin': '0', 'gap': '6px'}}>
                    <div className="dot" style={{'background': 'white', 'border': '2px solid #ccc', 'width': '10px', 'height': '10px'}}></div>
                    <div className="dot active" style={{'background': '#326789', 'width': '10px', 'height': '10px'}}></div>
                    <div className="dot" style={{'background': 'white', 'border': '2px solid #ccc', 'width': '10px', 'height': '10px'}}></div>
                </div>
                <button className="main-btn" aria-label="Botón de acción principal" onClick={() => { setScreen(3) }} style={{'width': 'auto', 'padding': '8px 25px', 'borderRadius': '20px', 'background': '#326789', 'fontSize': '12px', 'fontWeight': '500'}}>NEXT</button>
            </div>
        </section>
      )}

      {screen === 3 && (
        <section id="screen3" className="screen intro-screen">
            <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'marginTop': '10px'}}>
                <div style={{'background': '#326789', 'borderRadius': '12px', 'width': '45px', 'height': '45px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>
                </div>
                <div style={{'textAlign': 'left'}}>
                    <h2 style={{'textTransform': 'none', 'marginBottom': '0', 'fontSize': '20px', 'color': '#184a68', 'fontWeight': '800'}}>CitaCiudadana</h2>
                    <p style={{'marginTop': '-2px', 'fontSize': '12px', 'color': '#508ca4', 'fontWeight': '600'}}>Tu trámite, sin filas.</p>
                </div>
            </div>

            <h3 style={{'color': '#326789', 'textTransform': 'uppercase', 'fontSize': '13px', 'marginTop': '30px', 'fontWeight': '800'}}>TU SEGURIDAD TAMBIÉN NOS<br />IMPORTA</h3>

            <div style={{'width': '100%', 'height': '260px', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'margin': '10px 0'}}>
                <img src="images/doctor.jpg" style={{'maxWidth': '100%', 'maxHeight': '100%', 'objectFit': 'contain', 'mixBlendMode': 'multiply'}} />
            </div>

            <div style={{'height': '40px'}}></div>

            <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between', 'width': '100%', 'marginTop': '20px', 'padding': '0 10px'}}>
                <div className="paginator" style={{'margin': '0', 'gap': '6px'}}>
                    <div className="dot" style={{'background': 'white', 'border': '2px solid #ccc', 'width': '10px', 'height': '10px'}}></div>
                    <div className="dot" style={{'background': 'white', 'border': '2px solid #ccc', 'width': '10px', 'height': '10px'}}></div>
                    <div className="dot active" style={{'background': '#326789', 'width': '10px', 'height': '10px'}}></div>
                </div>
                <button className="main-btn" aria-label="Botón de acción principal" onClick={() => { setScreen(4) }} style={{'width': 'auto', 'padding': '8px 25px', 'borderRadius': '20px', 'background': '#326789', 'fontSize': '12px', 'fontWeight': '500'}}>START</button>
            </div>
        </section>
      )}
    </>
  );
};
