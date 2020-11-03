import React, { useCallback } from 'react';
import { useEffect, useReducer, useState } from 'react';
import { deletePlantFromServer, editPlantOnServer, getPlantsFromServer, savePlantOnServer } from './PlantApi';
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
        return {...state, savingError: payload.error}
      case DELETE_ITEM_STARTED:
        return {...state, deleting: true};
      case DELETE_ITEM_SUCCEEDED:
        return {...state, plants: payload.plants, deleting: false}
      case DELETE_ITEM_FAILED:
        return {...state, deletingError: payload.error}
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

};
