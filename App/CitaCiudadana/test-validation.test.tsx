import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import MainApp from './src/pages/MainApp';
import { IonApp } from '@ionic/react';

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: class {},
    onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return () => {}; }),
    signOut: vi.fn()
  }
});
vi.mock('./src/firebase', () => ({ auth: {}, db: {} }));

describe('MainApp', () => {
  it('should show error when fields are empty', async () => {
    render(<IonApp><MainApp /></IonApp>);
    
    fireEvent.click(screen.getByText('NEXT'));
    fireEvent.click(screen.getByText('NEXT'));
    fireEvent.click(screen.getByText('NEXT'));
    fireEvent.click(screen.getByText('REGISTRATE'));
    
    // Test empty
    fireEvent.click(screen.getByText('Entrar'));
    
    await waitFor(() => {
      const p = document.getElementById('registerError');
      if (!p.classList.contains('show')) throw new Error('not shown yet');
    });
    console.log("Error HTML empty:", document.getElementById('registerError').outerHTML);
    
    // Type single char
    fireEvent.change(document.getElementById('registerName'), { target: { value: 'a' } });
    fireEvent.change(document.getElementById('registerEmail'), { target: { value: 'a' } });
    
    fireEvent.click(screen.getByText('Entrar'));
    
    await waitFor(() => {
      const p = document.getElementById('registerError');
      if (!p.textContent.includes('Correo inválido') && !p.textContent.includes('ejemplo')) throw new Error('text not updated');
    });
    console.log("Error HTML one char:", document.getElementById('registerError').outerHTML);
  });
});
