"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./UserProfileCard.module.css";
import SpinnerMini from "./SpinnerMini";

function UserProfileCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    setIsMounted(true);

    const fetchPostCount = async () => {
      try {
        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/posts/count/${user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        setPostCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch post count:", err);
      }
    };

    const fetchFollowerCount = async () => {
      try {
        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/user/followers/${user._id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setFollowerCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch follower count:", err);
      }
    };

    if (user?._id) {
      fetchPostCount();
      fetchFollowerCount(); // ✅ Moved inside useEffect
    }
  }, [user]);

  if (!isMounted) return <SpinnerMini />;

  return (
    <div className={`card ${styles.UserProfileCard}`}>
      {user ? (
        <>
          <div className={styles.userProfileImg}>
            <img
              src={user.profilePic || "/profile.png"}
              alt="Profile Pic"
              width={50}
            />
          </div>

          <div>
            <h3 className="heading-tertiary margin-bottom-sm">{user.name}</h3>

            <p className="paragraph-lg just-flex muted">
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
              </svg>

              <span>
                {user?.country}, {user?.city}
              </span>
            </p>
          </div>

          <div className={`grid grid--3-cols ${styles.userInfoContainer}`}>
            <div className={styles.userInfo}>
              <p className="paragraph-md margin-bottom-sem">Followers</p>
              <p className="paragraph-lg">{followerCount}</p>
            </div>

            <div className={styles.userInfo}>
              <p className="paragraph-md margin-bottom-sem">Friends</p>
              <p className="paragraph-lg">{user.friends?.length}</p>
            </div>

            <div className={styles.userInfo}>
              <p className="paragraph-md margin-bottom-sem">Posts</p>
              <p className="paragraph-lg">{postCount}</p>
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default UserProfileCard;
