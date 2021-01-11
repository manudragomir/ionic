import React, { useContext, useEffect, useState } from 'react';
import {
  createAnimation,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
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
import { createShakingAnimation, playGroupAnimation } from './PlantAnimations';
import { cloudUploadOutline, exitOutline } from 'ionicons/icons';


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
  
  const validationWithAnimation = () => {
    let animationsContainer = [];
    if(!description){
      let descriptionIonItem = document.getElementById('descriptionIonItem');
      animationsContainer.push(createShakingAnimation(descriptionIonItem!!));
    }

    if(!name){
      let nameIonItem = document.getElementById('nameIonItem');
      animationsContainer.push(createShakingAnimation(nameIonItem!!));
    }

    if(!type){
      let typeIonItem = document.getElementById('typeIonItem');
      animationsContainer.push(createShakingAnimation(typeIonItem!!));
    }

    return animationsContainer;
  }

  const handleSave = () => {
    const animationsContainer = validationWithAnimation();
    console.log(animationsContainer);
    if(animationsContainer.length == 0){
      plant && addPlant && addPlant(plant).then(() => history.goBack());
    }
    else{
      playGroupAnimation(animationsContainer);
    }
  };

  const handleExit = () => {
    history.goBack();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add a new plant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
                <IonIcon icon={cloudUploadOutline} slot="start"></IonIcon>
              Save
            </IonButton>
            <IonButton onClick={handleExit}>
                <IonIcon icon={exitOutline} slot="start"></IonIcon>
              Exit
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem id="nameIonItem">
            <IonLabel position="floating">Plant's Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem id="descriptionIonItem">
            <IonLabel position="floating">Plant's Description</IonLabel>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem id="typeIonItem">
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
