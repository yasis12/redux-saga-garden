import React from 'react';
import ReactDOM from 'react-dom/client';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import App from './App';

// Saga Imports
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import {takeLatest, put} from 'redux-saga/effects';

// this startingPlantArray should eventually be removed
const startingPlantArray = [];

const plantList = (state = startingPlantArray, action) => {
  switch (action.type) {
    case 'ADD_PLANT':
      return [ ...state, action.payload ]
    case 'SET_PLANTS':
      // This will replace all exsisting plants
      return action.payload;
    default:
      return state;
  }
};

function* fetchPlants() {
  try{
   const response = yield axios.get('/api/plant');
   const action = {type:'SET_PLANTS', payload: response.data};
   // put is the same as dispatch
   yield put(action)
  } catch (error) {
    console.log(`Error in fetch plants ${error}`);
  }
}

function* sendPlantToSever (action) {
  try {
    yield axios.post('/api/plant', action.payload);
    yield put({ type: 'FETCH_PLANTS' });
  } catch {
    alert('Something went wrong')
    console.log(`Error in add plant: ${error}`);
    throw error;
  }
}

function* removePlant(action) {
  try {
    yield axios.delete(`/api/plant/${action.payload}`)
    yield put({ type: 'FETCH_PLANTS'});
  } catch {
    alert('something went wrong')
    console.log(`error in removePlant ${error}`);
    throw error;
  }
}

function* rootSaga() {
  //Setup all sagas
  yield takeLatest('FETCH_PLANTS', fetchPlants)
  yield takeLatest('SEND_PLANT_TO_SERVER', sendPlantToSever)
  yield takeLatest('REMOVE_PLANT', removePlant)
}



const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  combineReducers({ 
    plantList 
    }),
    applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(rootSaga)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);