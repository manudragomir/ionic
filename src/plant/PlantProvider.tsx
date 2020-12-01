import React, { useCallback, useContext } from 'react';
import { useEffect, useReducer, useState } from 'react';
import { cachePlants, loadCachePlants, deletePlantFromServer, editPlantOnServer, fetchPlantTypesFromServer, filterPlantsFromServer, getPlantsFromServer, newWebSocket, savePlantOnServer } from './PlantApi';
import { PlantProps } from './PlantProps'
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

  useEffect(getPlants, [token, offline]);
  useEffect(wsEffect, [token]);
  useEffect(getPlantTypes, [token]);

  const { plants, fetching, fetchingError, saving, savingError, deleting, refreshTypes, types  } = state;


  const addPlant = useCallback<SavePlantHeader>(savePlantCallback, [token]);
  const deletePlant = useCallback<DeletePlantHeader>(deletePlantCallback, [token]);
  const editPlant = useCallback<SavePlantHeader>(editPlantCallback, [token]);
  const filterPlants = useCallback<FilterPlantsHeader>(filterPlantsCallback, [token]);

  const sharedData = { plants, fetching, fetchingError, saving, savingError, deleting, addPlant, deletePlant, editPlant, filterPlants, types, refreshTypes }

  return (
    <PlantContext.Provider value={sharedData}>
      {children}
    </PlantContext.Provider>
  )


  async function filterPlantsCallback(type: string, page?: number, limit?: number) {
    try {
      console.log("PLANT PROVIDER" + page + limit);
      const plants = await filterPlantsFromServer(token, type, page, limit);
      return plants;
    } catch (error) {
      console.log("EROARE MARE");
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
      if(offline == true){
        try{
          let plants = await loadCachePlants();
          console.log(plants);
          plants = plants.filter(x => x !== undefined);
          dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {plants}});
        }catch(err){
          console.log("ERROR LOADING CACHE PLANTS");
        }
        return;
      }
      if(!token?.trim()){
        return;
      }
      try{
        console.log("fetch Items started");
        dispatch({type: FETCH_ITEMS_STARTED})
        const plants = await getPlantsFromServer(token);
        if(!canceled){
          dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {plants}});
          cachePlants(plants);
        }
        console.log(plants);
      } catch(error){
        let plants = await loadCachePlants();
          console.log("GATA IN EROARE");
          if(!canceled){
            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {plants}});
          }
        console.log("EROARE MARE");
        console.log("failed");
        console.log(error);
        dispatch({type: FETCH_ITEMS_FAILED, payload: {error}})
      }
    }

  }

  async function savePlantCallback(plant: PlantProps) {
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const newPlant = await savePlantOnServer(token, plant);
      console.log(newPlant);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plant: newPlant } });
    } catch (error) {
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function editPlantCallback(plant: PlantProps) {
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const updatedPlant = await editPlantOnServer(token, plant);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plant: updatedPlant } });
    } catch (error) {
      console.log("HEI");
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function deletePlantCallback(_id: String){
    try {
      dispatch({ type: DELETE_ITEM_STARTED });
      const deletedPlant = await deletePlantFromServer(token, _id);
      console.log(deletedPlant);
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { plant: deletedPlant } });
    } catch (error) {
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
};
