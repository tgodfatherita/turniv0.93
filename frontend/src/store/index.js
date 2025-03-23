import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import mediciReducer from './mediciSlice';
import pianificazioneReducer from './pianificazioneSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    medici: mediciReducer,
    pianificazione: pianificazioneReducer
  }
});
