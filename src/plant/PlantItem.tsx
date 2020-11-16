import React, { useContext } from 'react';
import { IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react';
import { leafOutline, closeCircleOutline } from 'ionicons/icons';
import { PlantProps } from './PlantProps'

// interface PlantPropsMoreExtended extends PlantPropsExtended
// {
//   deleteMethod?: (id: String) => Promise<any>
// } 

interface PlantPropsExtended extends PlantProps{
  onEdit: (_id?: string) => void;
}

const PlantItem: React.FC<PlantPropsExtended> = ({ _id, name, description, type, onEdit }) => {
  return (
    <IonItem style={{height: 500}}>
      <IonIcon icon={leafOutline} slot="start"></IonIcon>
      <IonLabel onClick={() => onEdit(_id)}>
        <h2>{name}</h2>
        <p>{description}</p>
        <p>{type}</p>
      </IonLabel>
      <IonButton slot="end">
        <IonIcon icon={closeCircleOutline}></IonIcon>
      </IonButton>
    </IonItem>
  );
};

export default PlantItem;
