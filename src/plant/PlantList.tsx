import React, { useContext } from 'react'
import {IonContent, IonFabButton, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonLoading, IonList, IonButton} from '@ionic/react'
import PlantItem from './PlantItem'
import { PlantContext } from './PlantProvider'
import { add } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { AuthContext } from '../auth';

const PlantList: React.FC<RouteComponentProps> = ({ history }) => {
    const { plants, fetching, fetchingError } = useContext(PlantContext)
    const { logout } = useContext(AuthContext);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        Plants Repository
                    </IonTitle>
                    
                    <IonButton slot="end" onClick={() => {
                        if(logout !== undefined) {
                            logout();
                            history.push('/login')
                        }
                    }}
                        >Logout</IonButton>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonLoading isOpen={fetching} message="Plants incoming..."/>
                {!plants && (
                    <IonLabel>Undefined plants</IonLabel>
                )}

                {plants && (
                    <IonList>
                        {plants.map(({_id, name, description, type}) => 
                            <PlantItem key={_id} name={name} description={description} type={type}
                                        onEdit={() => {history.push(`/plants/${_id}`)}} />)}
                    </IonList>
                    )}
                
                {fetchingError && (
                    <div>
                        <h2>Failed to fetch plants :( </h2>
                        <p>{fetchingError.message || 'Server failed to send plants'}</p>
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