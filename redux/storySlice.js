// redux/storySlice.js
import { createSlice } from "@reduxjs/toolkit";

const storySlice = createSlice({
  name: "story",
  initialState: { isOpen: false },
  reducers: {
    openPopup(state) {
      state.isOpen = true;
    },
    closePopup(state) {
      state.isOpen = false;
    },
  },
});

export const { openPopup, closePopup } = storySlice.actions;
export default storySlice.reducer;
