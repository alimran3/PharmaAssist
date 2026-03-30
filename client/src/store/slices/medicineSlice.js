import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const searchMedicines = createAsyncThunk(
  'medicines/search',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/medicines/search', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchAutocomplete = createAsyncThunk(
  'medicines/autocomplete',
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/medicines/autocomplete', { params: { q: query } });
      return data.data.suggestions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Autocomplete failed');
    }
  }
);

export const browseMedicines = createAsyncThunk(
  'medicines/browse',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/inventory/browse', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Browse failed');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'medicines/categories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/medicines/categories');
      return data.data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load categories');
    }
  }
);

const medicineSlice = createSlice({
  name: 'medicines',
  initialState: {
    searchResults: [],
    browseResults: [],
    autocomplete: [],
    categories: [],
    pagination: null,
    loading: false,
    searchLoading: false,
    error: null,
  },
  reducers: {
    clearAutocomplete: (state) => {
      state.autocomplete = [];
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMedicines.pending, (state) => { state.searchLoading = true; })
      .addCase(searchMedicines.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.medicines;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchMedicines.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAutocomplete.fulfilled, (state, action) => {
        state.autocomplete = action.payload;
      })
      .addCase(browseMedicines.pending, (state) => { state.loading = true; })
      .addCase(browseMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.browseResults = action.payload.medicines;
        state.pagination = action.payload.pagination;
      })
      .addCase(browseMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearAutocomplete, clearSearch } = medicineSlice.actions;
export default medicineSlice.reducer;