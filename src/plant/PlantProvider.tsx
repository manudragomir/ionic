import React, { useCallback, useContext } from 'react';
import { useEffect, useReducer, useState } from 'react';
import { deletePlantFromServer, editPlantOnServer, fetchPlantTypesFromServer, filterPlantsFromServer, getPlantsFromServer, newWebSocket, savePlantOnServer } from './PlantApi';
import { PlantProps } from './PlantProps'
import {cachePlants, loadCachePlants, savePlantOnCache, editPlantOnCache, deletePlantFromCache} from './PlantCache'
import PropTypes from 'prop-types';
import { AuthContext } from '../auth';

type SavePlantHeader = (plant: PlantProps) => Promise<any>;
type DeletePlantHeader = (_id: String) => Promise<any>;
type FilterPlantsHeader = (type: string, page?: number, limit?: number) => Promise<any>;

export interface PlantsState{
  plants?: PlantProps[],

  fetching: boolean,
  saving: boolean,
  deleting: boolean,

  fetchingError?: Error,
  savingError?: Error,
  deletingError?: Error,
  filterError?: Error,

  addPlant?: SavePlantHeader,
  deletePlant?: DeletePlantHeader,
  editPlant?: SavePlantHeader,
  filterPlants?: FilterPlantsHeader,

  types?: string[],
  refreshTypes: boolean
};

const initialState: PlantsState = {
  plants: undefined,

  fetching: false,
  saving: false,
  deleting: false,

  fetchingError: undefined,
  savingError: undefined,
  deletingError: undefined,
  filterError: undefined,
  refreshTypes: true,
  types: undefined
};


interface ActionProps {
  type: string,
  payload?: any,
}

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';

const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';

const SERVER_ITEM_INCOMING = 'SERVER_ITEM_INCOMING';
const SERVER_ITEM_REMOVING = 'SERVER_ITEM_REMOVING';
const SERVER_ITEM_UPDATED = 'SERVER_ITEM_UPDATED';

const FETCH_TYPES = 'FETCH_TYPES';
const FETCH_TYPES_ERROR = 'FETCH_TYPES_ERROR';

const SAVE_LOCAL_SUCCEEDED = 'SAVE_LOCAL_SUCCEEDED';
const EDIT_LOCAL_SUCCEEDED = 'EDIT_LOCAL_SUCCEEDED';
const DELETE_LOCAL_SUCCEEDED = 'DELETE_LOCAL_SUCCEEDED';

const MERGE_SERVER_STARTED = 'MERGE_SERVER_STARTED';
const MERGE_SERVER_SUCCEEDED = 'MERGE_SERVER_SUCCEEDED';
const MERGE_SERVER_FAILED = 'MERGE_SERVER_FAILED';

const FILTER_GOOD = 'FILTER_GOOD';
const FILTER_ERROR = 'FILTER_ERROR';

