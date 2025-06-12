// redux/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unseenCount: 0,
  dropdownOpen: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unseenCount = action.payload.filter((n) => !n.seen).length;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unseenCount += 1;
    },
    markAllAsSeen: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        seen: true,
      }));
      state.unseenCount = 0;
    },
    toggleDropdown: (state, action) => {
      state.dropdownOpen = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAllAsSeen,
  toggleDropdown,
} = notificationSlice.actions;

export default notificationSlice.reducer;
