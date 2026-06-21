import { IonApp, setupIonicReact } from '@ionic/react';
import MainApp from './pages/MainApp';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';
import './theme/style.css'; // The copied CSS

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <MainApp />
  </IonApp>
);

export default App;
