import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA32ca5fpNqfmuqpsat5KWRlEnHhvSs48I",
  authDomain: "cita-ciudadana.firebaseapp.com",
  projectId: "cita-ciudadana",
  storageBucket: "cita-ciudadana.firebasestorage.app",
  messagingSenderId: "478435404426",
  appId: "1:478435404426:web:250cbc2b7c1d2261fc1b73",
  measurementId: "G-6YKQBLZB5C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runTests() {
  console.log("Iniciando pruebas de Firebase...");
  
  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = "Password123!";
  
  try {
    console.log(`1. Intentando registrar usuario: ${testEmail}`);
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log("✅ Registro exitoso. UID:", userCredential.user.uid);
    
    console.log("2. Intentando guardar datos en Firestore (Colección 'users')...");
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: "Usuario de Prueba",
      email: testEmail,
      createdAt: new Date().toISOString()
    });
    console.log("✅ Datos guardados en Firestore.");
    
    console.log("3. Intentando leer datos desde Firestore...");
    const docSnap = await getDoc(doc(db, "users", userCredential.user.uid));
    if (docSnap.exists()) {
      console.log("✅ Datos leídos correctamente:", docSnap.data());
    } else {
      console.log("❌ No se encontró el documento.");
    }
    
    console.log("4. Intentando iniciar sesión...");
    await auth.signOut();
    const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log("✅ Inicio de sesión exitoso. UID:", loginResult.user.uid);
    
    console.log("🎉 TODAS LAS PRUEBAS PASARON CORRECTAMENTE.");
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR EN LAS PRUEBAS:", error);
    process.exit(1);
  }
}

runTests();
