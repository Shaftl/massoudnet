// redux/groupSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setGroups(state, action) {
      state.groups = action.payload;
    },
    setCurrentGroup(state, action) {
      state.currentGroup = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    resetGroupState(state) {
      state.groups = [];
      state.currentGroup = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setGroups,
  setCurrentGroup,
  setLoading,
  setError,
  resetGroupState,
} = groupSlice.actions;

export default groupSlice.reducer;
