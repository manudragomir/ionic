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

const PlantItem: React.FC<PlantPropsExtended> = ({ _id, name, description, type, onEdit, loaded, version }) => {
  return (
    <IonItem style={{height: 200}}>
      <IonIcon icon={leafOutline} slot="start"></IonIcon>
      <IonLabel onClick={() => onEdit(_id)}>
        <h2>{name}</h2>
        <p>{description}</p>
        <p>{type}</p>
        <p>{version}</p>
      </IonLabel>
      <IonButton slot="end">
        {loaded == true && <IonIcon icon={alertOutline}/>}
        {loaded == undefined && <IonIcon icon={checkmarkOutline}/>}
      </IonButton>
    </IonItem>
  );
};

export default PlantItem;
