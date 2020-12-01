import axios from 'axios';
import { PlantProps } from './PlantProps';
import { config, baseUrl, withoutHttpUrl, authConfig } from '../core'

import { planetSharp } from 'ionicons/icons';

const plantUrl = `http://${withoutHttpUrl}/api/plant`;

export const getPlantsFromServer: (token: string) => Promise<PlantProps[]> = token => {
    return axios
        .get(plantUrl, authConfig(token))
        .then(res => {
            console.log('plants got with success');
            return Promise.resolve(res.data);
        })
        .catch(err => {
            console.log("No success");
            return Promise.reject(err);
        })
}   

export const savePlantOnServer: (token: string, plant: PlantProps) => Promise<PlantProps[]> = (token, plant) => {
    console.log("Se salveaza")
    return axios
        .post(`${plantUrl}/new`, plant, authConfig(token))
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
    }


export const deletePlantFromServer: (token: string, id: String) => Promise<PlantProps[]> = (token, id) => {
    console.log("Se sterge")
    return axios
        .delete(`${plantUrl}/${id}`, authConfig(token))
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
    }

export const editPlantOnServer: (token: string, plant: PlantProps) => Promise<PlantProps[]> = (token, plant) => {
    console.log("Se face update")
    return axios
        .put(`${plantUrl}/${plant._id}`, plant, authConfig(token))
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export const fetchPlantTypesFromServer: (token: string) => Promise<string[]> = (token) => {
    console.log("Se iau tipurile")
    return axios
        .get(`${plantUrl}/filter/tags`, authConfig(token))
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(Object.keys(res.data));
        })
        .catch((err) => {
            return Promise.reject(err);
    })
}

export const filterPlantsFromServer: (token: string, type: string, page?: number, limit?: number) => Promise<PlantProps[]> = (token, type, page, limit) => {
    console.log("se filtreaza");
    let url = `${plantUrl}/filter/${type}`;
    console.log("PLANTAPI" + page + limit);
    if(page !== undefined && limit !== undefined){
        url = url.concat(`?page=${page}&limit=${limit}`);
    }
    console.log(url);
    return axios
        .get(url, authConfig(token))
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            return Promise.reject(err);
    })
}


interface MessageData {
    event: string;
    payload: {
      item: PlantProps;
    };
}  

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${withoutHttpUrl}`)
    ws.onopen = () => {
        console.log('web socket onopen');
        ws.send(JSON.stringify({event: 'authorization', payload: {token}}));
    };
    ws.onclose = () => {
        console.log('web socket onclose');
    };
    ws.onerror = error => {
        console.log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        console.log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
}
