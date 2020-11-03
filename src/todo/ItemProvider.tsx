import React, { useCallback } from 'react';
import { useEffect, useReducer, useState } from 'react';
import { deletePlantFromServer, editPlantOnServer, getPlantsFromServer, newWebSocket, savePlantOnServer } from './PlantApi';
import { PlantProps } from './PlantProps'
import PropTypes from 'prop-types';

type SavePlantHeader = (plant: PlantProps) => Promise<any>
type DeletePlantHeader = (id: String) => Promise<any>

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
  editPlant?: SavePlantHeader
};

const initialState: PlantsState = {
  plants: undefined,

  fetching: false,
  saving: false,
  deleting: false,

  fetchingError: undefined,
  savingError: undefined,
  deletingError: undefined,
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
      case SAVE_ITEM_SUCCEEDED:
        return {...state, plants: payload.plants, saving: false}
      case SAVE_ITEM_FAILED:
        return {...state, savingError: payload.error, saving: false}
      case DELETE_ITEM_STARTED:
        return {...state, deleting: true};
      case DELETE_ITEM_SUCCEEDED:
        return {...state, plants: payload.plants, deleting: false}
      case DELETE_ITEM_FAILED:
        return {...state, deletingError: payload.error, deleting: false}
      case SERVER_ITEM_REMOVING:{
        const plants = [...(state.plants || [])];
        const plantRemoved = payload.item;
        let indexPlant = plants.findIndex(it => it.id === plantRemoved.id);
        if(indexPlant === -1){
          return state;
        }
        plants.splice(indexPlant, 1);
        return {...state, plants}
      }
      case SERVER_ITEM_INCOMING:{
        const plants = [...(state.plants || [])];
        const plantAdded = payload.item;
        let indexPlant = plants.findIndex(it => it.id === plantAdded.id);
        if(indexPlant !== -1){
          return state;
        }
        plants.push(plantAdded);
        return {...state, plants}
      }
      case SERVER_ITEM_UPDATED:{
        const plants = [...(state.plants || [])];
        const plantUpdated = payload.item;
        let indexPlant = plants.findIndex(it => it.id === plantUpdated.id);
        if(indexPlant === -1){
          return state;
        }
        plants[indexPlant] = plantUpdated;
        return {...state, plants}
      }
        
      default:
        return state;
    }
};

export const ItemContext = React.createContext<PlantsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ( {children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(getPlants, [])
  useEffect(wsEffect, []);

  const { plants, fetching, fetchingError, saving, savingError, deleting } = state;

  const addPlant = useCallback<SavePlantHeader>(savePlantCallback, []);
  const deletePlant = useCallback<DeletePlantHeader>(deletePlantCallback, []);
  const editPlant = useCallback<SavePlantHeader>(editPlantCallback, []);

  const sharedData = { plants, fetching, fetchingError, saving, savingError, deleting, addPlant, deletePlant, editPlant }

  return (
    <ItemContext.Provider value={sharedData}>
      {children}
    </ItemContext.Provider>
  )


  function getPlants(){
    let canceled = false;

    fetchPlants();

    return () => {
      canceled = true;
    }

    async function fetchPlants() {
      try{
        console.log("fetch Items started");
        dispatch({type: FETCH_ITEMS_STARTED})
        const plants = await getPlantsFromServer();
        if(!canceled){
          dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {plants}})
        }
      } catch(error){
        console.log("failed")
        dispatch({type: FETCH_ITEMS_FAILED, payload: {error}})
      }
    }

  }

  async function savePlantCallback(plant: PlantProps) {
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const updatedPlants = await savePlantOnServer(plant);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plants: updatedPlants } });
    } catch (error) {
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function editPlantCallback(plant: PlantProps) {
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const updatedPlants = await editPlantOnServer(plant);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plants: updatedPlants } });
    } catch (error) {
      console.log("HEI");
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function deletePlantCallback(id: String){
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const updatedPlants = await deletePlantFromServer(id);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { plants: updatedPlants } });
    } catch (error) {
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { item }} = message;
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
    return () => {
      console.log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }

};
