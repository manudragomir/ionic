import axios from 'axios';
import { PlantProps } from './PlantProps';

const withoutHttpUrl = 'localhost:3333'
const baseUrl = 'http://localhost:3333';

const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

export const getPlantsFromServer: () => Promise<PlantProps[]> = () => {
    return axios
        .get(`${baseUrl}/plants`)
        .then(res => {
            console.log('plants got with success');
            return Promise.resolve(res.data);
        })
        .catch(err => {
            console.log("No success");
            return Promise.reject(err);
        })
}   

export const savePlantOnServer: (plant: PlantProps) => Promise<PlantProps[]> = plant => {
    console.log("Se salveaza")
    return axios
        .post(`${baseUrl}/new_plant`, plant, config)
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
    }


export const deletePlantFromServer: (id: String) => Promise<PlantProps[]> = id => {
    console.log("Se salveaza")
    return axios
        .delete(`${baseUrl}/plants/${id}`, config)
        .then((res) => {
            console.log(res.data);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
    }

export const editPlantOnServer: (plant: PlantProps) => Promise<PlantProps[]> = plant => {
    console.log("Se face update")
    return axios
        .put(`${baseUrl}/plants/${plant.id}`, plant, config)
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

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${withoutHttpUrl}`)
    ws.onopen = () => {
        console.log('web socket onopen')
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