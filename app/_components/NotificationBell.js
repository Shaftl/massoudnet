"use client";

import { useEffect, useRef } from "react";
import styles from "./NotificationBell.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setNotifications,
  toggleDropdown,
  markAllAsSeen,
  addNotification,
} from "@/redux/notificationSlice";
import { getSocket } from "@/lib/socket";
import Link from "next/link";

function NotificationBell() {
  const dispatch = useDispatch();
  const { unseenCount, notifications, dropdownOpen } = useSelector(
    (state) => state.notification
  );
  const user = useSelector((state) => state.auth.user); // ✅ Get user from auth
  const socket = getSocket();
  const listenerAttached = useRef(false);

  useEffect(() => {
    if (!user) return; // ✅ Don't fetch notifications if no user is logged in

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          "https://massoudnet-backend.onrender.com/api/notifications",
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        dispatch(setNotifications(data));
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();

    // ✅ Prevent multiple listeners
    if (socket && !listenerAttached.current) {
      socket?.on("getNotification", (notif) => {
        const isDuplicate = notifications.some(
          (n) =>
            n._id === notif._id ||
            (n.senderId?._id === notif.senderId?._id &&
              n.type === notif.type &&
              n.postId === notif.postId)
        );
        if (!isDuplicate) {
          dispatch(addNotification(notif));
        }
      });

      listenerAttached.current = true;
    }

    return () => {
      socket?.off("receiveNotification");
    };
  }, [socket, dispatch, notifications, user]); // ✅ Add `user` to deps

  const handleToggle = () => {
    const willOpen = !dropdownOpen;
    dispatch(toggleDropdown(willOpen));

    if (willOpen && unseenCount > 0) {
      dispatch(markAllAsSeen());
      fetch(
        "https://massoudnet-backend.onrender.com/api/notifications/mark-all-seen",
        {
          method: "PUT",
          credentials: "include",
        }
      );
    }
  };

  const getNotificationLink = (notif) => {
    if (notif.type === "follow") return `/profile/${notif.senderId._id}`;
    if (notif.type === "like" || notif.type === "comment")
      return `/post/${notif.postId}`;
    return "#";
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleToggle}
        className={`${styles.bellButton}  ${styles.button}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="-0.565 -0.565 18 18"
          id="Bell-Notification--Streamline-Sharp"
          height={18}
          width={18}
        >
          <desc>
            {
              "\n    Bell Notification Streamline Icon: https://streamlinehq.com\n  "
            }
          </desc>
          <g id="bell-notification--alert-bell-ring-notification-alarm">
            <path
              id="Vector 2344"
              stroke="#000000"
              d="M3.5145833333333334 6.32625v3.5145833333333334l-1.4058333333333333 2.8116666666666665h12.6525l-1.4058333333333333 -2.8116666666666665V6.32625A4.920416666666666 4.920416666666666 0 1 0 3.5145833333333334 6.32625Z"
              strokeWidth={1.13}
            />
            <path
              id="Vector 2345"
              stroke="#000000"
              d="M7.029166666666667 15.464166666666666h2.8116666666666665"
              strokeWidth={1.13}
            />
          </g>
        </svg>
        {unseenCount > 0 && <span className={styles.badge}>{unseenCount}</span>}
      </button>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          {notifications.length === 0 ? (
            <p className={styles.empty}>No notifications</p>
          ) : (
            notifications.map((n, i) => (
              <Link
                key={n._id || i}
                href={getNotificationLink(n)}
                className={`${styles.item} just-flex`}
              >
                <img
                  src={n.senderId?.profilePic}
                  alt="Notification User Img"
                  className={styles.userImg}
                />
                <p className="paragraph-md">
                  <strong>{n.senderId?.name}</strong>{" "}
                  {n.type === "like"
                    ? "liked your post"
                    : n.type === "comment"
                    ? "commented on your post"
                    : "followed you"}
                </p>

                {!n.seen && <span className={styles.new}>🆕</span>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
