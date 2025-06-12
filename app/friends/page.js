"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import styles from "./page.module.css";
import ProtectedRoute from "../_components/ProtectedRoute";

import FriendRequestsPage from "../friend-requests/page";

export default function FriendsPage() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mutuals, setMutuals] = useState({});

  const [sentRequests, setSentRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [isMoreOptionOpen, setIsMoreOptionOpen] = useState(null);
  const [whichTabIsOpen, setWhichTabIsOpen] = useState("all-friends");

  const fetchAll = useCallback(async () => {
    try {
      const resF = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/friends",
        {
          credentials: "include",
        }
      );
      if (!resF.ok) throw new Error(`Friends fetch failed (${resF.status})`);
      const { friends: fetchedFriends } = await resF.json();

      const resS = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/sent-requests",
        {
          credentials: "include",
        }
      );
      if (!resS.ok)
        throw new Error(`Sent-requests fetch failed (${resS.status})`);
      const { sentRequests } = await resS.json();

      const resA = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/all",
        {
          credentials: "include",
        }
      );
      if (!resA.ok) throw new Error(`All-users fetch failed (${resA.status})`);
      const { users } = await resA.json();

      setFriends(fetchedFriends);
      setSentRequests(sentRequests);

      setAllUsers(
        users.filter(
          (u) =>
            u._id !== user._id && !fetchedFriends.some((f) => f._id === u._id)
        )
      );
    } catch (err) {
      console.error("fetchAll error:", err);
      toast.error(`Could not load data: ${err.message}`);
    }
  }, [user?._id]);

  // 2) Call it on mount (and whenever user._id changes)
  useEffect(() => {
    if (user?._id) fetchAll();
  }, [user?._id, fetchAll]);

  const removeFriend = async (friendId) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/user/remove-friend/${friendId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Friend removed");
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
        const updatedMutuals = { ...mutuals };
        delete updatedMutuals[friendId];
        setMutuals(updatedMutuals);
      } else {
        toast.error(data.error || "Failed to remove friend");
      }
    } catch (err) {
      console.error("Remove friend error:", err);
      toast.error("Something went wrong");
    }
  };

  const fetchMutualFriends = async (friendId) => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/user/mutual-friends/${friendId}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMutuals((prev) => ({ ...prev, [friendId]: data.mutualFriends }));
      } else {
        toast.error(data.error || "Failed to fetch mutual friends");
      }
    } catch (err) {
      console.error("Error fetching mutuals:", err);
      toast.error("Could not load mutual friends.");
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className={styles.friendsPage}>
        <div className={styles.friendsPageContainer}>
          <div className={`${styles.card} card`}>
            <h3 className="heading-tertiary margin-bottom-lg">Friends</h3>
            <div className={styles.buttons}>
              <button
                key="all-friends"
                className={`${
                  whichTabIsOpen === "all-friends" ? styles.activeButton : null
                } just-flex`}
                onClick={() => setWhichTabIsOpen("all-friends")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  id="User-Multiple-Circle--Streamline-Sharp"
                  height={18}
                  width={18}
                >
                  <g id="user-multiple-circle--close-geometric-human-multiple-person-up-user-circle">
                    <path
                      id="Ellipse 350"
                      stroke="#000000"
                      d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 418"
                      stroke="#000000"
                      d="M3.6678191666666664 6.7325358333333325a2.0321320833333334 2.0321320833333334 0 1 0 4.064264166666667 0 2.0321320833333334 2.0321320833333334 0 1 0 -4.064264166666667 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 419"
                      stroke="#000000"
                      d="M9.884414166666666 8.468037083333334a1.7355012499999998 1.7355012499999998 0 1 0 3.4710024999999995 0 1.7355012499999998 1.7355012499999998 0 1 0 -3.4710024999999995 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 417"
                      stroke="#000000"
                      d="M9.074654166666667 15.200572916666665v-3.9124341666666664a8.095491249999998 8.095491249999998 0 0 0 -3.482952083333333 -0.7823462499999999c-1.24627125 0 -2.42717125 0.2811666666666667 -3.482952083333333 0.7823462499999999"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 420"
                      stroke="#000000"
                      d="M13.8544875 12.894303333333333c-0.8688049999999999 -0.3922275 -1.9273974999999999 -0.65160375 -2.943815 -0.65160375 -0.63473375 0 -1.2490829166666666 0.08505291666666666 -1.8339095833333332 0.24531791666666664"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>{" "}
                All friends
              </button>

              <button
                key="send-request"
                className={`${
                  whichTabIsOpen === "send-request" ? styles.activeButton : null
                } just-flex`}
                onClick={() => setWhichTabIsOpen("send-request")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  id="Following--Streamline-Sharp"
                  height={18}
                  width={18}
                >
                  <g id="following">
                    <path
                      id="Ellipse 442"
                      stroke="#000000"
                      d="M7.073450416666667 13.003958333333333H1.4058333333333333v-1.9681666666666664a12.24551125 12.24551125 0 0 1 5.9747916666666665 -1.5464166666666668c1.0937383333333333 0 2.1537366666666666 0.14269208333333333 3.163125 0.4105033333333333"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 350"
                      stroke="#000000"
                      d="M4.568958333333333 4.393229166666666a2.9873958333333333 2.9873958333333333 0 1 0 5.9747916666666665 0 2.9873958333333333 2.9873958333333333 0 1 0 -5.9747916666666665 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Vector"
                      stroke="#000000"
                      d="M15.464166666666666 13.003958333333333h-6.32625"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Vector 2988"
                      stroke="#000000"
                      d="m12.6525 10.192291666666666 2.8116666666666665 2.8116666666666665 -2.8116666666666665 2.8116666666666665"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>
                Send Requests
              </button>

              <button
                key="suggestions"
                className={`${
                  whichTabIsOpen === "suggestions" ? styles.activeButton : null
                } just-flex`}
                onClick={() => setWhichTabIsOpen("suggestions")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  id="User-Add-Plus--Streamline-Sharp"
                  height={18}
                  width={18}
                >
                  <g id="user-add-plus--actions-add-close-geometric-human-person-plus-single-up-user">
                    <path
                      id="Ellipse 442"
                      stroke="#000000"
                      d="M8.434999999999999 13.003958333333333H1.4058333333333333v-1.9681666666666664a12.24551125 12.24551125 0 0 1 5.9747916666666665 -1.5464166666666668c1.22096625 0 2.4011633333333333 0.17783791666666665 3.5145833333333334 0.5096145833333333"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 350"
                      stroke="#000000"
                      d="M4.568958333333333 4.393229166666666a2.9873958333333333 2.9873958333333333 0 1 0 5.9747916666666665 0 2.9873958333333333 2.9873958333333333 0 1 0 -5.9747916666666665 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Vector 1140"
                      stroke="#000000"
                      d="M16.167083333333334 13.003958333333333h-6.32625m3.163125 -3.163125v6.32625"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>{" "}
                Suggestions
              </button>

              <button
                key="people"
                className={`${
                  whichTabIsOpen === "people" ? styles.activeButton : null
                } just-flex`}
                onClick={() => setWhichTabIsOpen("people")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  id="Earth-2--Streamline-Sharp"
                  height={18}
                  width={18}
                >
                  <g id="earth-2--planet-earth-globe-world">
                    <path
                      id="Vector"
                      stroke="#000000"
                      d="M8.434999999999999 15.639895833333332c3.979140958333333 0 7.204895833333333 -3.225754875 7.204895833333333 -7.204895833333333 0 -3.9791550166666663 -3.225754875 -7.204895833333333 -7.204895833333333 -7.204895833333333C4.455844983333333 1.2301041666666666 1.2301041666666666 4.455844983333333 1.2301041666666666 8.434999999999999c0 3.979140958333333 3.2257408166666663 7.204895833333333 7.204895833333333 7.204895833333333Z"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Intersect"
                      stroke="#000000"
                      d="M14.099313375 3.9813621749999997H7.812215833333333l0 3.788046033333333 2.920126708333333 2.6355157499999997v4.865097124999999"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Intersect_2"
                      stroke="#000000"
                      d="m6.620743966666667 15.405473124999999 -0.00003514583333333333 -4.68943825 -5.021896745833334 0"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>{" "}
                People
              </button>
            </div>
          </div>

          <div className={styles.listContainer}>
            <div className={styles.searchBox}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Magnifying-Glass--Streamline-Sharp"
                height={18}
                width={18}
              >
                <desc>
                  {
                    "\n    Magnifying Glass Streamline Icon: https://streamlinehq.com\n  "
                  }
                </desc>
                <g id="magnifying-glass--glass-search-magnifying">
                  <path
                    id="Ellipse 44"
                    stroke="#000000"
                    d="M1.4058333333333333 7.732083333333333a6.32625 6.32625 0 1 0 12.6525 0 6.32625 6.32625 0 1 0 -12.6525 0"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Vector 195"
                    stroke="#000000"
                    d="M12.205445 12.205445 15.464166666666666 15.464166666666666"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>

              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                className="field"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {whichTabIsOpen === "all-friends" && (
              <>
                {filteredFriends.length === 0 ? (
                  <p>No friends found.</p>
                ) : (
                  <div className={`${styles.friendsGrid} grid grid--3-cols`}>
                    {filteredFriends.map((friend) => (
                      <div key={friend.name}>
                        <div className={styles.list}>
                          <img
                            src={friend.profilePic || "/profile.png"}
                            alt={friend.name}
                            className={styles.friendsImg}
                          />

                          <div className={`${styles.friendsInfo} just-flex`}>
                            <Link
                              href={`/profile/${friend._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <p className="paragraph-lg strong">
                                {friend.name}
                              </p>
                            </Link>
                            <button
                              onClick={() =>
                                setIsMoreOptionOpen((e) =>
                                  e === friend._id ? null : friend._id
                                )
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="-0.565 -0.565 18 18"
                                id="Horizontal-Menu-Square--Streamline-Sharp"
                                height={18}
                                width={18}
                              >
                                <g id="horizontal-menu-square--navigation-dots-three-square-button-horizontal-menu">
                                  <path
                                    id="Rectangle 893"
                                    stroke="#000000"
                                    d="M1.4058333333333333 1.4058333333333333h14.058333333333334v14.058333333333334H1.4058333333333333z"
                                    strokeWidth={1.13}
                                  />
                                  <path
                                    id="Vector 2975"
                                    stroke="#000000"
                                    d="M5.096145833333333 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                                    strokeWidth={1.13}
                                  />
                                  <path
                                    id="Vector 2976"
                                    stroke="#000000"
                                    d="M8.610729166666665 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                                    strokeWidth={1.13}
                                  />
                                  <path
                                    id="Vector 2977"
                                    stroke="#000000"
                                    d="M12.1253125 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                                    strokeWidth={1.13}
                                  />
                                </g>
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* <p className="paragraph-md mb-lg text-gray">
                        {friend.mutual} mutual friends
                      </p> */}

                        {isMoreOptionOpen === friend._id && (
                          <>
                            <button
                              onClick={() => removeFriend(friend._id)}
                              style={{
                                backgroundColor: "#f44336",
                                color: "white",
                                padding: "6px 12px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Remove
                            </button>
                          </>
                        )}

                        {/* <button
                      onClick={() => fetchMutualFriends(friend._id)}
                      style={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        marginTop: "4px",
                        background: "#2196f3",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      View mutual friends
                    </button>

                    {mutuals[friend._id] && mutuals[friend._id].length > 0 && (
                      <ul style={{ marginTop: "6px", paddingLeft: "16px" }}>
                        {mutuals[friend._id].map((m) => (
                          <li key={m._id} style={{ fontSize: "13px" }}>
                            {m.name}
                          </li>
                        ))}
                      </ul>
                    )}

                    {mutuals[friend._id] &&
                      mutuals[friend._id].length === 0 && (
                        <p style={{ fontSize: "13px", marginTop: "6px" }}>
                          No mutual friends.
                        </p>
                      )} */}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {whichTabIsOpen === "send-request" && (
              <>
                {sentRequests?.length === 0 ? (
                  <p>No outgoing friend requests.</p>
                ) : (
                  <div className={`${styles.friendsGrid} grid grid--3-cols`}>
                    {sentRequests.map((u, id) => (
                      <div key={id}>
                        <div
                          className={styles.list}
                          style={{ height: "27rem" }}
                        >
                          <img
                            src={u.profilePic || "/profile.png"}
                            alt={u.name}
                            className={styles.friendsImg}
                          />

                          <div className={`${styles.friendsInfo} just-flex`}>
                            <Link
                              href={`/profile/${u._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <p className="paragraph-lg strong">{u.name}</p>
                            </Link>
                          </div>

                          <div className={styles.actionButtons}>
                            <button
                              onClick={async () => {
                                await fetch(
                                  `https://massoudnet-backend.onrender.com/api/user/sent-requests/${u._id}`,
                                  {
                                    method: "DELETE",
                                    credentials: "include",
                                  }
                                );
                                // remove locally
                                setSentRequests((prev) =>
                                  prev.filter((x) => x._id !== u._id)
                                );
                                toast.success("Friend request canceled");
                              }}
                              className={styles.actionButton}
                            >
                              Cancle Request
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {whichTabIsOpen === "suggestions" && (
              <FriendRequestsPage onChange={fetchAll} />
            )}

            {whichTabIsOpen === "people" &&
              (allUsers?.length === 0 ? (
                <p className="paragraph-md">No users to show.</p>
              ) : (
                <div className={`${styles.friendsGrid} grid grid--3-cols`}>
                  {allUsers?.map((u) => (
                    <div key={u._id}>
                      <div className={styles.list} style={{ height: "27rem" }}>
                        <img
                          src={u.profilePic || "/profile.png"}
                          alt={u.name}
                          className={styles.friendsImg}
                        />

                        <div className={`${styles.friendsInfo} just-flex`}>
                          <Link
                            href={`/profile/${u._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <p className="paragraph-lg strong">{u.name}</p>
                          </Link>
                        </div>

                        <div className={styles.actionButtons}>
                          {sentRequests.some((r) => r._id === u._id) ? (
                            <button disabled className={styles.disabledButton}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="-0.565 -0.565 18 18"
                                id="Check--Streamline-Sharp"
                                height={14}
                                width={14}
                              >
                                <desc>
                                  {
                                    "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                                  }
                                </desc>
                                <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                                  <path
                                    id="Vector 2356"
                                    stroke="#aaa"
                                    d="m1.0543749999999998 8.786458333333332 4.920416666666666 4.920416666666666 9.840833333333332 -9.840833333333332"
                                    strokeWidth={1.13}
                                  />
                                </g>
                              </svg>{" "}
                              Request Sent
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await fetch(
                                  `https://massoudnet-backend.onrender.com/api/user/friend-request/${u._id}`,
                                  {
                                    method: "POST",
                                    credentials: "include",
                                  }
                                );
                                setSentRequests((prev) => [...prev, u]);
                                toast.success("Friend request sent");
                              }}
                              className={styles.actionButton}
                            >
                              Add Friend Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
