import React, { useContext, useEffect, useState } from 'react';
import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { PlantContext } from './PlantProvider';
import { RouteComponentProps } from 'react-router';
import { PlantProps } from './PlantProps';
import { camera, cloudUploadOutline, exitOutline, navigateOutline, trashOutline } from 'ionicons/icons';
import { Photo, usePhotoGallery } from '../core/usePhoto';


interface PlantEditProps extends RouteComponentProps<{id: string;}> {}


const PlantEdit: React.FC<PlantEditProps> = ({ history, match }) => {
  const { plants, saving, savingError, editPlant, 
          deletePlant, getConflict, resolving, resolvingError,
          pushChanges, quitChanges } = useContext(PlantContext);

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [plant, setPlant] = useState<PlantProps>();
  const [conflict, setConflict] = useState<boolean>(false);
  const [conflictedPlant, setConflictedPlant] = useState<PlantProps | null>(null);
  const { takePhoto, loadPhoto, deletePhoto } = usePhotoGallery();

  const takePicture = async () => {
    const routeId = match.params.id;
    const photoTaken = await takePhoto(routeId);
    setPhoto(photoTaken);
  }

  const handleDeletePicture = async ()  => {
    const routeId = match.params.id;
    await deletePhoto(photo!, routeId);
    console.log("Picture deleted");
    setPhoto(undefined);
  }

  const loadPicture = async () => {
    const routeId = match.params.id;
    const photoUploaded = await loadPhoto(routeId); 
    setPhoto(photoUploaded);
  }

  useEffect( () => {
    loadPicture();
  }, []);

  const handleQuitChanges = () => {
    const routeId = match.params.id;
    quitChanges && quitChanges(routeId).then(() => history.goBack());
  }

  const handlePushChanges = () => {
    const routeId = match.params.id;
    console.log("START PUSHING CHANGES");
    pushChanges && pushChanges(routeId).then(() => history.goBack());
  }

  useEffect( () => {
    const routeId = match.params.id;
    getConflict?.(routeId).then( (answer) => {
      if(answer == null){
        setConflict(false);
      }
      else{
        setConflict(true);
        setConflictedPlant(JSON.parse(answer));
      }
    });
  }, [getConflict]);

  useEffect(() => {
    const routeId = match.params.id;
    const plant = plants?.find(it => it._id === routeId);
    setPlant(plant);
    if (plant) {
      setName(plant.name);
      setDescription(plant.description);
      setType(plant.type);
    }
  }, [match.params.id, plants]);

  const handleEdit = () => {
    const editedPlant = {...plant, description, name, type, photo} ;
    editPlant && editPlant(editedPlant).then(() => history.goBack());
  };

  const handleExit = () => {
    history.goBack();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Plant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleEdit}>
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
        <IonItem>
            <IonLabel position="floating">Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Description</IonLabel>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Type</IonLabel>
            <IonInput value={type} onIonChange={e => setType(e.detail.value!)}></IonInput>
        </IonItem>

        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to edit plant :('}</div>
        )}

        <IonLoading isOpen={resolving} />
        {resolvingError && (
          <div>{resolvingError.message || 'Failed to resolve conflict :('}</div>
        )}

        {conflict && (
          <IonContent className="ion-padding ion-text-center">
            <IonRow>  
              <IonLabel className="ion-padding">
               There are some conflicts with this item. This is the last version you updated: 
              </IonLabel>
            </IonRow>
            
            <IonRow>
              <IonLabel>
                {conflictedPlant?.name}
              </IonLabel>
            </IonRow>

            <IonRow>
              <IonLabel>
                {conflictedPlant?.description}
              </IonLabel>
            </IonRow>

            <IonRow>
              <IonLabel>
                {conflictedPlant?.type}
              </IonLabel>
            </IonRow>


            <IonButton className="ion-padding" onClick={handleQuitChanges}>
              Keep last version.
            </IonButton>
            <IonButton className="ion-padding" onClick={handlePushChanges}>
              Push your version.
            </IonButton>
          </IonContent>
        )
        }

        <IonItem>
          <IonLabel className="ion-padding">Plant looks like: </IonLabel>
        </IonItem>

        <IonItem> 
        {photo && <IonImg src={photo.webviewPath}/>}
          {!photo && <IonLabel>No photo uploaded</IonLabel>}
        </IonItem>
        
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonRow>
            <IonCol>
              <IonFabButton onClick={() => takePicture()}>
                <IonIcon icon={camera}/>
              </IonFabButton>
            </IonCol>
            <IonCol>
              <IonFabButton>
                <IonIcon icon={navigateOutline}/>
              </IonFabButton>
            </IonCol>
          </IonRow>
        </IonFab>

        <IonFab vertical="bottom">
          
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => deletePlant && deletePlant(match.params.id).then(() => history.goBack())}>
            <IonIcon icon={trashOutline}/>
          </IonFabButton>
        </IonFab>

        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonFabButton onClick={() => handleDeletePicture()}>
            <IonLabel>X photo</IonLabel>
          </IonFabButton>
        </IonFab>

        
       
      </IonContent>
    </IonPage>
  );
};

export default PlantEdit;
