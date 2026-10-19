import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

// Async thunk to fetch businesses with dynamic query params
export const fetchBusinesses = createAsyncThunk(
    'businesses/fetchBusinesses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await api.getBusinesses(params);
            return data;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch businesses');
        }
    }
);

const businessSlice = createSlice({
    name: 'businesses',
    initialState: {
        items: [],
        loading: false,
        error: null,
        filter: 'All',
        searchQuery: '',
    },
    reducers: {
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        updateBusinessLocally: (state, action) => {
            const index = state.items.findIndex((item) => item._id === action.payload._id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinesses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinesses.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBusinesses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilter, setSearchQuery, updateBusinessLocally } = businessSlice.actions;
export default businessSlice.reducer;