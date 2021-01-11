import React, { useContext, useEffect, useState } from 'react'
import {IonContent, IonFabButton, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonLoading, IonList, IonButton, IonSelect, IonSelectOption, IonSearchbar, IonInfiniteScroll, IonInfiniteScrollContent, IonFooter, IonModal} from '@ionic/react'
import PlantItem from './PlantItem'
import { PlantContext } from './PlantProvider'
import { add } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { AuthContext } from '../auth';
import { PlantProps } from './PlantProps';
import { playIconAnimation } from './PlantAnimations';

const PlantList: React.FC<RouteComponentProps> = ({ history }) => {
    const { plants, fetching, fetchingError, types, filterPlants, filterError } = useContext(PlantContext);
    const { logout, offline } = useContext(AuthContext);
    const limit = 3;
    const [ page, setPage ] = useState<number>(0);
    const [ filter, setFilter] = useState<string>('any');
    const [ currTypes, setCurrTypes ] = useState<string[]>([]);
    const [ myPlants, setMyPlants] = useState<PlantProps[] | undefined>(plants);
    const [ searchName, setSearchName] = useState<string | undefined>(undefined);
    const [ disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [ networkMessage, setNetworkMessage] = useState<string>("unknown");

    useEffect( () => {
        if(filterError != null){
            setMyPlants(plants);
        }
    }, [filterError]);

    useEffect( () => {
        if(offline == true){
            setNetworkMessage("OFFLINE :(");
            setMyPlants(plants);
            setDisableInfiniteScroll(true);
        }
        else{
            setNetworkMessage("ONLINE :)");
            setDisableInfiniteScroll(false);
            setPage(0);
        }

        if(offline == false && types !== undefined){
            setCurrTypes(types);
        }
    }, [offline]);

    async function getNextBatch($event: CustomEvent<void>) {
        if(offline == false){
            console.log("TRY TO GET NEXT BATCH");
            filterPlants?.(filter, page, limit).then( (filteredPlants) => {
                if(filteredPlants.length == 0){
                    console.log("WHAT");
                    setDisableInfiniteScroll(true);
                }
                else{
                    setMyPlants(myPlants?.concat(filteredPlants));
                    if(filteredPlants.length < limit){
                        console.log("WHAT");
                        setDisableInfiniteScroll(true);
                    }
                    let nextPage = page + 1;
                    setPage(nextPage);
                }
            });
            ($event.target as HTMLIonInfiniteScrollElement).complete();
        }
    }

    useEffect( () => {
        if(offline == false){
            if(filter == undefined){
                setMyPlants(plants);
            }
            else{
                filterPlants?.(filter, 0, limit).then( (filteredPlants) => {setMyPlants(filteredPlants);});
                setPage(1);
            }
        }
        else{
            console.log(plants);
            setMyPlants(plants);
            console.log(plants);
        }
    }, [filter, plants, offline]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle onAnimationStart={e => playIconAnimation(e.currentTarget)}>
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
                            .map(({_id, name, description, type, loaded, version, latitude, longitude, photo}) => 
                            <PlantItem key={_id} name={name} description={description} type={type} loaded={loaded} _id={_id}
                                        version={version} latitude={latitude} longitude={longitude} photo={photo}
                                        onEdit={() => {history.push(`/plants/${_id}`)}} />) }
                    </IonList>
                    )}
                 <IonInfiniteScroll threshold="100px" 
                                    disabled={disableInfiniteScroll}
                                    onIonInfinite={(e: CustomEvent<void>) => getNextBatch(e)}>
                    <IonInfiniteScrollContent
                        loadingSpinner="bubbles"
                        loadingText="Loading more and more plants...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                
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

            <IonFooter>
                        <IonToolbar>
                            <IonTitle>
                                NETWORK STATUS: {networkMessage}
                            </IonTitle>
                        </IonToolbar>
            </IonFooter>

        </IonPage>
    );
}


export default PlantList;