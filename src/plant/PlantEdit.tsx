import React, { useContext, useEffect, useState } from 'react';
import {
  createAnimation,
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
import { useMyLocation } from '../core/useMyLocation';
import { MyMap } from '../core/MyMap';
import { createShakingAnimation, playChainAnimation } from './PlantAnimations';


interface PlantEditProps extends RouteComponentProps<{id: string;}> {}


const PlantEdit: React.FC<PlantEditProps> = ({ history, match }) => {
  const { plants, saving, savingError, editPlant, 
          deletePlant, getConflict, resolving, resolvingError,
          pushChanges, quitChanges } = useContext(PlantContext);

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [currLatitude, setCurrLatitude] = useState<number | undefined>(undefined);
  const [currLongitude, setCurrLongitude] = useState<number | undefined>(undefined);

  const [plant, setPlant] = useState<PlantProps>();
  const [conflict, setConflict] = useState<boolean>(false);
  const [conflictedPlant, setConflictedPlant] = useState<PlantProps | null>(null);
  const { takePhoto, loadPhoto, deletePhoto } = usePhotoGallery();

  const [photoLink, setPhotoLink] = useState<string | undefined>(undefined);

  const myLocation = useMyLocation();
  const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}

  const takePicture = async () => {
    const routeId = match.params.id;
    const photoTaken = await takePhoto(routeId);
    setPhoto(photoTaken);
  }

  const handleDeletePicture = async ()  => {
    const routeId = match.params.id;
    await deletePhoto(photo!, routeId)
      .catch((err) => console.log(err));
    console.log("Picture deleted");
    setPhoto(undefined);
  }

  const loadPicture = async () => {
    // const routeId = match.params.id;
    // const photoUploaded = await loadPhoto(routeId); 
    // setPhoto(photoUploaded);
  }

  useEffect(() => { 
    if(photo != undefined){
      console.log("try to update plant");
      let base64Data = photo.base64Encoding;
      let converted_image= "data:image/jpeg;base64,"+base64Data;
      setPhotoLink(converted_image);
    }
   }, [photo, plant]);

  useEffect( () => {
    loadPicture();
    const rootNode = document.getElementById('editPageIonContent');
    rootNode && playChainAnimation(rootNode.childNodes as unknown as Element[]);
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
    if(latitude == undefined && longitude == undefined){
      setCurrLatitude(lat);
      setCurrLongitude(lng);
    }else{
      setCurrLatitude(latitude);
      setCurrLongitude(longitude);
    }
  }, [lat, lng, longitude, latitude]);


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
      setLatitude(plant.latitude);
      setLongitude(plant.longitude);
      setPhoto(plant.photo);
    }
  }, [match.params.id, plants]);

  const handleEdit = () => {
    const editedPlant = {...plant, description, name, type, latitude, longitude, photo} ;
    
    const animationsContainer = validationWithAnimation();
    console.log(animationsContainer);
    if(animationsContainer.length == 0){
      editPlant && editPlant(editedPlant).then(() => history.goBack());
    }
    else{
      const parentAnimation = createAnimation()
        .duration(100)
        .direction('alternate')
        .iterations(6)
        .addAnimation(animationsContainer);
      parentAnimation.play(); 
    }
  };

  const handleExit = () => {
    history.goBack();
  }

  function change(source: string) {
    return (e: any) => {
      setCurrLatitude(e.latLng.lat());
      setCurrLongitude(e.latLng.lng());
      console.log(source, e.latLng.lat(), e.latLng.lng());
    };
  }

  function setLocation(){
    setLatitude(currLatitude);
    setLongitude(currLongitude);
  }

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

      <IonContent id='editPageIonContent'>
        <IonItem id="nameIonItem">
            <IonLabel position="floating">Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem id="descriptionIonItem">
            <IonLabel position="floating">Description</IonLabel>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value!)}></IonInput>
        </IonItem>

        <IonItem id="typeIonItem">
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
          <IonFab horizontal="end">
            <IonFabButton onClick={() => handleDeletePicture()}>
              <IonLabel>X photo</IonLabel>
            </IonFabButton>
          </IonFab>               
        
        <IonFab horizontal="center">
              <IonFabButton onClick={() => takePicture()}>
                <IonIcon icon={camera}/>
              </IonFabButton>
        </IonFab>

          <IonLabel className="ion-padding">Plant looks like: </IonLabel>        
        </IonItem>

        <IonItem> 
        {photo && <IonImg src={photoLink}/>}
          {!photo && <IonLabel>No photo uploaded</IonLabel>}
        </IonItem>

        <IonItem>
          <IonLabel>Where is the plant located?</IonLabel>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Latitude of plant location</IonLabel>
            <IonInput value={latitude || "Not set yet!"} readonly></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Longitude of plant location</IonLabel>
            <IonInput value={longitude || "Not set yet!"} readonly></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Current latitude on map</IonLabel>
            <IonInput value={currLatitude || "Not set yet!"} readonly></IonInput>
        </IonItem>

        <IonItem>
            <IonLabel position="floating">Current longitude on map</IonLabel>
            <IonInput value={currLongitude || "Not set yet!"} readonly></IonInput>
        </IonItem>

        <IonButton onClick={setLocation}>
          SET LOCATION TO PLANT
        </IonButton>

        {currLatitude && currLongitude &&
          <MyMap
            lat={currLatitude}
            lng={currLongitude}
            onMapClick={change('onMap')}
            onMarkerClick={change('onMarker')}
          />
        }


        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => deletePlant && deletePlant(match.params.id).then(() => history.goBack())}>
            <IonIcon icon={trashOutline}/>
          </IonFabButton>
        </IonFab>

        
       
      </IonContent>
    </IonPage>
  );
};

export default PlantEdit;
