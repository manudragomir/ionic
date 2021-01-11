import React, { useContext, useEffect, useState } from 'react';
import { CreateAnimation, IonButton, IonIcon, IonImg, IonItem, IonLabel, IonThumbnail } from '@ionic/react';
import { leafOutline, alertOutline, checkmarkOutline, analyticsOutline, accessibilityOutline } from 'ionicons/icons';
import { PlantProps } from './PlantProps'
import { PlantContext } from './PlantProvider';
import { AuthContext } from '../auth';
import { Photo, usePhotoGallery } from '../core/usePhoto';
import { playIconAnimation } from './PlantAnimations';

// interface PlantPropsMoreExtended extends PlantPropsExtended
// {
//   deleteMethod?: (id: String) => Promise<any>
// } 

interface PlantPropsExtended extends PlantProps{
  onEdit: (_id?: string) => void;
}

const PlantItem: React.FC<PlantPropsExtended> = ({ _id, name, description, type, onEdit, loaded, version, latitude, longitude, photo }) => {
  const { getConflict, plants } = useContext(PlantContext);
  const { offline } = useContext(AuthContext);
  const [conflict, setConflict] = useState<boolean>(false);
  const [colorString, setColorString] = useState<string>('default');
  const [photoLink, setPhotoLink] = useState<string | undefined>(undefined);

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

  useEffect(() => { 
      if(photo != undefined){
        console.log("try to get new photo");
        let base64Data = photo.base64Encoding;
        let converted_image= "data:image/jpeg;base64,"+base64Data;
        setPhotoLink(converted_image);
      }
      else{
        setPhotoLink(undefined);
      }
   }, [photo]);

   const startAnimation = (e: Element) => {
     
     playIconAnimation(e.firstElementChild);
   }

  return (
    <IonItem style={{height: 200}} onTouchStart={e => startAnimation(e.currentTarget)}>
      <IonIcon className="animatedIcon" icon={leafOutline} slot="start" ></IonIcon>
      <IonLabel onClick={() => onEdit(_id)}>
        <h2 style={{color: colorString }}>{name}</h2>
        <p>{description}</p>
        <p>{type}</p>
        <p>{version}</p>
        <p>{latitude}</p>
        <p>{longitude}</p>
      </IonLabel>
      
      {photoLink && <IonThumbnail slot="start">
            <IonImg src={photoLink} />
      </IonThumbnail>}

      <IonButton slot="end">
        {loaded == true && <IonIcon icon={alertOutline}/>}
        {loaded == undefined && <IonIcon icon={checkmarkOutline}/>}
      </IonButton>
    </IonItem>
  );
};

export default PlantItem;