const reducer: (state: PlantsState, action: ActionProps) => PlantsState = 
  (state, {type, payload}) => {
    switch(type){
      case FETCH_ITEMS_STARTED:
        return {...state, fetching: true};
      case FETCH_ITEMS_SUCCEEDED:
        return {...state, plants: payload.plants, fetching: false}
      case FETCH_ITEMS_FAILED:
        return {...state, fetching: false, fetchingError: payload.error}
      case SAVE_ITEM_STARTED:
        return {...state, saving: true}
      case SAVE_ITEM_SUCCEEDED:{
        // const plant = payload.plant;
        // const updatedPlants = [...(state.plants || [])]
        // let indexPlant = updatedPlants.findIndex(it => it._id === plant._id);
        // if(indexPlant === -1){
        //   updatedPlants.push(plant);
        // }
        // else{
        //   updatedPlants[indexPlant] = plant;
        // }
        // return {...state, plants: updatedPlants, saving: false}
        return {...state, saving: false}
      }
      case SAVE_ITEM_FAILED:
        return {...state, savingError: payload.error, saving: false}
      case DELETE_ITEM_STARTED:
        return {...state, deleting: true};
      case DELETE_ITEM_SUCCEEDED:{
        const plants = [...(state.plants || [])];
        const plantRemoved = payload.plant;
        
        console.log("plants" + plants.toString());
        console.log("plantRemoved" + plantRemoved.toString());

        let indexPlant = plants.findIndex(it => it._id === plantRemoved._id);
        if(indexPlant === -1){
          return state;
        }
        plants.splice(indexPlant, 1);
        return {...state, plants, deleting: false}
      }
      case DELETE_ITEM_FAILED:
        return {...state, deletingError: payload.error, deleting: false}
      case SERVER_ITEM_REMOVING:{
        const plants = [...(state.plants || [])];
        const plantRemoved = payload.item;
        let indexPlant = plants.findIndex(it => it._id === plantRemoved._id);
        if(indexPlant === -1){
          return state;
        }
        plants.splice(indexPlant, 1);
        return {...state, plants}
      }
      case SERVER_ITEM_INCOMING:{
        const plants = [...(state.plants || [])];
        const plantAdded = payload.item;
        plants.push(plantAdded);
        return {...state, plants}
      }
      case SERVER_ITEM_UPDATED:{
        const plants = [...(state.plants || [])];
        const plantUpdated = payload.item;
        let indexPlant = plants.findIndex(it => it._id === plantUpdated._id);
        if(indexPlant === -1){
          return state;
        }
        plants[indexPlant] = plantUpdated;
        return {...state, plants};
      }
      case FETCH_TYPES:{
        console.log("FETCH modify state" + payload.types.toString());
        return {...state, types: payload.types};
      }
      case FETCH_TYPES_ERROR:{
        return {...state};
      }
      case SAVE_LOCAL_SUCCEEDED:{
        let plants = state.plants;
        plants?.push(payload.plant);
        return {...state, plants, saving: false, savingError: null};
      }
      case EDIT_LOCAL_SUCCEEDED:{
        const plants = [...(state.plants || [])];
        const plantUpdated = payload.plant;
        let indexPlant = plants.findIndex(it => it._id === plantUpdated._id);
        plants[indexPlant] = plantUpdated;
        return {...state, plants, saving: false, savingError: null};
      }
      case DELETE_LOCAL_SUCCEEDED:{
        const plants = [...(state.plants || [])];
        const plantRemoved = payload.plant;
        
        console.log("plants" + plants.toString());
        console.log("plantRemoved" + plantRemoved.toString());

        let indexPlant = plants.findIndex(it => it._id === plantRemoved._id);
        if(indexPlant === -1){
          return state;
        }

        plants.splice(indexPlant, 1);
        return {...state, plants, deleting: false, deletingError: false}
      }
      case FILTER_ERROR:{
        return {...state, filterError: payload.error};
      }
      case FILTER_GOOD:{
        return {...state, filterError: null};
      }
      case MERGE_SERVER_STARTED:{
        console.log("START MERGING");
        return {...state};
      }
      case MERGE_SERVER_SUCCEEDED:{
        console.log("DONE MERGING");
        return {...state};
      }        
      default:
        return state;
    }
};

