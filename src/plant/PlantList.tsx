import React, { useContext, useEffect, useState } from 'react'
import {IonContent, IonFabButton, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonLoading, IonList, IonButton, IonSelect, IonSelectOption, IonSearchbar} from '@ionic/react'
import PlantItem from './PlantItem'
import { PlantContext } from './PlantProvider'
import { add } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { AuthContext } from '../auth';
import { PlantProps } from './PlantProps';

const PlantList: React.FC<RouteComponentProps> = ({ history }) => {
    const { plants, fetching, fetchingError, types, filterPlants } = useContext(PlantContext);
    const { logout, token } = useContext(AuthContext);
    const [ filter, setFilter] = useState<string | undefined>('any');
    const [ currTypes, setCurrTypes ] = useState<string[]>([]);
    const [ myPlants, setMyPlants] = useState<PlantProps[] | undefined>(plants);
    const [ searchName, setSearchName] = useState<string | undefined>(undefined);

    useEffect(() => {
        if(types !== undefined){
            setCurrTypes(types);
        }
    }, []);

    useEffect( () => {
        if(filter == undefined || filter == 'any'){
            setMyPlants(plants);
        }
        else{
            filterPlants?.(filter).then( (filteredPlants) => {setMyPlants(filteredPlants);});
        }
    }, [filter, plants]);
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
                <IonSearchbar
                    value={searchName}
                    debounce={1000}
                    onIonChange={e => setSearchName(e.detail.value!)}
                >
                </IonSearchbar>
                
                <IonLabel>Filter by type</IonLabel>

                <IonSelect value={filter} 
                           placeholder="Select Type" 
                           onIonChange={e => setFilter(e.detail.value)}
                           >
                    {types?.map((type: string) => <IonSelectOption key={type} value={type}>{type}</IonSelectOption>)}
                </IonSelect>
                <IonLoading isOpen={ fetching } message="Plants incoming..."/>
                {!myPlants && (
                    <IonLabel>Undefined plants</IonLabel>
                )}

                {myPlants && (
                    <IonList>
                        {myPlants
                            .filter(plant => searchName == undefined || plant.name.indexOf(searchName) >= 0)
                            .map(({_id, name, description, type}) => 
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