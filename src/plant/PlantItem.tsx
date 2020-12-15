import React, { useContext, useEffect, useState } from 'react';
import { IonButton, IonIcon, IonImg, IonItem, IonLabel, IonThumbnail } from '@ionic/react';
import { leafOutline, alertOutline, checkmarkOutline, analyticsOutline, accessibilityOutline } from 'ionicons/icons';
import { PlantProps } from './PlantProps'
import { PlantContext } from './PlantProvider';
import { AuthContext } from '../auth';
import { Photo, usePhotoGallery } from '../core/usePhoto';

// interface PlantPropsMoreExtended extends PlantPropsExtended
// {
//   deleteMethod?: (id: String) => Promise<any>
// } 

interface PlantPropsExtended extends PlantProps{
  onEdit: (_id?: string) => void;
}

const PlantItem: React.FC<PlantPropsExtended> = ({ _id, name, description, type, onEdit, loaded, version }) => {
  const { getConflict, plants } = useContext(PlantContext);
  const { offline } = useContext(AuthContext);
  const [conflict, setConflict] = useState<boolean>(false);
  const [colorString, setColorString] = useState<string>('default');

  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const { loadPhoto } = usePhotoGallery();

  const uploadPhoto = async () => {
    const myPhoto = await loadPhoto(_id);
    setPhoto(myPhoto);
  }
  
  useEffect( () => {
    uploadPhoto();
  }, []);

  useEffect(() => {
    getConflict?.(_id!).then( (answer) => {
      if(answer == null){
        setConflict(false);
        setColorString('default');
      }
      else{
        setConflict(true);
        setColorString('red');
      }
    });
  }, [offline, getConflict, plants]);

  return (
    <IonItem style={{height: 200}}>
      <IonIcon icon={leafOutline} slot="start"></IonIcon>
      <IonLabel onClick={() => onEdit(_id)}>
        <h2 style={{color: colorString }}>{name}</h2>
        <p>{description}</p>
        <p>{type}</p>
        <p>{version}</p>
      </IonLabel>
      
      <IonThumbnail slot="start">
            <IonImg src={photo?.webviewPath} />
          </IonThumbnail>

      <IonButton slot="end">
        {loaded == true && <IonIcon icon={alertOutline}/>}
        {loaded == undefined && <IonIcon icon={checkmarkOutline}/>}
      </IonButton>
    </IonItem>
  );
};

export default PlantItem;
