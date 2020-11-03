import React from 'react';
import { IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react';
import { leafOutline, closeCircleOutline } from 'ionicons/icons';
import { PlantProps } from './PlantProps'

// interface PlantPropsExtended extends PlantProps
// {
//   deleteMethod?: (id: String) => Promise<any>
// } 

interface PlantPropsExtended extends PlantProps{
  onEdit: (id?: string) => void;
}

const PlantItem: React.FC<PlantPropsExtended> = ({ id, name, description, onEdit }) => {
  return (
    <IonItem>
      <IonIcon icon={leafOutline} slot="start"></IonIcon>
      <IonLabel onClick={() => onEdit(id)}>
        <h2>{name}</h2>
        <p>{description}</p>
      </IonLabel>
      <IonButton slot="end">
        <IonIcon icon={closeCircleOutline}></IonIcon>
      </IonButton>
    </IonItem>
  );
};

export default PlantItem;
