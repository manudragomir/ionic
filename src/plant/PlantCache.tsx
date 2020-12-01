import { Plugins } from '@capacitor/core';
import { memo } from 'react';
import { PlantProps } from './PlantProps';
const { Storage } = Plugins;

export const cachePlants: (plants: PlantProps[]) => void = async (plants) => {
    // await Storage.clear();
     plants.map(async plant => {
         await Storage.set({
             key: JSON.stringify(plant._id),
             value:  JSON.stringify(plant)
         });
     });
     console.log("store cached");
 }


 export const savePlantOnCache: (plant: PlantProps) => Promise<(PlantProps)> = async (plant) => {
     console.log("save on cache");
     plant.loaded = true;
     plant._id = Math.random().toString(36).substring(7);
     await Storage.set({
        key: JSON.stringify(plant._id),
        value:  JSON.stringify(plant)
     });
     return plant;
 }

 export const editPlantOnCache: (plant: PlantProps) => Promise<(PlantProps)> = async (plant) => {
    console.log("edit on cache");
    plant.loaded = true;
    let memoryPlant = await getPlantMemoryCache(plant._id!!);
    if(memoryPlant != undefined){
        await Storage.remove({key: JSON.stringify(plant._id)});
    }

    Storage.set({
        key: JSON.stringify(plant._id),
        value:  JSON.stringify(plant)
     });

    return plant;
}

export const deletePlantFromCache: (_id: String) => Promise<(PlantProps)> = async (_id) => {
    console.log("delete on cache");
    let memoryPlant = await getPlantMemoryCache(JSON.stringify(_id));
    if(memoryPlant != undefined){
        await Storage.remove({key: JSON.stringify(_id)});
    }
    return memoryPlant;
}
 
 const getPlantMemoryCache: (keyCome: string) => Promise<PlantProps> = (keyCome) => {
     return (async () => {
         const ret = await Storage.get({
           key: keyCome
         });
         return Promise.resolve(ret).then( (val) => {
             if(val.value != null){ 
                 return JSON.parse(val.value);
             }
         });
     })();
 }

 export const loadCachePlants: () => Promise<any[]> = async () => {
    console.log("load cache");
    const {keys} = await Storage.keys();
    let plants = await Promise.all(keys.map(async (key) => {
        if(key != 'token'){
            console.log(key);
            return await getPlantMemoryCache(key);
        }
    }));
    return plants;
}