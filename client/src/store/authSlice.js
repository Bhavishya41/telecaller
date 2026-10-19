import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
let user = null;
try {
    user = JSON.parse(localStorage.getItem('user'));
} catch {
    user = null;
}

const initialState = {
    token,
    user,
    role: user?.role || 'staff',
    isAuthenticated: Boolean(token),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.role = user?.role || 'staff';
            state.isAuthenticated = true;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = 'staff';
            state.isAuthenticated = false;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;