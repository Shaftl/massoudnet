"use client";

import styles from "./Header.module.css";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { logout } from "@/redux/authSlice";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserPopOpen, setIsUserPopOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("https://massoudnet-backend.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    dispatch(logout());
    router.push("/login");
  };

  // Determine profile image
  const profileImgSrc =
    user?.profilePic && user.profilePic.trim() !== ""
      ? user.profilePic
      : "/userImg.webp";

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Search section */}
        <div className={styles.searchBar}>
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

          <SearchBar />
        </div>

        {/* User section */}
        <div className={`${styles.userInfo}`}>
          <NotificationBell />

          {/* User profile */}
          <div className={styles.userProfile}>
            <button
              className={styles.button}
              onClick={() => {
                setIsUserPopOpen(!isUserPopOpen);
                setIsNotifOpen(false);
              }}
            >
              <img
                src={profileImgSrc}
                alt="User Img"
                className={styles.userImg}
              />
            </button>

            {isUserPopOpen && (
              <div className={styles.userDropdown}>
                <button
                  className={styles.closeDropdown}
                  onClick={() => setIsUserPopOpen(false)}
                >
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
                </button>

                <Link
                  href="/profile/me"
                  onClick={() => setIsUserPopOpen(false)}
                  className={`${styles.userItem} just-flex ${styles.userItemFirst}`}
                  style={{ gap: "1.6rem" }}
                >
                  <img
                    src={profileImgSrc}
                    alt="User Img"
                    // className={styles.userImgSmall}
                    className={styles.userImg}
                  />
                  <p className="paragraph-lg" style={{ fontWeight: "400" }}>
                    {user?.name}
                  </p>
                </Link>

                <Link
                  href="/profile/settings"
                  onClick={() => setIsUserPopOpen(false)}
                  className={`${styles.userItem} just-flex`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Cog--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <desc>
                      {
                        "\n    Cog Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="cog--work-loading-cog-gear-settings-machine">
                      <path
                        id="Ellipse 404"
                        stroke="#000000"
                        d="M6.32625 8.434999999999999a2.1087499999999997 2.1087499999999997 0 1 0 4.217499999999999 0 2.1087499999999997 2.1087499999999997 0 1 0 -4.217499999999999 0"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 405"
                        stroke="#000000"
                        d="m10.192291666666666 1.4058333333333333 -3.5145833333333334 0 0 1.6855941666666667a5.61771 5.61771 0 0 0 -1.9899570833333333 1.1506745833333334l-1.4620666666666666 -0.8434999999999999 -1.7572916666666667 3.0436291666666664 1.460660833333333 0.8434999999999999a5.6472325 5.6472325 0 0 0 0 2.2985375l-1.4599579166666665 0.8434999999999999 1.7572916666666667 3.0436291666666664 1.46136375 -0.8434999999999999a5.61771 5.61771 0 0 0 1.9892541666666665 1.1506745833333334V15.464166666666666h3.5145833333333334l0 -1.6855941666666667a5.61771 5.61771 0 0 0 1.9906599999999999 -1.1506745833333334l1.4620666666666666 0.8434999999999999 1.7572916666666667 -3.0436291666666664 -1.460660833333333 -0.8434999999999999a5.650747083333333 5.650747083333333 0 0 0 0 -2.2985375l1.4599579166666665 -0.8434999999999999 -1.7572916666666667 -3.0436291666666664 -1.46136375 0.8434999999999999A5.61771 5.61771 0 0 0 10.192291666666666 3.0914274999999996V1.4058333333333333Z"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  <p className="paragraph-md">Settings & Privacy</p>
                </Link>

                <Link
                  href="/help-support"
                  onClick={() => setIsUserPopOpen(false)}
                  className={`${styles.userItem} just-flex`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Help-Chat-2--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <desc>
                      {
                        "\n    Help Chat 2 Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="help-chat-2--bubble-help-mark-message-query-question-speech-circle">
                      <path
                        id="Ellipse 331"
                        stroke="#000000"
                        d="M8.434999999999999 15.464166666666666c3.8822087499999998 0 7.029166666666667 -3.1469579166666666 7.029166666666667 -7.029166666666667S12.317208749999999 1.4058333333333333 8.434999999999999 1.4058333333333333 1.4058333333333333 4.55279125 1.4058333333333333 8.434999999999999c0 1.6961379166666664 0.60099375 3.2523954166666664 1.6012441666666666 4.467035416666667L1.4058333333333333 15.464166666666666l7.029166666666667 0Z"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 167"
                        stroke="#000000"
                        d="M6.2826691666666665 7.068529999999999V6.677708333333333a2.1087499999999997 2.1087499999999997 0 1 1 4.217499999999999 0v0.3908216666666667l-2.1087499999999997 1.8739758333333332 0 1.2497858333333334"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 166"
                        stroke="#000000"
                        d="m8.391419166666667 11.598125 0 1.0543749999999998"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  <p className="paragraph-md">Help & Support</p>
                </Link>

                <button
                  className={`${styles.userItem} just-flex`}
                  onClick={handleLogout}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Logout-2--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <desc>
                      {
                        "\n    Logout 2 Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="logout-2--arrow-enter-right-logout-point-circle">
                      <path
                        id="Ellipse 378"
                        stroke="#fff"
                        d="M12.44724833333333 4.217499999999999a6.32625 6.32625 0 1 0 0 8.434999999999999"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 1185"
                        stroke="#fff"
                        d="M15.464166666666666 8.434999999999999H5.623333333333333"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 1186"
                        stroke="#fff"
                        d="m12.6525 5.623333333333333 2.8116666666666665 2.8116666666666665 -2.8116666666666665 2.8116666666666665"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
