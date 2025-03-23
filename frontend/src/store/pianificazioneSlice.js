import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// URL base dell'API
const API_URL = process.env.REACT_APP_API_URL || '';

// Thunk per ottenere la pianificazione dei turni
export const fetchPianificazione = createAsyncThunk(
  'pianificazione/fetchPianificazione',
  async ({ dataInizio, dataFine }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/pianificazione-turni`, {
        params: { dataInizio, dataFine },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk per generare automaticamente i turni
export const generaTurni = createAsyncThunk(
  'pianificazione/generaTurni',
  async ({ dataInizio, dataFine, opzioni }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/scheduling/genera`, 
        { dataInizio, dataFine, opzioni },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk per aggiornare un turno
export const updateTurno = createAsyncThunk(
  'pianificazione/updateTurno',
  async ({ id, turnoData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/pianificazione-turni/${id}`, turnoData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk per esportare in Excel
export const esportaExcel = createAsyncThunk(
  'pianificazione/esportaExcel',
  async ({ dataInizio, dataFine }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/pianificazione-turni/export`, {
        params: { dataInizio, dataFine },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Crea un URL per il blob e avvia il download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pianificazione_turni_${dataInizio}_${dataFine}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice per la pianificazione
const pianificazioneSlice = createSlice({
  name: 'pianificazione',
  initialState: {
    turni: [],
    loading: false,
    generazioneInCorso: false,
    error: null,
    success: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch pianificazione
      .addCase(fetchPianificazione.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPianificazione.fulfilled, (state, action) => {
        state.loading = false;
        state.turni = action.payload;
      })
      .addCase(fetchPianificazione.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante il recupero della pianificazione';
      })
      
      // Genera turni
      .addCase(generaTurni.pending, (state) => {
        state.generazioneInCorso = true;
        state.error = null;
      })
      .addCase(generaTurni.fulfilled, (state, action) => {
        state.generazioneInCorso = false;
        state.turni = action.payload;
        state.success = 'Generazione turni completata con successo';
      })
      .addCase(generaTurni.rejected, (state, action) => {
        state.generazioneInCorso = false;
        state.error = action.payload?.message || 'Errore durante la generazione dei turni';
      })
      
      // Update turno
      .addCase(updateTurno.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTurno.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.turni.findIndex(turno => turno.id === action.payload.id);
        if (index !== -1) {
          state.turni[index] = action.payload;
        }
        state.success = 'Turno aggiornato con successo';
      })
      .addCase(updateTurno.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante l\'aggiornamento del turno';
      })
      
      // Esporta Excel
      .addCase(esportaExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(esportaExcel.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Esportazione completata con successo';
      })
      .addCase(esportaExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante l\'esportazione in Excel';
      });
  }
});

export const { clearError, clearSuccess } = pianificazioneSlice.actions;
export default pianificazioneSlice.reducer;
