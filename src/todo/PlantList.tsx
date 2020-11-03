import React, { useContext } from 'react'
import {IonContent, IonFabButton, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonLoading, IonList} from '@ionic/react'
import PlantItem from './PlantItem'
import { ItemContext } from './ItemProvider'
import { add } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';

const PlantList: React.FC<RouteComponentProps> = ({ history }) => {
    const { plants, fetching, fetchingError } = useContext(ItemContext)
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        Plants Repository
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonLoading isOpen={fetching} message="Plants incoming..."/>
                {!plants && (
                    <IonLabel>Undefined plants</IonLabel>
                )}

                {plants && (
                    <IonList>
                        {plants.map(({id, name, description}) => 
                            <PlantItem key={id} name={name} description={description} 
                                        onEdit={() => {history.push(`/plants/${id}`)}} />)}
                    </IonList>
                    )}
                
                {fetchingError && (
                    <div>
                        <h2>Failed to fetch plants :( </h2>
                        <p>{fetchingError || 'Server failed to send plants'}</p>
                    </div>
                )}

                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => history.push('/new_plant')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>

        </IonPage>
    );
}


export default PlantList;