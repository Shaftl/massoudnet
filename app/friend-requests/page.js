"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "@/app/friends/page.module.css";
import ProtectedRoute from "../_components/ProtectedRoute";
import Link from "next/link";

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState([]);

  // Fetch pending friend requests
  const fetchRequests = async () => {
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/friend-requests",
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok) {
        setRequests(data);
      } else {
        toast.error(data.error || "Failed to fetch friend requests");
      }
    } catch (err) {
      toast.error("Network error while fetching requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Accept or decline a friend request
  const handleRespond = async (senderId, action) => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/user/respond-request/${senderId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }), // "accept" or "decline"
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(`Friend request ${action}ed`);
        setRequests((prev) => prev.filter((r) => r._id !== senderId));
        // Tell parent to re-fetch friends / allUsers / sentRequests
      } else {
        toast.error(data.error || "Failed to respond to request");
      }
    } catch (err) {
      toast.error("Network error while responding");
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ marginTop: "10px" }}>
        {requests.length > 0 ? (
          requests.map((user) => (
            <div key={user.name}>
              <div className={styles.list} style={{ height: "27rem" }}>
                <img
                  src={user.profilePic || "/profile.png"}
                  alt={user.name}
                  className={styles.friendsImg}
                />

                <div className={`${styles.friendsInfo} just-flex`}>
                  <Link
                    href={`/profile/${user._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <p className="paragraph-lg strong">{user.name}</p>
                  </Link>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleRespond(user._id, "accept")}
                    className={styles.actionButton}
                  >
                    Accept
                  </button>{" "}
                  <button
                    onClick={() => handleRespond(user._id, "decline")}
                    className={styles.actionButton}
                  >
                    Decline
                  </button>
                </div>
              </div>

              {/* <p className="paragraph-md mb-lg text-gray">
                        {friend.mutual} mutual friends
                      </p> */}
            </div>
          ))
        ) : (
          <p className="paragraph-md">No pending friend requests.</p>
        )}
      </div>
    </ProtectedRoute>
  );
}
