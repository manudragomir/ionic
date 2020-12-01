import { IonAlert, IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import React, { useContext, useEffect, useState } from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { AuthContext } from './AuthProvider';

interface LoginState{
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ( {history} ) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError, offline} = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const [networkMessage, setNetworkMessage] = useState<string>("unknown");
    useEffect( () => {
        if(offline){
            setNetworkMessage("OFFLINE :(");
        }
        else{
            setNetworkMessage("ONLINE :)");
        }
    }, [offline]);

    const {username, password} = state;
    const handleLogin = () => {
        console.log("Login started");
        login?.(username, password);
    }
    if(isAuthenticated){
        return <Redirect to={{ pathname: '/'}}/>
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login to PlantApp</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding ion-text-center">
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonIcon style={ {fontSize: "100px"} } icon={personCircle}/>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel position="floating">Username</IonLabel>
                                    <IonInput
                                        value={username}
                                        onIonChange={e => setState({
                                            ...state,
                                            username: e.detail.value || ''
                                        })}
                                    >
                                    </IonInput>
                                </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel position="floating"> Password</IonLabel>
                                <IonInput
                                    type="password"
                                    value={password}
                                    onIonChange={e => setState({
                                        ...state,
                                        password: e.detail.value || ''
                                    })}
                                >
                                </IonInput>
                            </IonItem>
                            <IonLoading isOpen={isAuthenticating}/>
                                {authenticationError && (
                                <div>
                                    {authenticationError.message || 'Failed to authenticate the user'}
                                </div>
                                )}
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonButton onClick={handleLogin}>Login</IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
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