export const PlantContext = React.createContext<PlantsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const PlantProvider: React.FC<ItemProviderProps> = ( {children}) => {
  const { token, refresh, offline } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(getPlants, [token]);
  useEffect(mergeWithServer, [token, offline]);
  useEffect(wsEffect, [token]);
  useEffect(getPlantTypes, [token]);

  const { plants, fetching, fetchingError, saving, savingError, deleting, refreshTypes, types, filterError  } = state;


  const addPlant = useCallback<SavePlantHeader>(savePlantCallback, [token, offline]);
  const deletePlant = useCallback<DeletePlantHeader>(deletePlantCallback, [token, offline]);
  const editPlant = useCallback<SavePlantHeader>(editPlantCallback, [token, offline]);
  const filterPlants = useCallback<FilterPlantsHeader>(filterPlantsCallback, [token]);

  const sharedData = { plants, fetching, fetchingError, saving, savingError, deleting, addPlant, deletePlant, editPlant, filterPlants, types, refreshTypes, filterError }

  return (
    <PlantContext.Provider value={sharedData}>
      {children}
    </PlantContext.Provider>
  )


  async function filterPlantsCallback(type: string, page?: number, limit?: number) {
    try {
      console.log("PLANT PROVIDER" + page + limit);
      const plants = await filterPlantsFromServer(token, type, page, limit);
      dispatch({type: FILTER_GOOD, payload: {plants}});
      return plants;
    } catch (error) {
      dispatch({type: FILTER_ERROR, payload: {error}});
      return null;
    }
  }

  function getPlantTypes(){
    let canceled = false;

    fetchPlantTypes();

    return () => {
      canceled = true;
    }

    async function fetchPlantTypes() {
      if(!token?.trim()){
        return;
      }
      try{
        const types = await fetchPlantTypesFromServer(token);
        console.log("TYPES" + types.toString());
        if(!canceled){
          dispatch({type: FETCH_TYPES, payload: {types} });
        }
      } catch(error){
        console.log("failed types")
        dispatch({type: FETCH_TYPES_ERROR, payload: error});
      }
    }
  }

  function getPlants(){
    console.log("GET PLANTS" + offline);
    let canceled = false;
    fetchPlants();

    return () => {
      canceled = true;
    }

    async function fetchPlants() {
      console.log("FETCH");
      if(!token?.trim()){
        return;
      }
      try{        
        if(offline == true){
          await fetchOffline();
          return;
        }
        console.log("fetch Items started");
        dispatch({type: FETCH_ITEMS_STARTED})
        const plants = await getPlantsFromServer(token);
        if(!canceled){
          dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {plants}});
          cachePlants(plants);
        }
        console.log(plants);
      } catch(error){
          if(error.message=="Network Error"){
            await fetchOffline();
            return;
          }
          if(!canceled){
            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {plants}});
          }
          console.log("EROARE MARE");
          console.log("failed");
          console.log(error);
          dispatch({type: FETCH_ITEMS_FAILED, payload: {error}});
      }
    }

  }

  function mergeWithServer(){
    if(offline == true){
      return;
    }
    console.log("START SYNC PLANTS");
    let canceled = false;
    syncPlants();

    return () => {
      canceled = true;
    }

    async function syncPlants() {
      console.log("SYNCING...");
      if(!token?.trim()){
        return;
      }
      try{
        let serverPlants = await getPlantsFromServer(token);
        dispatch({type: MERGE_SERVER_STARTED});
        await merge(serverPlants);
        dispatch({type: MERGE_SERVER_SUCCEEDED});
      } catch(error){
          if(!canceled){
            
          }
          dispatch({type: MERGE_SERVER_FAILED, payload: {error}});
      }
    }

  }

  async function savePlantCallback(plant: PlantProps) {
    try {
      console.log("OFF" + offline);
      dispatch({ type: SAVE_ITEM_STARTED });
      if(offline == true){
        await addOffline(plant);
        return;
      }
      const newPlant = await savePlantOnServer(token, plant);
      console.log(newPlant);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plant: newPlant } });
    } catch (error) {
      if(error.message=="Network Error"){
        await addOffline(plant);
        return;
      }
      console.log(error.status);
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function editPlantCallback(plant: PlantProps) {
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      if(offline == true){
        await editOffline(plant);
        return;
      }
      const updatedPlant = await editPlantOnServer(token, plant);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plant: updatedPlant } });
    } catch (error) {
      if(error.message=="Network Error"){
        await editOffline(plant);
        return;
      }
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function deletePlantCallback(_id: String){
    try {
      dispatch({ type: DELETE_ITEM_STARTED });
      if(offline == true){
        await deleteOffline(_id);
        return;
      }
      const deletedPlant = await deletePlantFromServer(token, _id);
      console.log(deletedPlant);
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { plant: deletedPlant } });
    } catch (error) {
      if(error.message=="Network Error"){
        await deleteOffline(_id);
        return;
      }
      dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    let closeWebSocket: () => void;
    if(token?.trim()){
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { event, payload:  item } = message;
        console.log(`ws message, item ${event}`);
        if (event === 'created') {
          dispatch({ type: SERVER_ITEM_INCOMING, payload: { item } });
        }
        else if(event === 'updated'){
          dispatch({type: SERVER_ITEM_UPDATED, payload: { item }});
        }
        else if(event === 'deleted'){
          dispatch({type: SERVER_ITEM_REMOVING, payload: { item }});
        }
      });
    }
    return () => {
      console.log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }

  async function fetchOffline() {
    try{
      console.log("FETCH OFFLINE PLANTS");
      let plants = await loadCachePlants();
      console.log(plants);
      plants = plants.filter(x => x !== undefined);
      dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: { plants }});
    }catch(err){
      console.log("ERROR LOADING CACHE PLANTS");
    }
  }
  
  async function addOffline(plant: PlantProps){
    console.log("ADD OFFLINE");
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const newPlant = await savePlantOnCache(plant);
      console.log(newPlant);
      dispatch({ type: SAVE_LOCAL_SUCCEEDED, payload: { plant: newPlant } });
    } catch (error) {
      console.log("ERROR ADDING ON");
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }
  
  async function editOffline(plant: PlantProps){
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const updatedPlant = await editPlantOnCache(plant);
      console.log(updatedPlant);
      dispatch({ type: EDIT_LOCAL_SUCCEEDED, payload: { plant: updatedPlant } });
    } catch (error) {
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }
  
  async function deleteOffline(_id: String){
    try {
      dispatch({ type: DELETE_ITEM_STARTED });
      const deletedPlant = await deletePlantFromCache(_id);
      console.log(deletedPlant);
      dispatch({ type: DELETE_LOCAL_SUCCEEDED, payload: { plant: deletedPlant } });
    } catch (error) {
      dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
    }
  }

  async function merge(serverPlants: PlantProps[]){
    if(plants != undefined){
      const localPlants = [...plants];
      localPlants?.forEach((plant) => {
        if(plant.loaded != undefined){
          let indexPlant = serverPlants.findIndex(it => it._id === plant._id);
          if(indexPlant === -1){
            delete plant.loaded;
            savePlantCallback(plant);
          }
          else{
            delete plant.loaded;
            editPlantCallback(plant);
          }
        }
      });
    }
  }
};


