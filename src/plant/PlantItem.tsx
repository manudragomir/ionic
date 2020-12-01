import React, { useContext, useEffect, useState } from 'react';
import { IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react';
import { leafOutline, alertOutline, checkmarkOutline } from 'ionicons/icons';
import { PlantProps } from './PlantProps'

// interface PlantPropsMoreExtended extends PlantPropsExtended
// {
//   deleteMethod?: (id: String) => Promise<any>
// } 

interface PlantPropsExtended extends PlantProps{
  onEdit: (_id?: string) => void;
}

const PlantItem: React.FC<PlantPropsExtended> = ({ _id, name, description, type, onEdit, loaded }) => {
  const [iconString, setIconString] = useState<string>(alertOutline);
  useEffect(() => {
    if(loaded == undefined){
      setIconString(checkmarkOutline);
    }
    else{
      setIconString(alertOutline);
    }
  }, [loaded]);

  return (
    <IonItem style={{height: 200}}>
      <IonIcon icon={leafOutline} slot="start"></IonIcon>
      <IonLabel onClick={() => onEdit(_id)}>
        <h2>{name}</h2>
        <p>{description}</p>
        <p>{type}</p>
      </IonLabel>
      <IonButton slot="end">
        <IonIcon icon={iconString}/>
      </IonButton>
    </IonItem>
  );
};

export default PlantItem;
