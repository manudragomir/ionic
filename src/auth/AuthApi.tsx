import { Plugins } from '@capacitor/core';
import axios from 'axios';
import { isStr } from 'ionicons/dist/types/components/icon/utils';
import { baseUrl, config, withoutHttpUrl } from '../core';

const { Storage } = Plugins;


const authUrl = `http://${withoutHttpUrl}/api/auth/login`;

export interface AuthProps {
  token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  console.log("API login")
  return axios.post(
      authUrl, 
      { username, password }, 
      config
      ).then(res => {
        console.log('log in with success');
        return Promise.resolve(res.data);
      })
      .catch(err => {
          console.log("No success for log in");
          return Promise.reject(err);
      })
}

export function storeToken(token: string) {
  (async() => {
    await Storage.set({
      key: 'token',
      value: JSON.stringify(token)
    })
  })();
  console.log("stored");
}

export function unstoreToken(){
  (async() => {
    await Storage.remove({
      key: 'token',
    })
  })();
  console.log("unstored");
}

export const loadToken: () => Promise<string | null> = async () => {
  const ret = await Storage.get({ key: 'token' });
  if(ret.value !== null){
    return JSON.parse(ret.value);
    }
  else {
    return null;
  }
}