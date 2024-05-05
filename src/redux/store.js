// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './actions'; // assuming your reducer is in 'reducers.js'

export const store = configureStore({
  reducer: {
    auth: authReducer // you can add more reducers as your app scales
  }
});
