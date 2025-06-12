"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import store from "../redux/store";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import { setUser } from "../redux/authSlice";
import { addNotification } from "../redux/notificationSlice";
import { getSocket } from "../lib/socket";

import Header from "./_components/Header";
import SideHeader from "./_components/SideHeader";
import "./globals.css";

function UserProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(
          "https://massoudnet-backend.onrender.com/api/auth/me",
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          dispatch(setUser(null)); // ✅ still update state!
          return;
        }

        const userData = await res.json();
        dispatch(setUser(userData)); // ✅ sets user + loading: false
      } catch (err) {
        console.error("Failed to load user", err);
        dispatch(setUser(null)); // ✅ sets loading: false
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/emoji-picker-react/dist/universal/style.css"
        />
      </head>

      <body>
        <Provider store={store}>
          <UserProvider>
            <div className="gridContainer">
              <SideHeader />

              <div className="main">
                <Header />
                <div>{children}</div>
              </div>
            </div>
          </UserProvider>

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
            transition={Flip} // or Zoom, Flip, Bounce
          />
        </Provider>
      </body>
    </html>
  );
}
