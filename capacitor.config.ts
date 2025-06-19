import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'front-end',
  webDir: 'www',
  server: {
    cleartext: true,
    androidScheme: "http"
  }
};

export default config;
