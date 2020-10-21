import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import MyFirstComponent from '../components/MyFirstComponent';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Plant App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Plant App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <MyFirstComponent />
      </IonContent>
    </IonPage>
  );
};

export default Home;
