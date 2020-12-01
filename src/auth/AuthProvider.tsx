import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import { login as loginApi } from './AuthApi'
import { storeToken, loadToken, unstoreAll } from './AuthApi'
import { useNetwork } from '../core/NetworkStatus'


type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState{
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    logout?: LogoutFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
    refresh?: () => void;
    offline: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
    offline: false
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState<AuthState>(initialState);
    const [refresher, setRefresher] = useState<boolean>(false);
    const [offline, setOffline] = useState<boolean>(false);
    const { networkStatus } = useNetwork();
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);

    useEffect( () => {
        setOffline(!networkStatus.connected);
    }, [networkStatus]);
    
    function refresh(): void{
        // unstoreToken();
        // setState({
        //     ...state,
        //     isAuthenticated: false,
        //     token: ''
        // });
        // loginCallback(state.username, state.password);
    }

    useEffect(authenticationEffect, [pendingAuthentication]);

    const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token, refresh, offline};

    useEffect(loadTokenEffect, []);

    return (
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    )

    function loginCallback(username?: string, password?: string): void {
        console.log('login now');
        setState({
          ...state,
          username,
          password,
          pendingAuthentication: true
        });
    }

    function logoutCallback(): void{
        console.log('logout now');
        setState({
            ...state,
            isAuthenticated: false,
            token: ''
        });
        destroyAll();
    }

    function destroyAll(){
        let canceled = false;
        removeAll();
        return () => {
            canceled = true;
        }
        async function removeAll(){
            try{
                console.log('remove all');
                await unstoreAll();
                if(canceled){
                    return;
                }
            } catch(err){
                if(canceled){
                    return;
                }
                console.log(err);
            }
        }
    }

    function loadTokenEffect(){
        setState({
            ...state,
            isAuthenticating: true
        });
        let canceled = false;
        getToken();
        return () => {
            canceled = true;
        }
        async function getToken(){
            try{
                console.log('get token');
                const token = await loadToken();
                if(canceled){
                    return;
                }
                if(token !== null){
                    setState({
                        ...state,
                        token,
                        isAuthenticated: true,
                        isAuthenticating: false
                    });
                }
                else{
                    setState({
                        ...state,
                        isAuthenticating: false
                    })
                }
            } catch(error){
                if(canceled){
                    return;
                }
                console.log(error);
            }
        }
    }

    function authenticationEffect(){
        let canceled = false;
        authentication();
        return () => {
            canceled = true;
        }
        async function authentication(){
            if(!pendingAuthentication){
                console.log("pending is false");
                return;
            }
            try{
                console.log('auth');
                setState({
                    ...state,
                    isAuthenticating: true
                });
                const {username, password} = state;
                const {token} = await loginApi(username, password);
                if(canceled){
                    return;
                }
                console.log("Success");
                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
                storeToken(token);
            } catch (error) {
                if (canceled) {
                    return;
                }
                console.log('authentication failed');
                setState({
                    ...state,
                    authenticationError: error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }
        }
    } 
}
