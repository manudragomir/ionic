import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
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
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { PlantProps } from './PlantProps';
import { cloudUploadOutline, trashOutline } from 'ionicons/icons';


interface PlantEditProps extends RouteComponentProps<{id: string;}> {}


const PlantEdit: React.FC<PlantEditProps> = ({ history, match }) => {
  const { plants, saving, savingError, editPlant, deletePlant } = useContext(ItemContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [plant, setPlant] = useState<PlantProps>();

  useEffect(() => {
    const routeId = match.params.id;
    const plant = plants?.find(it => it.id === routeId);
    setPlant(plant);
    if (plant) {
      setName(plant.name);
      setDescription(plant.description);
    }
  }, [match.params.id, plants]);

  const handleEdit = () => {
    const editedPlant = {...plant, description, name} ;
    editPlant && editPlant(editedPlant).then(() => history.goBack());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Plant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleEdit}>
                <IonIcon icon={cloudUploadOutline} slot="start"></IonIcon>
              Done editing
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonItem>
            <IonLabel position="floating">Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Description</IonLabel>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value!)}></IonInput>
        </IonItem>

        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to edit plant :('}</div>
        )}

        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => deletePlant && deletePlant(match.params.id).then(() => history.goBack())}>
            <IonIcon icon={trashOutline}/>
          </IonFabButton>
        </IonFab>
       
      </IonContent>
    </IonPage>
  );
};

export default PlantEdit;
