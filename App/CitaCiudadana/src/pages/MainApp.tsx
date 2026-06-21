import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const MainApp: React.FC = () => {
  useEffect(() => {
    GoogleAuth.initialize({
      clientId: '478435404426-asgtqjj6l4co3kvh63u1n85uhbvl4cl7.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }, []);

  const [screen, setScreen] = useState<number>(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);

  // Profile states
  const [profileData, setProfileData] = useState({
    name: '', age: '', email: '', phone: '', curp: '', social: '', bloodType: '', allergies: '', emergencyContact: '', conditions: '', weightHeight: ''
  });

  // Chat states
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Doctor Search states
  const [searchQuery, setSearchQuery] = useState('Odontologo');
  const allDoctors = [
    { id: 1, name: 'Sofia Castro', category: 'Odontologo', schedule: '9:00am a 12:00pm', cost: '$500' },
    { id: 2, name: 'Juan Castro', category: 'Odontologo', schedule: '9:00am a 12:00pm', cost: '$800' },
    { id: 3, name: 'Jose Ibarra', category: 'Psicologo', schedule: '10:00am a 2:00pm', cost: '$600' },
    { id: 4, name: 'Alma Silva', category: 'Pediatra', schedule: '8:00am a 11:00am', cost: '$450' },
    { id: 5, name: 'Roberto Ruiz', category: 'Oculista', schedule: '12:00pm a 5:00pm', cost: '$700' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Go to menu if logged in and not already on a specific screen
        if (screen === 4 || screen === 5 || screen === 6) setScreen(8);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [screen]);

  const handleTogglePassword = (id: string) => {
    setPasswordVisible(!passwordVisible);
  };

  const [isMapActive, setIsMapActive] = useState(false);
  const handleActivateMap = () => {
    setIsMapActive(true);
  };
  const handleGoToMenu = () => { setScreen(8); };

  const handleGoogleLogin = async () => {
    try {
      const user = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(user.authentication.idToken);
      await signInWithCredential(auth, credential);
      setScreen(8);
    } catch (error: any) {
      alert("Error en Login: " + (error.message || JSON.stringify(error)));
      setErrorMsg(error.message);
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save extra user info
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: new Date()
      });
      setScreen(7); // Success screen
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setScreen(8);
    } catch (error: any) {
      setErrorMsg("Credenciales incorrectas o usuario no encontrado.");
    }
  };

  const handleLoadProfile = async () => { 
    if (currentUser) {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || '',
            age: data.age || '',
            email: currentUser.email || '',
            phone: data.phone || '',
            curp: data.curp || '',
            social: data.social || '',
            bloodType: data.bloodType || '',
            allergies: data.allergies || '',
            emergencyContact: data.emergencyContact || '',
            conditions: data.conditions || '',
            weightHeight: data.weightHeight || ''
          });
        } else {
          setProfileData({ ...profileData, email: currentUser.email || '' });
        }
      } catch (e) {
        console.error("Error loading profile", e);
      }
    }
    setScreen(9); 
  };

  const handleSaveProfile = async () => { 
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        name: profileData.name,
        age: profileData.age,
        phone: profileData.phone,
        curp: profileData.curp,
        social: profileData.social,
        bloodType: profileData.bloodType,
        allergies: profileData.allergies,
        emergencyContact: profileData.emergencyContact,
        conditions: profileData.conditions,
        weightHeight: profileData.weightHeight,
        updatedAt: new Date()
      }, { merge: true });
      alert("Perfil actualizado correctamente");
      setScreen(8); // Go back home
    } catch (e) {
      console.error("Error saving profile", e);
      alert("Error al actualizar perfil");
    }
  };

  const saveAppointment = async () => {
    if (!currentUser) return;
    if (!symptoms || !selectedDate) {
      alert("Por favor ingresa síntomas y selecciona un día");
      return;
    }
    try {
      await addDoc(collection(db, "appointments"), {
        userId: currentUser.uid,
        symptoms: symptoms,
        date: selectedDate,
        doctor: "Dr. Asignado", // Placeholder
        createdAt: new Date()
      });
      setSymptoms('');
      setSelectedDate('');
      setScreen(16); // Confirmation screen
    } catch (e) {
      console.error("Error al guardar cita: ", e);
      alert("Error al agendar cita");
    }
  };

  const loadAppointments = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, "appointments"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const appts: any[] = [];
      querySnapshot.forEach((doc) => {
        appts.push({ id: doc.id, ...doc.data() });
      });
      setAppointments(appts);
    } catch (e) {
      console.error("Error loading appointments:", e);
    }
  };

  useEffect(() => {
    if (screen === 13 || screen === 8) {
      loadAppointments();
    }
  }, [screen, currentUser]);

  const analyzeSymptoms = () => { setScreen(17); };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    const newMessages = [...chatMessages, { sender: 'user', text: userMessage }];
    setChatMessages(newMessages);
    setChatInput('');
    
    try {
      // Usamos localhost ya que el servidor de pruebas está corriendo aquí mismo
      const response = await fetch('https://pseudoofficially-unequatorial-jenna.ngrok-free.dev/webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer citaciudadana2024`,
          'x-token': 'citaciudadana2024',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: userMessage, userId: currentUser?.uid || 'anonymous' })
      });
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      // Intentamos extraer la respuesta asumiendo formatos comunes (data.text, data.response, data.message)
      const botReply = data.text || data.response || data.message || 'Respuesta recibida correctamente, pero no pude leer el texto (revisa el formato de respuesta de tu API).';
      
      setChatMessages(prev => [...prev, { sender: 'ai', text: botReply }]);
    } catch (error: any) {
      console.error("Error al comunicarse con el webhook:", error);
      alert("Error Fetch: " + error.message);
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Hubo un problema de conexión con el bot de WhatsApp. Por favor intenta de nuevo.' }]);
    }
  };

  const handleFilterDoctors = (queryStr: string) => {
    setSearchQuery(queryStr);
    setScreen(17);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="app-container">
          
<div className="app-container">
    
    {/*  INTRODUCCIÓN 1 (Mujer)  */}
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
            <button className="main-btn" onClick={() => { setScreen(2) }} style={{'width': 'auto', 'padding': '8px 25px', 'borderRadius': '20px', 'background': '#326789', 'fontSize': '12px', 'fontWeight': '500'}}>NEXT</button>
        </div>
    </section>
  )}

    {/*  INTRODUCCIÓN 2 (Familia)  */}
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
            <button className="main-btn" onClick={() => { setScreen(3) }} style={{'width': 'auto', 'padding': '8px 25px', 'borderRadius': '20px', 'background': '#326789', 'fontSize': '12px', 'fontWeight': '500'}}>NEXT</button>
        </div>
    </section>
  )}

    {/*  INTRODUCCIÓN 3 (Doctor)  */}
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
            <button className="main-btn" onClick={() => { setScreen(4) }} style={{'width': 'auto', 'padding': '8px 25px', 'borderRadius': '20px', 'background': '#326789', 'fontSize': '12px', 'fontWeight': '500'}}>NEXT</button>
        </div>
    </section>
  )}

    {/*  INICIO  */}
    {screen === 4 && (
    <section id="screen4" className="screen">
        <img src="images/heart.png" style={{'width': '160px', 'height': '160px', 'objectFit': 'contain', 'marginBottom': '10px', 'mixBlendMode': 'multiply'}} />
        <h1 style={{'color': '#326789'}}>Bienvenido</h1>
        <button className="main-btn" onClick={() => { setScreen(5) }}>REGISTRATE</button>
        <button className="main-btn" onClick={() => { setScreen(6) }}>INGRESA</button>
        <div style={{'fontSize': '12px', 'color': '#888', 'margin': '15px 0'}}>o</div>
        <button className="google-btn" onClick={() => { handleGoogleLogin() }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" /> CONTINUAR CON GOOGLE
        </button>
    </section>
  )}

    {/*  CREAR CUENTA NUEVA  */}
    {screen === 5 && (
    <section id="screen5" className="screen">
        <h2 className="page-title">CREAR CUENTA NUEVA</h2>
        <p style={{'fontSize': '10px', 'fontWeight': '500', 'color': '#777'}}>UNETE A NOSOTROS Y NO TE PIERDAS DE LOS BENEFICIOS</p>
        <p id="registerError" className="error-text" style={{color: 'red', fontSize: '12px'}}>{screen === 5 ? errorMsg : ''}</p>
        
        <input type="text" id="registerName" className="input-pill" placeholder="Ingresa tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" id="registerEmail" className="input-pill" placeholder="Ingresa tu email" value={email} onChange={(e) => setEmail(e.target.value)} />
        
        <div className="password-wrapper">
            <input type={passwordVisible ? "text" : "password"} id="registerPassword" className="input-pill" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="toggle-password" onClick={() => { handleTogglePassword('registerPassword') }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
        </div>
        
        <div style={{'display': 'flex', 'flexDirection': 'column', 'alignItems': 'flex-start', 'margin': '0 auto', 'width': 'fit-content'}}>
            <label className="custom-checkbox">
                <input type="checkbox" id="terms" />
                <span className="checkmark"></span>
                <span>Acepto <span className="link-text" style={{'textDecoration': 'underline', 'cursor': 'pointer'}} onClick={() => { setScreen(14) }}>terminos y condiciones</span></span>
            </label>
            <label className="custom-checkbox">
                <input type="checkbox" id="privacy" />
                <span className="checkmark"></span>
                <span>Acepto <span className="link-text" style={{'textDecoration': 'underline', 'cursor': 'pointer'}} onClick={() => { setScreen(15) }}>politicas de privacidad</span></span>
            </label>
        </div>

        <button className="main-btn" onClick={() => { handleRegister() }} style={{'marginTop': '20px'}}>Entrar</button>
        
        <div className="bottom-controls">
            <button className="back-btn" onClick={() => { setScreen(4) }}>BACK</button>
        </div>
    </section>
  )}

    {/*  INGRESAR  */}
    {screen === 6 && (
    <section id="screen6" className="screen">
        <h2 className="page-title">INGRESAR</h2>
        <p style={{'fontSize': '10px', 'fontWeight': '500', 'color': '#777'}}>INGRESA EN TU CUENTA Y AGENDA UNA CITA CON NOSOTROS</p>
        <p id="loginError" className="error-text" style={{color: 'red', fontSize: '12px'}}>{screen === 6 ? errorMsg : ''}</p>
        
        <input type="email" id="loginEmail" className="input-pill" placeholder="Ingresa tu email" value={email} onChange={(e) => setEmail(e.target.value)} />
        
        <div className="password-wrapper">
            <input type={passwordVisible ? "text" : "password"} id="loginPassword" className="input-pill" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="toggle-password" onClick={() => { handleTogglePassword('loginPassword') }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
        </div>
        
        <button className="main-btn" onClick={() => { handleLogin() }} style={{'marginTop': '30px'}}>Entrar</button>
        
        <div className="bottom-controls">
            <button className="back-btn" onClick={() => { setScreen(4) }}>BACK</button>
        </div>
    </section>
  )}

    {/*  CUENTA CREADA  */}
    {screen === 7 && (
    <section id="screen7" className="screen">
        <div style={{'marginBottom': '20px', 'display': 'flex', 'justifyContent': 'center'}}>
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
        </div>
        <h2 className="page-title">BIENVENIDO</h2>
        <p style={{'fontWeight': '500', 'fontSize': '14px', 'color': '#555'}}>Su cuenta fue creada<br />correctamente</p>
        <button className="main-btn" onClick={() => { handleGoToMenu() }} style={{'marginTop': '20px'}}>Continuar</button>
        
        <div className="bottom-controls">
            <button className="back-btn" onClick={() => { setScreen(4) }}>BACK</button>
        </div>
    </section>
  )}

    {/*  MENU PRINCIPAL  */}
    {screen === 8 && (
    <section id="screen8" className="screen" style={{'padding': '0', 'background': '#ffffff'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setIsMenuOpen(true) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 15px 80px'}}>
            <div style={{'width': '100%', 'textAlign': 'left', 'paddingLeft': '5px'}}>
                <div style={{'background': 'white', 'border': '1px solid #ddd', 'color': '#777', 'fontSize': '10px', 'padding': '5px 15px', 'borderRadius': '50px', 'display': 'inline-block', 'fontWeight': '500'}}>
                    Hola <span id="userNameDisplay">{currentUser?.email || '@Usuario'}</span>
                </div>
            </div>
            
            <div className="header-actions" style={{'marginTop': '10px'}}>
                <div className="card-agendar" onClick={() => { setScreen(11) }} style={{'borderRadius': '20px', 'background': '#4f88a3', 'boxShadow': 'none'}}>
                    <div style={{'textAlign': 'left'}}>
                        <h3 style={{'fontSize': '13px', 'fontWeight': '500'}}>AGENDAR NUEVA</h3>
                        <h3 style={{'fontSize': '13px', 'fontWeight': '500'}}>CITA</h3>
                    </div>
                    <div style={{'position': 'relative'}}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>
                        <div style={{'position': 'absolute', 'bottom': '-5px', 'right': '-5px', 'background': 'white', 'borderRadius': '50%', 'width': '16px', 'height': '16px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f88a3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                </div>
                <div className="card-mis-citas" onClick={() => { setScreen(13) }} style={{'borderRadius': '20px', 'background': '#8ab6c6', 'boxShadow': 'none'}}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg>
                    <div style={{'marginTop': '8px', 'fontSize': '11px'}}>MIS CITAS</div>
                </div>
            </div>

            {appointments.length > 0 ? (
                appointments.slice(0, 2).map((appt, index) => (
                    <div key={appt.id || index} className={`appointment-card ${index === 0 ? 'highlight' : ''}`} style={{'border': index === 0 ? '2px solid #00d1b2' : '1px solid #eee', 'borderRadius': '15px', 'marginTop': index === 0 ? '20px' : '15px', 'boxShadow': 'none'}}>
                        <div className="top-row"><span style={{'fontWeight': '600', 'fontSize': '13px'}}>{index === 0 ? 'PROXIMA CITA' : 'CITAS FUTURAS'}</span> <span style={{'fontWeight': '600', 'fontSize': '11px'}} id={index === 0 ? 'nextDateMenu' : undefined}>{appt.date}</span></div>
                        <div className="time" style={{'fontWeight': '500', 'color': '#000'}}>11:30 - 12:30 AM</div>
                        <div className="pill-label" style={{'background': '#f4f4f4', 'color': '#a0a0a0', 'boxShadow': 'none', 'textAlign': 'center', 'padding': '10px', 'borderRadius': '20px', 'textTransform': 'uppercase'}} id={index === 0 ? 'nextAppointmentMenu' : undefined}>{appt.symptoms || "REVISIÓN MÉDICA"}</div>
                    </div>
                ))
            ) : (
                <div className="appointment-card" style={{'border': '1px solid #eee', 'borderRadius': '15px', 'marginTop': '20px', 'boxShadow': 'none', 'textAlign': 'center', 'padding': '20px', 'color': '#999', 'fontSize': '13px'}}>
                    No tienes citas próximas agendadas.
                </div>
            )}
            
            <button className="emergencia-btn" onClick={() => { setScreen(12) }} style={{'width': '100%', 'marginTop': '20px', 'display': 'flex', 'justifyContent': 'center'}}>
                TIENES UNA EMERGENCIA <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle><path d="M10 10h4"></path><path d="M12 8v4"></path></svg>
            </button>
        </div>

        <nav className="bottom-nav">
            <button className="active" onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  PERFIL  */}
    {screen === 9 && (
    <section id="screen9" className="screen" style={{'padding': '0', 'background': '#ffffff'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setIsMenuOpen(true) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <h2 className="page-title">PERFIL</h2>
            
            <div style={{'textAlign': 'center', 'marginBottom': '15px'}}>
                <div style={{'background': '#e8f0f4', 'borderRadius': '50%', 'width': '80px', 'height': '80px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'margin': '0 auto 10px auto', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.1)'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h3 style={{'fontWeight': '800', 'color': '#2c4251', 'margin': '0'}}>{profileData.name || 'Sin Nombre'}</h3>
                <p style={{'fontSize': '12px', 'color': '#777', 'margin': '2px 0'}}>{profileData.email}</p>
                <p style={{'fontSize': '12px', 'color': '#777', 'margin': '0'}}>{profileData.phone}</p>
                <p style={{'fontSize': '12px', 'color': '#777', 'margin': '0'}}>Edad: {profileData.age || 'N/A'}</p>
            </div>

            <div style={{'display': 'grid', 'gridTemplateColumns': '1fr 1fr', 'gap': '15px', 'width': '100%', 'marginTop': '20px'}}>
                <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'textAlign': 'center'}}>
                    <div style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '8px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '24px', 'height': '24px', 'color': '#ff4d4f'}}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg></div>
                    <div style={{'fontSize': '9px', 'color': '#999', 'fontWeight': '600', 'textTransform': 'uppercase'}}>Tipo de Sangre</div>
                    <div style={{'fontSize': '13px', 'color': '#3a5a6b', 'fontWeight': '600', 'marginTop': '5px'}}>{profileData.bloodType || 'N/A'}</div>
                </div>
                <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'textAlign': 'center'}}>
                    <div style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '8px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '24px', 'height': '24px', 'color': '#faad14'}}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg></div>
                    <div style={{'fontSize': '9px', 'color': '#999', 'fontWeight': '600', 'textTransform': 'uppercase'}}>Alergias</div>
                    <div style={{'fontSize': '13px', 'color': '#3a5a6b', 'fontWeight': '600', 'marginTop': '5px'}}>{profileData.allergies || 'Ninguna'}</div>
                </div>
                <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'textAlign': 'center'}}>
                    <div style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '8px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '24px', 'height': '24px', 'color': '#52c41a'}}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"></path><path d="m14.5 12.5 2-2"></path><path d="m11.5 9.5 2-2"></path><path d="m8.5 6.5 2-2"></path><path d="m17.5 15.5 2-2"></path></svg></div>
                    <div style={{'fontSize': '9px', 'color': '#999', 'fontWeight': '600', 'textTransform': 'uppercase'}}>Peso / Altura</div>
                    <div style={{'fontSize': '13px', 'color': '#3a5a6b', 'fontWeight': '600', 'marginTop': '5px'}}>{profileData.weightHeight || 'N/A'}</div>
                </div>
                <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'textAlign': 'center'}}>
                    <div style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '8px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '24px', 'height': '24px', 'color': '#1890ff'}}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg></div>
                    <div style={{'fontSize': '9px', 'color': '#999', 'fontWeight': '600', 'textTransform': 'uppercase'}}>Condiciones</div>
                    <div style={{'fontSize': '13px', 'color': '#3a5a6b', 'fontWeight': '600', 'marginTop': '5px'}}>{profileData.conditions || 'Ninguna'}</div>
                </div>
                <div style={{'gridColumn': 'span 2', 'background': '#fdfaf6', 'borderRadius': '15px', 'border': '1px solid #f0e6d2', 'padding': '15px', 'textAlign': 'center', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)'}}>
                    <div style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '8px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '20px', 'height': '20px', 'color': '#c28542'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
                    <div style={{'fontSize': '9px', 'color': '#c28542', 'fontWeight': '600', 'textTransform': 'uppercase'}}>Contacto de Emergencia</div>
                    <div style={{'fontSize': '14px', 'color': '#8a5c2d', 'fontWeight': '600', 'marginTop': '5px'}}>{profileData.emergencyContact || 'No especificado'}</div>
                </div>
            </div>

            <div style={{'background': 'white', 'borderRadius': '15px', 'padding': '15px', 'marginTop': '15px', 'border': '1px solid #e0e0e0', 'width': '100%', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)'}}>
                 <div style={{'fontSize': '12px', 'color': '#555', 'marginBottom': '8px'}}><strong>CURP:</strong> <span style={{'color': '#000'}}>{profileData.curp || 'No especificado'}</span></div>
                 <div style={{'fontSize': '12px', 'color': '#555'}}><strong>NSS:</strong> <span style={{'color': '#000'}}>{profileData.social || 'No especificado'}</span></div>
            </div>

            <button className="main-btn" onClick={() => { setScreen(18) }} style={{'background': '#8ab6c6', 'width': 'auto', 'padding': '12px 20px', 'fontSize': '11px', 'borderRadius': '50px', 'fontWeight': '500', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.1)', 'marginTop': '20px', 'color': 'white', 'border': 'none', 'display': 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>ACTUALIZA<br />TUS DATOS</button>
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button className="active" onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  ACTUALIZAR PERFIL  */}
    {screen === 18 && (
    <section id="screen18" className="screen" style={{'padding': '0', 'background': '#ffffff'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setIsMenuOpen(true) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <h2 className="page-title">ACTUALIZA TUS<br />DATOS</h2>
            
            <div style={{'display': 'grid', 'gridTemplateColumns': '1fr', 'gap': '15px', 'width': '100%', 'marginBottom': '20px'}}>
                {/* General Info */}
                <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)'}}>
                    <h3 style={{'fontWeight': '800', 'margin': '0 0 10px 0', 'textTransform': 'uppercase'}}>👤 Información Básica</h3>
                    <div style={{'marginBottom': '10px'}}>
                        <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#777', 'display': 'block', 'marginBottom': '5px'}}>NOMBRE COMPLETO</label>
                        <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                    <div style={{'display': 'grid', 'gridTemplateColumns': '1fr 1fr', 'gap': '10px', 'marginBottom': '10px'}}>
                        <div>
                            <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#777', 'display': 'block', 'marginBottom': '5px'}}>EDAD</label>
                            <input type="text" value={profileData.age} onChange={(e) => setProfileData({...profileData, age: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                        </div>
                        <div>
                            <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#777', 'display': 'block', 'marginBottom': '5px'}}>TELÉFONO</label>
                            <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                        </div>
                    </div>
                    <div>
                        <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#777', 'display': 'block', 'marginBottom': '5px'}}>CORREO (NO EDITABLE)</label>
                        <input type="email" value={profileData.email} disabled style={{'width': '100%', 'background': '#eee', 'border': '1px solid #ddd', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px', 'color': '#888'}} />
                    </div>
                </div>

                {/* Medical Data Grid */}
                <div style={{'display': 'grid', 'gridTemplateColumns': '1fr 1fr', 'gap': '10px'}}>
                    <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '12px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)'}}>
                        <label style={{'fontSize': '9px', 'fontWeight': '600', 'color': '#999', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'marginBottom': '5px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '12px', 'height': '12px', 'color': '#ff4d4f'}}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg> TIPO DE SANGRE</label>
                        <input type="text" value={profileData.bloodType} onChange={(e) => setProfileData({...profileData, bloodType: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                    <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '12px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)'}}>
                        <label style={{'fontSize': '9px', 'fontWeight': '600', 'color': '#999', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'marginBottom': '5px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '12px', 'height': '12px', 'color': '#52c41a'}}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"></path><path d="m14.5 12.5 2-2"></path><path d="m11.5 9.5 2-2"></path><path d="m8.5 6.5 2-2"></path><path d="m17.5 15.5 2-2"></path></svg> PESO Y ALTURA</label>
                        <input type="text" value={profileData.weightHeight} onChange={(e) => setProfileData({...profileData, weightHeight: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                    <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '12px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'gridColumn': 'span 2'}}>
                        <label style={{'fontSize': '9px', 'fontWeight': '600', 'color': '#999', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'marginBottom': '5px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '12px', 'height': '12px', 'color': '#faad14'}}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg> ALERGIAS</label>
                        <input type="text" value={profileData.allergies} onChange={(e) => setProfileData({...profileData, allergies: e.target.value})} placeholder="Ninguna" style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                    <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '12px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'gridColumn': 'span 2'}}>
                        <label style={{'fontSize': '9px', 'fontWeight': '600', 'color': '#999', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'marginBottom': '5px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '12px', 'height': '12px', 'color': '#1890ff'}}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> CONDICIONES / ENFERMEDADES</label>
                        <input type="text" value={profileData.conditions} onChange={(e) => setProfileData({...profileData, conditions: e.target.value})} placeholder="Ninguna" style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                    <div style={{'background': '#fdfaf6', 'borderRadius': '15px', 'border': '1px solid #f0e6d2', 'padding': '12px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'gridColumn': 'span 2'}}>
                        <label style={{'fontSize': '9px', 'fontWeight': '600', 'color': '#c28542', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'marginBottom': '5px'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '12px', 'height': '12px', 'color': '#c28542'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> CONTACTO DE EMERGENCIA</label>
                        <input type="text" value={profileData.emergencyContact} onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})} placeholder="Nombre y Número" style={{'width': '100%', 'background': 'white', 'border': '1px solid #f0e6d2', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px', 'color': '#8a5c2d'}} />
                    </div>
                </div>

                {/* Legal / Official Data */}
                <div style={{'background': 'white', 'borderRadius': '15px', 'border': '1px solid #e0e0e0', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)'}}>
                    <h3 style={{'fontWeight': '800', 'margin': '0 0 10px 0', 'textTransform': 'uppercase'}}>📋 Datos Oficiales</h3>
                    <div style={{'marginBottom': '10px'}}>
                        <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#777', 'display': 'block', 'marginBottom': '5px'}}>CURP</label>
                        <input type="text" value={profileData.curp} onChange={(e) => setProfileData({...profileData, curp: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                    <div>
                        <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#777', 'display': 'block', 'marginBottom': '5px'}}>NSS (Número de Seguro Social)</label>
                        <input type="text" value={profileData.social} onChange={(e) => setProfileData({...profileData, social: e.target.value})} style={{'width': '100%', 'background': '#f9f9f9', 'border': '1px solid #eaeaea', 'borderRadius': '8px', 'padding': '10px', 'outline': 'none', 'fontSize': '12px'}} />
                    </div>
                </div>
            </div>

            <div style={{'background': '#f4f4f4', 'borderRadius': '10px', 'padding': '10px', 'width': '100%', 'marginTop': '10px', 'fontSize': '10px', 'color': '#aaa', 'fontWeight': '500', 'textAlign': 'center'}}>
                NECESITAS CONFIRMAR TU<br />CONTRASEÑA PARA ACTUALIZAR LOS<br />DATOS
            </div>

            <div style={{'width': '100%', 'marginTop': '15px', 'textAlign': 'left'}}>
                <label style={{'fontSize': '10px', 'fontWeight': '600', 'color': '#333', 'marginBottom': '5px', 'display': 'block', 'textTransform': 'uppercase'}}>CONFIRMAR CONTRASEÑA:</label>
                <input type="password" id="editConfirmPassword" style={{'width': '100%', 'boxShadow': '2px 2px 6px rgba(0,0,0,0.1)', 'border': '1px solid #e0e0e0', 'height': '35px', 'borderRadius': '50px', 'padding': '10px 15px', 'outline': 'none', 'fontSize': '11px'}} />
            </div>

            <div style={{'display': 'flex', 'justifyContent': 'space-between', 'width': '100%', 'marginTop': '30px', 'padding': '0'}}>
                <button className="main-btn" onClick={() => { setScreen(9) }} style={{'background': '#3a5a6b', 'width': '120px', 'padding': '12px', 'fontSize': '12px', 'borderRadius': '50px', 'fontWeight': '500', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.2)'}}>CANCELAR</button>
                <button className="main-btn" onClick={() => { handleSaveProfile() }} style={{'background': '#3a5a6b', 'width': '120px', 'padding': '12px', 'fontSize': '12px', 'borderRadius': '50px', 'fontWeight': '500', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.2)'}}>GUARDAR</button>
            </div>
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button className="active" onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  BUSCAR EXPERTO - HOME (Screen 10)  */}
    {screen === 10 && (
    <section id="screen10" className="screen" style={{'padding': '0', 'background': '#ffffff'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setIsMenuOpen(true) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <h2 className="page-title">BUSCAR EXPERTO</h2>
            
            <div className="search-input-pill" style={{'display': 'flex', 'alignItems': 'center', 'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'marginBottom': '30px', 'width': '100%'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'marginRight': '10px'}}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Ingresa el malestar que tengas o un nombre..." style={{'border': 'none', 'outline': 'none', 'fontSize': '11px', 'width': '100%', 'color': '#555', 'background': 'transparent'}} onKeyPress={(event) => { if(event.key === 'Enter') { handleFilterDoctors(event.currentTarget.value); } }} />
            </div>

            <div style={{'display': 'grid', 'gridTemplateColumns': '1fr 1fr', 'gap': '15px', 'width': '100%'}}>
                {/*  Card 1  */}
                <div className="category-card" onClick={() => { handleFilterDoctors('Odontologo'); }} style={{'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'padding': '20px', 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'cursor': 'pointer'}}>
                    <span style={{'fontSize': '40px'}}>🦷</span>
                    <strong style={{'fontSize': '12px', 'color': '#3a5a6b'}}>Odontologo</strong>
                </div>
                {/*  Card 2  */}
                <div className="category-card" onClick={() => { handleFilterDoctors('Psicologo'); }} style={{'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'padding': '20px', 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'cursor': 'pointer'}}>
                    <span style={{'fontSize': '40px'}}>🧠</span>
                    <strong style={{'fontSize': '12px', 'color': '#3a5a6b'}}>Psicologo</strong>
                </div>
                {/*  Card 3  */}
                <div className="category-card" onClick={() => { handleFilterDoctors('Oculista'); }} style={{'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'padding': '20px', 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'cursor': 'pointer'}}>
                    <span style={{'fontSize': '40px'}}>👁️</span>
                    <strong style={{'fontSize': '12px', 'color': '#3a5a6b'}}>Oculista</strong>
                </div>
                {/*  Card 4  */}
                <div className="category-card" onClick={() => { handleFilterDoctors('Pediatra'); }} style={{'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'padding': '20px', 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px', 'cursor': 'pointer'}}>
                    <span style={{'fontSize': '40px'}}>👶</span>
                    <strong style={{'fontSize': '12px', 'color': '#3a5a6b'}}>Pediatra</strong>
                </div>
            </div>
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button className="active" onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  BUSCAR EXPERTO - RESULTADOS (Screen 17)  */}
    {screen === 17 && (
    <section id="screen17" className="screen" style={{'padding': '0', 'background': '#ffffff'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setScreen(10) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <h2 className="page-title">BUSCAR EXPERTO</h2>
            
            <div className="search-input-pill" style={{'display': 'flex', 'alignItems': 'center', 'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'marginBottom': '20px', 'width': '100%'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'marginRight': '10px'}}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{'border': 'none', 'outline': 'none', 'fontSize': '12px', 'width': '100%', 'color': '#333', 'background': 'transparent'}} />
            </div>

            {/*  MAP CARD  */}
            <div style={{'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'width': '100%', 'overflow': 'hidden', 'marginBottom': '20px'}}>
                {/*  Map Header / Info  */}
                <div style={{'padding': '15px', 'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center'}}>
                    <div style={{'display': 'flex', 'alignItems': 'center', 'gap': '10px'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <div style={{'textAlign': 'left'}}>
                            <strong style={{'fontSize': '12px', 'color': '#3a5a6b'}}>Ubicacion</strong><br />
                            <span style={{'fontSize': '10px', 'color': '#888'}}>Cerca de ti</span>
                        </div>
                    </div>
                    <button className="main-btn" style={{'background': '#508ca4', 'padding': '5px 15px', 'borderRadius': '50px', 'width': 'auto', 'margin': '0', 'fontSize': '10px', 'fontWeight': '500'}} onClick={() => window.open('https://maps.google.com/maps?q=hospitales+clinicas', '_blank')}>COMO LLEGAR</button>
                </div>
                {/*  Interactive Map Container  */}
                <div id="interactiveMapContainer" style={{'width': '100%', 'height': '150px', 'background': '#e8f0f4', 'position': 'relative', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'cursor': isMapActive ? 'default' : 'pointer'}} onClick={() => { if(!isMapActive) handleActivateMap() }}>
                    {!isMapActive && (
                        <div id="mapOverlay" style={{'position': 'absolute', 'inset': '0', 'background': 'rgba(0,0,0,0.1)', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'flexDirection': 'column', 'zIndex': '2'}}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <span style={{'color': '#508ca4', 'fontWeight': '500', 'fontSize': '12px', 'marginTop': '5px'}}>Ver mapa interactivo</span>
                        </div>
                    )}
                    {isMapActive && (
                        <iframe id="googleMapIframe" src="https://maps.google.com/maps?q=hospitales+clinicas&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{'border': '0', 'position': 'absolute', 'inset': '0', 'zIndex': '1', 'pointerEvents': 'auto'}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    )}
                </div>
            </div>

            {/*  RESULTS LIST  */}
            <div id="doctorResultsContainer" style={{'width': '100%', 'display': 'flex', 'flexDirection': 'column', 'gap': '15px'}}>
                {allDoctors
                    .filter(doc => doc.category.toLowerCase().includes(searchQuery.toLowerCase()) || doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((doctor) => (
                    <div key={doctor.id} className="doctor-res-card" data-category={doctor.category} style={{'background': 'white', 'border': '1px solid #f0f0f0', 'borderRadius': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'padding': '15px', 'display': 'flex', 'gap': '15px', 'alignItems': 'center'}}>
                        <div style={{'width': '50px', 'height': '50px', 'background': '#e8f0f4', 'borderRadius': '50%', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                        </div>
                        <div style={{'textAlign': 'left', 'fontSize': '11px', 'color': '#555', 'lineHeight': '1.4', 'width': '100%'}}>
                            <strong style={{'fontSize': '12px', 'color': '#3a5a6b'}}>Nombre: {doctor.name}</strong><br />
                            <strong>Especialidad:</strong> {doctor.category}<br />
                            <strong>Horario:</strong> {doctor.schedule}<br />
                            <strong>Costo:</strong> {doctor.cost}
                        </div>
                    </div>
                ))}
                {allDoctors.filter(doc => doc.category.toLowerCase().includes(searchQuery.toLowerCase()) || doc.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div style={{'textAlign': 'center', 'padding': '20px', 'color': '#999', 'fontSize': '12px'}}>
                        No se encontraron especialistas.
                    </div>
                )}
            </div>
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button className="active" onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  AGENDAR  */}
    {screen === 11 && (
    <section id="screen11" className="screen" style={{'padding': '0', 'background': '#ffffff'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setIsMenuOpen(true) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': 'white', 'color': '#999', 'borderRadius': '50px', 'padding': '2px 8px', 'fontSize': '10px', 'fontWeight': '500'}} id="agendarNameDisplay">@NOMBRE</div>
                <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <h2 className="page-title">AGENDAR</h2>
            
            <h3 style={{'textAlign': 'left', 'width': '100%', 'fontSize': '13px', 'fontWeight': '800', 'marginBottom': '5px', 'color': '#000'}}>SINTOMAS</h3>
            <textarea className="textarea-pill" placeholder="Escribe brevemente el malestar..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} style={{'boxShadow': '2px 2px 6px rgba(0,0,0,0.1)', 'border': '1px solid #e0e0e0', 'height': '80px'}}></textarea>

            <div className="sugerencia-box" style={{'boxShadow': '2px 2px 6px rgba(0,0,0,0.1)', 'border': '1px solid #e0e0e0', 'borderRadius': '15px', 'marginTop': '20px'}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3a5a6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
                <div>
                    <strong style={{'color': '#000', 'fontSize': '13px'}}>Sugerencias</strong><br />
                    <span style={{'fontSize': '11px', 'color': '#999', 'lineHeight': '1.2', 'display': 'inline-block', 'marginTop': '2px'}}>Te mostrara una sugerencia de a que experto puedes acudir si es necesario.</span>
                </div>
            </div>

            <h3 style={{'textAlign': 'left', 'width': '100%', 'marginTop': '20px', 'fontSize': '13px', 'fontWeight': '800', 'marginBottom': '10px', 'color': '#000'}}>ESCOGE EL DIA DE ASISTENCIA</h3>
            
            <div style={{'width': '100%', 'background': 'white', 'border': '1px solid #e0e0e0', 'borderRadius': '15px', 'boxShadow': '2px 2px 6px rgba(0,0,0,0.1)', 'padding': '0', 'overflow': 'hidden'}}>
                <div style={{'background': '#e8f0f4', 'padding': '15px', 'fontWeight': '500', 'color': '#777', 'fontSize': '11px', 'textAlign': 'left'}}>
                    OCTOBER 2025
                </div>
                <table style={{'width': '100%', 'textAlign': 'center', 'fontSize': '11px', 'color': '#555', 'borderCollapse': 'collapse', 'marginBottom': '10px'}}>
                    <tr style={{'color': '#999', 'height': '30px'}}>
                        <th>MO</th><th>TU</th><th>WE</th><th>TH</th><th>FR</th><th>SA</th><th>SU</th>
                    </tr>
                    <tr style={{'height': '30px'}}><td></td><td></td><td></td><td></td><td></td><td></td><td onClick={() => setSelectedDate('1 Oct 2025')} style={{cursor: 'pointer', background: selectedDate === '1 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '1 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>1</td></tr>
                    <tr style={{'height': '30px'}}>
                        <td onClick={() => setSelectedDate('2 Oct 2025')} style={{'position': 'relative', cursor: 'pointer', background: selectedDate === '2 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '2 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>2</td>
                        <td onClick={() => setSelectedDate('3 Oct 2025')} style={{'position': 'relative', cursor: 'pointer', background: selectedDate === '3 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '3 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>3</td>
                        <td onClick={() => setSelectedDate('4 Oct 2025')} style={{'position': 'relative', cursor: 'pointer', background: selectedDate === '4 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '4 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>4</td>
                        <td onClick={() => setSelectedDate('5 Oct 2025')} style={{'position': 'relative', cursor: 'pointer', background: selectedDate === '5 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '5 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>5</td>
                        <td onClick={() => setSelectedDate('6 Oct 2025')} style={{cursor: 'pointer', background: selectedDate === '6 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '6 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>6</td><td onClick={() => setSelectedDate('7 Oct 2025')} style={{cursor: 'pointer', background: selectedDate === '7 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '7 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>7</td><td onClick={() => setSelectedDate('8 Oct 2025')} style={{cursor: 'pointer', background: selectedDate === '8 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '8 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>8</td>
                    </tr>
                    <tr style={{'height': '30px'}}>
                        {[9,10,11,12,13,14,15].map(d => <td key={d} onClick={() => setSelectedDate(`${d} Oct 2025`)} style={{cursor: 'pointer', background: selectedDate === `${d} Oct 2025` ? '#00d1b2' : 'transparent', color: selectedDate === `${d} Oct 2025` ? 'white' : 'inherit', borderRadius: '5px'}}>{d}</td>)}
                    </tr>
                    <tr style={{'height': '30px'}}>
                        {[16,17,18,19,20,21,22].map(d => <td key={d} onClick={() => setSelectedDate(`${d} Oct 2025`)} style={{cursor: 'pointer', background: selectedDate === `${d} Oct 2025` ? '#00d1b2' : 'transparent', color: selectedDate === `${d} Oct 2025` ? 'white' : 'inherit', borderRadius: '5px'}}>{d}</td>)}
                    </tr>
                    <tr style={{'height': '30px'}}>
                        {[23,24,25,26,27,28,29].map(d => <td key={d} onClick={() => setSelectedDate(`${d} Oct 2025`)} style={{cursor: 'pointer', background: selectedDate === `${d} Oct 2025` ? '#00d1b2' : 'transparent', color: selectedDate === `${d} Oct 2025` ? 'white' : 'inherit', borderRadius: '5px'}}>{d}</td>)}
                    </tr>
                    <tr style={{'height': '30px'}}><td onClick={() => setSelectedDate('30 Oct 2025')} style={{cursor: 'pointer', background: selectedDate === '30 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '30 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>30</td><td onClick={() => setSelectedDate('31 Oct 2025')} style={{cursor: 'pointer', background: selectedDate === '31 Oct 2025' ? '#00d1b2' : 'transparent', color: selectedDate === '31 Oct 2025' ? 'white' : 'inherit', borderRadius: '5px'}}>31</td><td></td><td></td><td></td><td></td><td></td></tr>
                </table>
            </div>

            <button className="main-btn" onClick={() => { saveAppointment() }} style={{'background': '#3a5a6b', 'width': '120px', 'marginLeft': 'auto', 'display': 'block', 'padding': '12px', 'fontSize': '12px', 'marginTop': '25px', 'borderRadius': '50px', 'fontWeight': '500', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.2)'}}>AGENDAR</button>
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button className="active" onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  IA MEDICA (Chat emergencias)  */}
    {screen === 12 && (
    <section id="screen12" className="screen" style={{'padding': '0'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setScreen(8) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <div id="chatContainer" style={{'width': '100%', 'height': '400px', 'background': '#f9f9f9', 'borderRadius': '15px', 'padding': '15px', 'overflowY': 'auto', 'border': '1px solid #ddd', 'marginBottom': '10px', 'display': 'flex', 'flexDirection': 'column', 'gap': '10px'}}>
                {chatMessages.length === 0 && <p style={{'color': '#aaa', 'textAlign': 'center', 'marginTop': '20px', 'fontSize': '12px'}}>Cuéntame tus síntomas o dudas de salud para orientarte...</p>}
                {chatMessages.map((msg, index) => (
                    <div key={index} style={{
                        'alignSelf': msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        'background': msg.sender === 'user' ? '#508ca4' : '#e8f0f4',
                        'color': msg.sender === 'user' ? 'white' : '#333',
                        'padding': '10px 15px',
                        'borderRadius': '15px',
                        'maxWidth': '80%',
                        'fontSize': '12px',
                        'textAlign': 'left'
                    }}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div style={{'display': 'flex', 'width': '100%', 'gap': '10px'}}>
                <input type="text" className="input-pill" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => { if(e.key === 'Enter') handleSendMessage() }} style={{'margin': '0', 'textAlign': 'left'}} placeholder="Describe tus síntomas o dudas..." />
                <button onClick={() => { handleSendMessage() }} style={{'background': '#508ca4', 'color': 'white', 'border': 'none', 'borderRadius': '50px', 'padding': '0 20px', 'fontWeight': '500', 'cursor': 'pointer'}}>Enviar</button>
            </div>
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  CALENDARIO  */}
    {screen === 13 && (
    <section id="screen13" className="screen" style={{'padding': '0'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setIsMenuOpen(true) }} style={{'opacity': '1'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{'width': '28px', 'height': '28px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="top-bar-center" style={{'display': 'flex', 'alignItems': 'center', 'gap': '8px'}}>
                <div style={{'background': '#00d1b2', 'borderRadius': '5px', 'width': '22px', 'height': '22px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'boxShadow': '1px 2px 4px rgba(0,0,0,0.1)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h2 style={{'fontWeight': '800', 'margin': '0'}}><span style={{'color': '#2c4251'}}>Cita</span><span style={{'color': '#00d1b2'}}>Ciudadana</span></h2>
            </div>
            <div className="profile-icon-top" style={{'background': 'none', 'border': '2px solid white', 'borderRadius': '50%', 'width': '24px', 'height': '24px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'color': 'white'}} onClick={() => { handleLoadProfile() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </header>

        <div className="content-area" style={{'padding': '70px 20px 80px'}}>
            <h2 className="page-title">CALENDARIO</h2>
            <div className="pill-label" style={{'background': 'white', 'border': '1px solid #ccc', 'fontSize': '14px', 'marginBottom': '20px', 'color': '#333'}}>CITAS AGENDADAS</div>
            
            {appointments.length === 0 ? (
                <div style={{'textAlign': 'center', 'color': '#999', 'padding': '20px'}}>No tienes citas agendadas aún.</div>
            ) : (
                <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '15px'}}>
                    {appointments.map(appt => (
                        <div key={appt.id} style={{'background': 'white', 'borderRadius': '15px', 'padding': '15px', 'boxShadow': '2px 4px 10px rgba(0,0,0,0.05)', 'border': '1px solid #f0f0f0', 'textAlign': 'left'}}>
                            <div style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'marginBottom': '10px'}}>
                                <strong style={{'color': '#3a5a6b', 'fontSize': '14px'}}>{appt.date}</strong>
                                <span style={{'background': '#e8f0f4', 'color': '#508ca4', 'padding': '3px 8px', 'borderRadius': '5px', 'fontSize': '10px', 'fontWeight': '500'}}>Confirmada</span>
                            </div>
                            <p style={{'margin': '5px 0', 'fontSize': '12px', 'color': '#555'}}><strong>Doctor:</strong> {appt.doctor}</p>
                            <p style={{'margin': '5px 0', 'fontSize': '12px', 'color': '#555'}}><strong>Síntomas:</strong> {appt.symptoms}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <nav className="bottom-nav">
            <button onClick={() => { setScreen(8) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></button>
            <button onClick={() => { setScreen(11) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg></button>
            <button onClick={() => { setScreen(10) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
            <button className="active" onClick={() => { setScreen(13) }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path></svg></button>
            <button onClick={() => { handleLoadProfile() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </nav>
    </section>
  )}

    {/*  TÉRMINOS Y CONDICIONES  */}
    {screen === 14 && (
    <section id="screen14" className="screen" style={{'padding': '0'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setScreen(5) }} style={{'opacity': '1'}}>
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
  )}

    {/*  POLÍTICAS DE PRIVACIDAD  */}
    {screen === 15 && (
    <section id="screen15" className="screen" style={{'padding': '0'}}>
        <header className="top-bar" style={{'height': '60px', 'padding': '0 15px'}}>
            <button className="icon-btn" onClick={() => { setScreen(5) }} style={{'opacity': '1'}}>
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
            <h3 style={{'color': '#326789', 'fontSize': '16px'}}>POLÍTICAS DE PRIVACIDAD</h3>
            <p style={{'fontSize': '11px', 'color': '#555', 'lineHeight': '1.6', 'marginTop': '10px'}}>
                En CitaCiudadana nos tomamos muy en serio la protección de tus datos personales e historial médico.
                <br /><br />
                <strong style={{'color': '#326789'}}>1. Recopilación de Datos:</strong><br />Solo recopilamos la información necesaria para gestionar tus citas, como tu nombre, correo, CURP y Número de Seguro Social.
                <br /><br />
                <strong style={{'color': '#326789'}}>2. Uso de la Información:</strong><br />Tus datos son utilizados exclusivamente para coordinar la atención médica y personalizar tu experiencia.
                <br /><br />
                <strong style={{'color': '#326789'}}>3. Seguridad:</strong><br />Implementamos medidas de seguridad para proteger tus datos contra acceso no autorizado.
            </p>
        </div>
    </section>
  )}

    {/*  CITA CONFIRMADA  */}
    {screen === 16 && (
    <section id="screen16" className="screen">
        <div style={{'marginBottom': '20px', 'position': 'relative', 'display': 'inline-flex', 'justifyContent': 'center', 'alignItems': 'center', 'width': '120px', 'height': '120px'}}>
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#508ca4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span style={{'position': 'absolute', 'fontSize': '30px', 'right': '-5px', 'bottom': '5px', 'background': 'white', 'borderRadius': '50%', 'width': '40px', 'height': '40px', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'color': '#508ca4', 'border': '3px solid #e2e8f0'}}>✓</span>
        </div>
        <h2 className="page-title">¡CITA AGENDADA!</h2>
        <p style={{'fontWeight': '500', 'fontSize': '14px', 'color': '#555'}}>Tu cita ha sido guardada<br />correctamente.</p>
        <button className="main-btn" onClick={() => { handleGoToMenu() }} style={{'marginTop': '40px'}}>Volver al Menú</button>
    </section>
  )}

    <div id="toast" style={{'position': 'fixed', 'bottom': '90px', 'left': '50%', 'transform': 'translateX(-50%)', 'background': '#333', 'color': 'white', 'padding': '10px 20px', 'borderRadius': '50px', 'fontSize': '12px', 'display': 'none', 'zIndex': '9999'}}></div>

</div>






        {isMenuOpen && (
          <div className="side-menu-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, display: 'flex'}}>
            <div className="side-menu-backdrop" style={{position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)'}} onClick={() => setIsMenuOpen(false)}></div>
            <div className="side-menu-content" style={{position: 'relative', width: '280px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.2)'}}>
              <div style={{padding: '20px', background: '#00d1b2', color: 'white'}}>
                <h2 style={{margin: 0, fontWeight: '800', fontSize: '24px'}}>Menú</h2>
                <p style={{margin: '5px 0 0', fontSize: '14px', opacity: 0.9}}>{profileData?.name || 'CitaCiudadana'}</p>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', padding: '10px 0', overflowY: 'auto', flex: 1}}>
                <div style={{padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', fontSize: '16px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '15px'}} onClick={() => { setIsMenuOpen(false); alert('Próximamente: Configuraciones'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Configuraciones
                </div>
                <div style={{padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', fontSize: '16px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '15px'}} onClick={() => { setIsMenuOpen(false); alert('Próximamente: Accesibilidad'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  Accesibilidad
                </div>
                <div style={{padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', fontSize: '16px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '15px'}} onClick={() => { setIsMenuOpen(false); alert('Próximamente: Notificaciones'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  Notificaciones
                </div>
                <div style={{padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', fontSize: '16px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '15px'}} onClick={() => { setIsMenuOpen(false); alert('Próximamente: Idioma'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  Idioma
                </div>
                <div style={{padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold', fontSize: '16px', color: '#2c4251', display: 'flex', alignItems: 'center', gap: '15px'}} onClick={() => { setIsMenuOpen(false); alert('Próximamente: Soporte / Ayuda'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Soporte / Ayuda
                </div>
              </div>
              <div style={{padding: '20px', borderTop: '1px solid #eee'}}>
                <button onClick={() => { setIsMenuOpen(false); handleLoadProfile(); }} style={{background: '#326789', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px'}}>Ver Mi Perfil</button>
              </div>
            </div>
          </div>
        )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainApp;
