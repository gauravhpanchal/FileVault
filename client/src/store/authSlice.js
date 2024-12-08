import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("authToken") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.token = localStorage.getItem("authToken");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = localStorage.removeItem("authToken");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
