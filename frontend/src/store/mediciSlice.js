import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// URL base dell'API
const API_URL = process.env.REACT_APP_API_URL || '';

// Thunk per ottenere tutti i medici
export const fetchMedici = createAsyncThunk(
  'medici/fetchMedici',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/medici`, {
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

// Thunk per creare un nuovo medico
export const createMedico = createAsyncThunk(
  'medici/createMedico',
  async (medicoData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/medici`, medicoData, {
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

// Thunk per aggiornare un medico
export const updateMedico = createAsyncThunk(
  'medici/updateMedico',
  async ({ id, medicoData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/medici/${id}`, medicoData, {
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

// Thunk per eliminare un medico
export const deleteMedico = createAsyncThunk(
  'medici/deleteMedico',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/medici/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice per i medici
const mediciSlice = createSlice({
  name: 'medici',
  initialState: {
    medici: [],
    loading: false,
    error: null,
    selectedMedico: null
  },
  reducers: {
    setSelectedMedico: (state, action) => {
      state.selectedMedico = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch medici
      .addCase(fetchMedici.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedici.fulfilled, (state, action) => {
        state.loading = false;
        state.medici = action.payload;
      })
      .addCase(fetchMedici.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante il recupero dei medici';
      })
      
      // Create medico
      .addCase(createMedico.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedico.fulfilled, (state, action) => {
        state.loading = false;
        state.medici.push(action.payload);
      })
      .addCase(createMedico.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante la creazione del medico';
      })
      
      // Update medico
      .addCase(updateMedico.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedico.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.medici.findIndex(medico => medico.id === action.payload.id);
        if (index !== -1) {
          state.medici[index] = action.payload;
        }
      })
      .addCase(updateMedico.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante l\'aggiornamento del medico';
      })
      
      // Delete medico
      .addCase(deleteMedico.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedico.fulfilled, (state, action) => {
        state.loading = false;
        state.medici = state.medici.filter(medico => medico.id !== action.payload);
      })
      .addCase(deleteMedico.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Errore durante l\'eliminazione del medico';
      });
  }
});

export const { setSelectedMedico, clearError } = mediciSlice.actions;
export default mediciSlice.reducer;
