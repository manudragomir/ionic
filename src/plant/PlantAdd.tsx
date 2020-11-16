import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { PlantContext } from './PlantProvider';
import { RouteComponentProps } from 'react-router';
import { PlantProps } from './PlantProps';


const PlantAdd: React.FC<RouteComponentProps> = ({ history }) => {
  const { saving, savingError, addPlant } = useContext(PlantContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [plant, setPlant] = useState<PlantProps>();

  useEffect(() => {
    setPlant({
        description: description,
        name: name,
        type: type});
    }, [description, name, type]);

  const handleSave = () => {
    plant && addPlant && addPlant(plant).then(() => history.goBack());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add a new plant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Add
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonItem>
            <IonLabel position="floating">Plant's Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Plant's Description</IonLabel>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Plant's Type</IonLabel>
            <IonInput value={type} onIonChange={e => setType(e.detail.value!)}></IonInput>
        </IonItem>

        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save plant :('}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PlantAdd;
