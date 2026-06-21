import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'Com.citaciudadana',
  appName: 'CitaCiudadana_Beta',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '478435404426-asgtqjj6l4co3kvh63u1n85uhbvl4cl7.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  server: {
    cleartext: true
  }
};

export default config;
