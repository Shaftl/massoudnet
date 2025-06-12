// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";
import followReducer from "./followSlice";
import groupReducer from "./groupSlice";
import storyReducer from "./storySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    notification: notificationReducer,
    follow: followReducer,
    group: groupReducer,
    story: storyReducer,
  },
});

export default store;
