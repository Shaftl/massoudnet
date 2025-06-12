// redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true, // ✅ NEW: track loading state
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false; // ✅ done loading
    },
    logout: (state) => {
      state.user = null;
      state.loading = false; // ✅ also done
    },
    setLoading: (state, action) => {
      state.loading = action.payload; // ✅ optional manual control
    },
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
