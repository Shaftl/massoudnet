"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import styles from "./page.module.css";
import { getSocket } from "@/lib/socket";
import Link from "next/link";
import ProtectedRoute from "@/app/_components/ProtectedRoute";
import PostId from "@/app/_components/PostId";
import SpinnerMini from "@/app/_components/SpinnerMini";

export default function OtherProfile() {
  const { id } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [whichTabIsOpen, setWhichTabIsOpen] = useState("post");

  const socket = getSocket();

  const canViewPrivate =
    profile &&
    (profile.profileVisibility === "public" ||
      currentUser._id === profile._id ||
      isFriend);

  useEffect(() => {
    if (!id || !currentUser?._id) return;

    // 1) Fetch profile and init isFriend
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/user/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403) {
            toast.error(data.error || "Access denied");
            setProfile("denied");
          } else {
            toast.error("Failed to load profile");
          }
          return;
        }

        setProfile(data);
        const friendIds = data.friends.map((f) => f._id);
        setIsFriend(friendIds.includes(currentUser._id));
      } catch {
        toast.error("Something went wrong");
      }
    };

    // 2) Fetch friends list
    const fetchFriends = async () => {
      try {
        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/user/friends/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (res.ok) setFriends(data.friends || []);
      } catch {
        toast.error("Couldn&apos;t load friends");
      }
    };

    // invoke those two:
    fetchProfile();
    fetchFriends();

    // 3) Fetch followers → set followerCount AND isFollowing
    (async () => {
      try {
        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/user/followers/${id}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error();
        const followers = await res.json(); // expecting array of { _id, … }
        setFollowerCount(followers.length);
        setIsFollowing(followers.some((f) => f._id === currentUser._id));
      } catch {
        toast.error("Couldn&apos;t load follower data");
      }
    })();

    // 4) Fetch friend-request status → set requestSent
    (async () => {
      try {
        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/user/friend-request/status/${id}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error();
        const { sent } = await res.json(); // expecting { sent: true/false }
        setRequestSent(sent);
      } catch {
        // fail silently; user can still click button
      }
    })();
  }, [id, currentUser?._id]);

  const handleSendFriendRequest = async () => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/user/friend-request/${id}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();

      if (res.ok) {
        setRequestSent(true);
        toast.success("Friend request sent!");
      } else if (res.status === 409) {
        // already sent
        setRequestSent(true);
        toast.info("Friend request pending");
      } else {
        throw new Error(data.error || "Failed to send request");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      const wasFollowing = isFollowing;
      const endpoint = wasFollowing ? "unfollow" : "follow";

      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/user/${endpoint}/${id}`,
        { method: "PUT", credentials: "include" }
      );
      if (!res.ok) throw new Error();

      // flip state & adjust count
      const nowFollowing = !wasFollowing;
      setIsFollowing(nowFollowing);
      setFollowerCount((n) => (nowFollowing ? n + 1 : n - 1));
      toast.success(nowFollowing ? "Followed" : "Unfollowed");
    } catch {
      toast.error("Network or server error");
    } finally {
      setFollowLoading(false);
    }
  };

  if (profile === "denied") {
    return (
      <ProtectedRoute>
        <div className={styles.privatePage}>
          <h1 className="heading-primary">This Profile is Private</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="60"
            fill="#000000"
            viewBox="0 0 256 256"
          >
            <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"></path>
          </svg>
          {isFriend ? (
            <button className={`${styles.frinedBtn} just-flex`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Check--Streamline-Sharp"
                height={18}
                width={18}
              >
                <desc>
                  {"\n    Check Streamline Icon: https://streamlinehq.com\n  "}
                </desc>
                <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                  <path
                    id="Vector 2356"
                    stroke="#000000"
                    d="m1.0543749999999998 8.786458333333332 4.920416666666666 4.920416666666666 9.840833333333332 -9.840833333333332"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>
              You are Friends
            </button>
          ) : requestSent ? (
            <button className={`${styles.frinedBtn} just-flex`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Following--Streamline-Sharp"
                height={18}
                width={18}
              >
                <desc>
                  {
                    "\n    Following Streamline Icon: https://streamlinehq.com\n  "
                  }
                </desc>
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
              Friend request sent
            </button>
          ) : (
            <button
              onClick={handleSendFriendRequest}
              style={{ marginLeft: "1rem" }}
              className={styles.friendRequest}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Following--Streamline-Sharp"
                height={18}
                width={18}
              >
                <desc>
                  {
                    "\n    Following Streamline Icon: https://streamlinehq.com\n  "
                  }
                </desc>
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
              Send Friend Request
            </button>
          )}
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile)
    return (
      <ProtectedRoute>
        <SpinnerMini />
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      <>
        <div className={styles.profile}>
          <div className="container">
            <div className={styles.coverPhoto}>
              <img
                src={profile?.coverImg ? profile?.coverImg : "/cover-image.jpg"}
                alt="Conver photo"
              />
            </div>
            <div className={styles.container}>
              <div className={`${styles.profileInfo} just-flex gap-2`}>
                <img
                  src={profile.profilePic || "/profile.png"}
                  alt={profile.name}
                  className={styles.profileImg}
                />

                <div>
                  <h3 className="heading-tertiary margin-bottom-sm">
                    {profile.name}
                  </h3>
                  <p className="paragraph-lg muted">
                    {profile.friends.length} Friends
                  </p>
                </div>
              </div>

              <div className={styles.list}>
                <button
                  className={`${
                    whichTabIsOpen === "post" ? styles.buttonActive : null
                  }`}
                  onClick={() => setWhichTabIsOpen("post")}
                >
                  Posts
                </button>
                <button
                  className={`${
                    whichTabIsOpen === "about" ? styles.buttonActive : null
                  }`}
                  onClick={() => setWhichTabIsOpen("about")}
                >
                  About
                </button>
                <button
                  className={`${
                    whichTabIsOpen === "friends" ? styles.buttonActive : null
                  }`}
                  onClick={() => setWhichTabIsOpen("friends")}
                >
                  Friends
                </button>

                {currentUser._id !== profile._id && (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={styles.followBtn}
                    >
                      {followLoading
                        ? "Processing..."
                        : isFollowing
                        ? "Unfollow"
                        : "Follow"}

                      <span>{followerCount}</span>
                    </button>

                    {isFriend ? (
                      <button className={`${styles.frinedBtn} just-flex`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="-0.565 -0.565 18 18"
                          id="Check--Streamline-Sharp"
                          height={18}
                          width={18}
                        >
                          <desc>
                            {
                              "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                            }
                          </desc>
                          <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                            <path
                              id="Vector 2356"
                              stroke="#000000"
                              d="m1.0543749999999998 8.786458333333332 4.920416666666666 4.920416666666666 9.840833333333332 -9.840833333333332"
                              strokeWidth={1.13}
                            />
                          </g>
                        </svg>
                        You are Friends
                      </button>
                    ) : requestSent ? (
                      <button className={`${styles.frinedBtn} just-flex`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="-0.565 -0.565 18 18"
                          id="Following--Streamline-Sharp"
                          height={18}
                          width={18}
                        >
                          <desc>
                            {
                              "\n    Following Streamline Icon: https://streamlinehq.com\n  "
                            }
                          </desc>
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
                        Friend request sent
                      </button>
                    ) : (
                      <button
                        onClick={handleSendFriendRequest}
                        style={{ marginLeft: "1rem" }}
                        className={styles.friendRequest}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="-0.565 -0.565 18 18"
                          id="Following--Streamline-Sharp"
                          height={18}
                          width={18}
                        >
                          <desc>
                            {
                              "\n    Following Streamline Icon: https://streamlinehq.com\n  "
                            }
                          </desc>
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
                        Send Friend Request
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className={styles.userProfileContent}>
                {canViewPrivate && (
                  <div>
                    {whichTabIsOpen === "post" && (
                      <div className={`${styles.card} card`}>
                        <p className="paragraph-xl strong margin-bottom-md">
                          Intro
                        </p>

                        <p
                          className="paragraph-lg margin-bottom-md"
                          style={{ lineHeight: "1.4" }}
                        >
                          {profile.bio}
                        </p>

                        <div>
                          <p className="paragraph-lg just-flex margin-bottom-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Eco-House--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <g id="eco-house">
                                <path
                                  id="Vector 2"
                                  stroke="#000000"
                                  d="M15.464166666666666 15.464166666666666H1.4058333333333333V7.732083333333333l7.029166666666667 -6.32625 7.029166666666667 6.32625v7.732083333333333Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2877"
                                  stroke="#000000"
                                  d="m8.962187499999999 6.161844820833332 -2.460208333333333 3.3285142624999997h3.5145833333333334l-2.460208333333333 3.3491870416666667"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>{" "}
                            Lives in{" "}
                            <span className="strong-sm">
                              {profile?.country}, {profile?.city}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {whichTabIsOpen === "about" && (
                      <div className={`${styles.card} card`}>
                        <p className="paragraph-xl strong margin-bottom-md">
                          About
                        </p>

                        <p
                          className="paragraph-lg margin-bottom-md"
                          style={{ lineHeight: "1.4" }}
                        >
                          {profile.bio}
                        </p>

                        <div>
                          <p className="paragraph-lg just-flex margin-bottom-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Mail-Send-Envelope--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <desc>
                                {
                                  "\n    Mail Send Envelope Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="mail-send-envelope--envelope-email-message-unopened-sealed-close">
                                <path
                                  id="Rectangle 846"
                                  stroke="#000000"
                                  d="M1.4058333333333333 2.8116666666666665h14.058333333333334v11.246666666666666H1.4058333333333333z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2539"
                                  stroke="#000000"
                                  d="m1.4058333333333333 4.920416666666666 7.029166666666667 4.217499999999999 7.029166666666667 -4.217499999999999"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                            Email
                            <span className="strong-sm">{profile.email}</span>
                          </p>
                          <p className="paragraph-lg just-flex margin-bottom-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Attribution--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <desc>
                                {
                                  "\n    Attribution Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="attribution">
                                <path
                                  id="Ellipse 570"
                                  stroke="#000000"
                                  d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Ellipse 572"
                                  stroke="#000000"
                                  d="M7.029166666666667 4.920416666666666a1.4058333333333333 1.4058333333333333 0 1 0 2.8116666666666665 0 1.4058333333333333 1.4058333333333333 0 1 0 -2.8116666666666665 0"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Ellipse 573"
                                  stroke="#000000"
                                  d="M7.029166666666667 13.706875v-2.8116666666666665H6.32625v-2.5988937916666663C6.946588016666666 7.937475583333333 7.6667823749999995 7.732083333333333 8.434999999999999 7.732083333333333s1.4884260416666668 0.20539225 2.1087499999999997 0.5642312083333333V10.895208333333333h-0.7029166666666666v2.8116666666666665"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                            Gender
                            <span className="strong-sm">{profile.gender}</span>
                          </p>

                          <p className="paragraph-lg just-flex margin-bottom-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Cake--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <desc>
                                {
                                  "\n    Cake Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="cake--candle-birthday-event-special-sweet-cake-bake">
                                <path
                                  id="Rectangle 33"
                                  stroke="#000000"
                                  d="M1.4058333333333333 7.029166666666667h14.058333333333334v8.434999999999999H1.4058333333333333z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Ellipse 595"
                                  stroke="#000000"
                                  d="M1.4058333333333333 9.137916666666666a2.34282125 2.34282125 0 0 0 4.686345416666667 0 2.34282125 2.34282125 0 0 0 4.6856425 0A2.34282125 2.34282125 0 0 0 15.464166666666666 9.137916666666666"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  d="M4.045285416666666 4.757339999999999c0.6811262499999999 0 1.2336187499999998 -0.5524924999999999 1.2336187499999998 -1.2336187499999998L4.045285416666666 1.7572916666666667 2.8116666666666665 3.52372125c0 0.6818291666666666 0.5524924999999999 1.2336187499999998 1.2336187499999998 1.2336187499999998Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector_2"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  d="M8.434999999999999 4.757339999999999c0.6811262499999999 0 1.2336187499999998 -0.5524924999999999 1.2336187499999998 -1.2336187499999998L8.434999999999999 1.7572916666666667l-1.2336187499999998 1.7664295833333332c0 0.6818291666666666 0.5524924999999999 1.2336187499999998 1.2336187499999998 1.2336187499999998Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector_3"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  d="M12.83174375 4.757339999999999c0.6811262499999999 0 1.2336187499999998 -0.5524924999999999 1.2336187499999998 -1.2336187499999998L12.83174375 1.7572916666666667 11.598125 3.52372125c0 0.6818291666666666 0.5524924999999999 1.2336187499999998 1.2336187499999998 1.2336187499999998Z"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                            Birthday
                            <span className="strong-sm">{profile.dob}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {whichTabIsOpen === "friends" && (
                      <div className={`${styles.card} card`}>
                        <p className="paragraph-xl strong margin-bottom-md">
                          Friends
                        </p>

                        {friends.length === 0 ? (
                          <p className="paragraph-lg just-flex margin-bottom-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Elipse-Frame--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <desc>
                                {
                                  "\n    Elipse Frame Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="elipse-frame">
                                <path
                                  id="Ellipse 575"
                                  stroke="#000000"
                                  d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 1859"
                                  stroke="#000000"
                                  d="m3.5145833333333334 3.5145833333333334 9.840833333333332 9.840833333333332"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 1860"
                                  stroke="#000000"
                                  d="M3.5145833333333334 13.355416666666667 13.355416666666667 3.5145833333333334"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                            No friends found.
                          </p>
                        ) : (
                          <div
                            className={`${styles.friendsGrid} grid grid--3-cols`}
                          >
                            {friends.map((friend) => (
                              <div
                                key={friend._id}
                                className={`${styles.card} border-box`}
                              >
                                <Link href={`/profile/${friend._id}`}>
                                  <img
                                    src={friend.profilePic || "/profile.png"}
                                    alt={friend.name}
                                    className={styles.avatar}
                                  />
                                  <h3 className="heading-tertiary mb-sm">
                                    {friend.name}
                                  </h3>
                                  <p className="paragraph-md mb-lg text-gray">
                                    {friend.mutual} mutual friends
                                  </p>
                                </Link>
                                <div className={styles.actions}>
                                  <Link href="/messages">
                                    <button className="btn">Message</button>
                                  </Link>
                                  <button className="btn">More</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  {canViewPrivate ? (
                    <>
                      {whichTabIsOpen === "post" && (
                        <div className={styles.feed}>
                          <PostId />
                        </div>
                      )}
                    </>
                  ) : (
                    <p>This user&apos;s posts are private.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}
