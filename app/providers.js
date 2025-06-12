"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import store from "../redux/store";
import { useEffect } from "react";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { setUser } from "../redux/authSlice";
import { addNotification } from "../redux/notificationSlice";
import { getSocket } from "../lib/socket";

import Header from "./_components/Header";
import SideHeader from "./_components/SideHeader";

function UserProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(
          "https://massoudnet-backend.onrender.com/api/auth/me",
          { credentials: "include" }
        );

        if (!res.ok) {
          dispatch(setUser(null));
          return;
        }

        const userData = await res.json();
        dispatch(setUser(userData));
      } catch (err) {
        console.error("Failed to load user", err);
        dispatch(setUser(null));
      }
    }

    loadUser();
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) {
      console.warn("Socket is undefined.");
      return;
    }

    socket.emit("setup", user._id);

    socket.on("sendNotification", (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.off("sendNotification");
    };
  }, [user, dispatch]);

  return <>{children}</>;
}

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <UserProvider>
        <div className="gridContainer">
          <SideHeader />
          <div className="main">
            <Header />
            <div>{children}</div>
          </div>
        </div>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="custom-toast"
          transition={Flip}
        />
      </UserProvider>
    </Provider>
  );
}
