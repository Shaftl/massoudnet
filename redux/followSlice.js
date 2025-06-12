import { createSlice } from "@reduxjs/toolkit";

const followSlice = createSlice({
  name: "follow",
  initialState: {
    followers: [],
    following: [],
  },
  reducers: {
    setFollowers: (state, action) => {
      state.followers = action.payload;
    },
    setFollowing: (state, action) => {
      state.following = action.payload;
    },
  },
});

export const { setFollowers, setFollowing } = followSlice.actions;
export default followSlice.reducer;
