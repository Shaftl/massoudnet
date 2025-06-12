// import Image from "next/image";
// import styles from "./SideHeader.module.css";
// import Link from "next/link";
// import Button from "./Button";

// function SideHeader() {
//   const activeNavLink = "/";

//   return (
//     <div className={styles.sideHeader}>
//       <div className={styles.sideHeaderContainer}>
//         <div className="logo">
//           <Image src="/black-logo.png" alt="Logo" width={50} height={50} />
//         </div>

//         <nav className={styles.nav}>
//           <ul className={`${styles.navLinks}`}>
//             <li className={styles.navItem}>
//               <Link href="/" className={styles.navLink}>
//                 <Button active={true} after={true}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="-1.565 -1.565 50 50"
//                     id="Home-1--Streamline-Sharp"
//                     height={18}
//                     width={18}
//                   >
//                     <g id="home-1--home-house-roof-shelter">
//                       <path
//                         id="Vector 1"
//                         stroke={`${activeNavLink === "/" ? "#fff" : "#000"}`}
//                         d="M42.96416666666667 42.96416666666667H3.9058333333333337V21.482083333333335l19.52916666666667 -17.57625 19.52916666666667 17.57625v21.482083333333335Z"
//                         strokeWidth={3.13}
//                       />
//                     </g>
//                   </svg>
//                 </Button>
//               </Link>
//             </li>

//             <li className={styles.navItem}>
//               <Link href="/messages" className={styles.navLink}>
//                 <Button after={true}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="-1.565 -1.565 50 50"
//                     id="Chat-Bubble-Typing-Oval--Streamline-Sharp"
//                     height={18}
//                     width={18}
//                   >
//                     <g id="chat-bubble-typing-oval--messages-message-bubble-typing-chat">
//                       <path
//                         id="Ellipse 331"
//                         stroke="#000000"
//                         d="M23.435000000000002 42.96416666666667c10.78595875 0 19.52916666666667 -8.743207916666668 19.52916666666667 -19.52916666666667S34.22095875 3.9058333333333337 23.435000000000002 3.9058333333333337 3.9058333333333337 12.649041250000002 3.9058333333333337 23.435000000000002c0 4.712387916666667 1.66974375 9.036145416666667 4.448744166666667 12.410785416666668L3.9058333333333337 42.96416666666667l19.52916666666667 0Z"
//                         strokeWidth={3.13}
//                       />
//                       <path
//                         id="Rectangle 816"
//                         stroke="#000000"
//                         d="M13.918437083333334 22.70656208333334h1.4568758333333334v1.4568758333333334h-1.4568758333333334z"
//                         strokeWidth={3.13}
//                       />
//                       <path
//                         id="Rectangle 817"
//                         stroke="#000000"
//                         d="M22.70656208333334 22.70656208333334h1.4568758333333334v1.4568758333333334h-1.4568758333333334z"
//                         strokeWidth={3.13}
//                       />
//                       <path
//                         id="Rectangle 818"
//                         stroke="#000000"
//                         d="M31.494687083333336 22.70656208333334h1.4568758333333334v1.4568758333333334h-1.4568758333333334z"
//                         strokeWidth={3.13}
//                       />
//                     </g>
//                   </svg>
//                 </Button>
//               </Link>
//             </li>

//             <li className={styles.navItem}>
//               <Link href="/friends" className={styles.navLink}>
//                 <Button after={true}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="-0.625 -0.625 20 20"
//                     id="User-Multiple-Circle--Streamline-Sharp"
//                     height={18}
//                     width={18}
//                   >
//                     <g id="user-multiple-circle--close-geometric-human-multiple-person-up-user-circle">
//                       <path
//                         id="Ellipse 350"
//                         stroke="#000000"
//                         d="M1.5625 9.375a7.8125 7.8125 0 1 0 15.625 0 7.8125 7.8125 0 1 0 -15.625 0"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 418"
//                         stroke="#000000"
//                         d="M4.0765625 7.4828125a2.25859375 2.25859375 0 1 0 4.5171875 0 2.25859375 2.25859375 0 1 0 -4.5171875 0"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 419"
//                         stroke="#000000"
//                         d="M10.9859375 9.41171875a1.9289062499999998 1.9289062499999998 0 1 0 3.8578124999999996 0 1.9289062499999998 1.9289062499999998 0 1 0 -3.8578124999999996 0"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 417"
//                         stroke="#000000"
//                         d="M10.0859375 16.89453125v-4.3484375a8.99765625 8.99765625 0 0 0 -3.87109375 -0.86953125c-1.3851562499999999 0 -2.69765625 0.3125 -3.87109375 0.86953125"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 420"
//                         stroke="#000000"
//                         d="M15.3984375 14.33125c-0.965625 -0.43593750000000003 -2.1421875 -0.72421875 -3.2718749999999996 -0.72421875 -0.70546875 0 -1.38828125 0.09453125 -2.03828125 0.27265625"
//                         strokeWidth={1.25}
//                       />
//                     </g>
//                   </svg>
//                 </Button>
//               </Link>
//             </li>

//             <li className={styles.navItem}>
//               <Link href="/groups" className={styles.navLink}>
//                 <Button after={true}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="-0.625 -0.625 20 20"
//                     id="User-Collaborate-Group--Streamline-Sharp"
//                     height={18}
//                     width={18}
//                   >
//                     <g id="user-collaborate-group">
//                       <path
//                         id="Ellipse 366"
//                         stroke="#000000"
//                         d="M15.625 12.890625a1.953125 1.953125 0 1 1 -3.90625 0 1.953125 1.953125 0 0 1 3.90625 0Z"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 367"
//                         stroke="#000000"
//                         d="M10.546875 17.96875v-1.171875s1.171875 -0.78125 3.125 -0.78125 3.125 0.78125 3.125 0.78125V17.96875"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Vector 1165"
//                         stroke="#000000"
//                         d="M8.203125 15.625 3.90625 15.625l0 -4.296875"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Vector 1166"
//                         stroke="#000000"
//                         d="M14.84375 7.421875 14.84375 3.125l-4.296875 0"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 362"
//                         stroke="#000000"
//                         d="M7.03125 3.515625a1.953125 1.953125 0 1 1 -3.90625 0 1.953125 1.953125 0 0 1 3.90625 0Z"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 363"
//                         stroke="#000000"
//                         d="M1.953125 8.59375V7.421875s1.171875 -0.78125 3.125 -0.78125 3.125 0.78125 3.125 0.78125V8.59375"
//                         strokeWidth={1.25}
//                       />
//                     </g>
//                   </svg>
//                 </Button>
//               </Link>
//             </li>

//             <li className={styles.navItem}>
//               <Link href="/" className={styles.navLink}>
//                 <Button after={false}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="-0.625 -0.625 20 20"
//                     id="Story-Post--Streamline-Sharp"
//                     height={18}
//                     width={18}
//                   >
//                     <g id="story-post">
//                       <path
//                         id="Vector 1366"
//                         stroke="#000000"
//                         d="M9.375 5.859375v7.03125M5.859375 9.375h7.03125"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 445"
//                         stroke="#000000"
//                         d="M1.5625 9.375c0 4.31484375 3.4976562500000004 7.8125 7.8125 7.8125s7.8125 -3.4976562500000004 7.8125 -7.8125S13.68984375 1.5625 9.375 1.5625"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 446"
//                         stroke="#000000"
//                         d="M1.7187500000000002 7.8125c0.13203125000000002 -0.6484375 0.34375 -1.26796875 0.625 -1.8468749999999998"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 448"
//                         stroke="#000000"
//                         d="M4.6875 3.125a7.8578125 7.8578125 0 0 0 -1.5625 1.56171875"
//                         strokeWidth={1.25}
//                       />
//                       <path
//                         id="Ellipse 449"
//                         stroke="#000000"
//                         d="M7.8125 1.7187500000000002c-0.6484375 0.13125 -1.26796875 0.34375 -1.8468749999999998 0.625"
//                         strokeWidth={1.25}
//                       />
//                     </g>
//                   </svg>
//                 </Button>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         <div className={styles.customer}>
//           <Button after={true}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="-0.625 -0.625 20 20"
//               id="Customer-Support-1--Streamline-Sharp"
//               height={18}
//               width={18}
//             >
//               <g id="customer-support-1--customer-headset-help-microphone-phone-support">
//                 <path
//                   id="Rectangle 543"
//                   stroke="#000000"
//                   d="M1.5625 7.8125h3.125v4.6875H1.5625v-4.6875Z"
//                   strokeWidth={1.25}
//                 />
//                 <path
//                   id="Rectangle 544"
//                   stroke="#000000"
//                   d="M14.0625 7.8125h3.125v4.6875h-3.125v-4.6875Z"
//                   strokeWidth={1.25}
//                 />
//                 <path
//                   id="Vector 1276"
//                   stroke="#000000"
//                   d="M4.6875 7.8125V6.25a4.6875 4.6875 0 1 1 9.375 0v6.25a3.125 3.125 0 0 1 -3.125 3.125"
//                   strokeWidth={1.25}
//                 />
//                 <path
//                   id="Vector 1277"
//                   stroke="#000000"
//                   d="M10.9375 16.796875v-2.34375h-3.125v2.34375h3.125Z"
//                   strokeWidth={1.25}
//                 />
//               </g>
//             </svg>
//           </Button>
//           <Button after={false}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="-0.625 -0.625 20 20"
//               id="Logout-2--Streamline-Sharp"
//               height={18}
//               width={18}
//             >
//               <g id="logout-2--arrow-enter-right-logout-point-circle">
//                 <path
//                   id="Ellipse 378"
//                   stroke="#000000"
//                   d="M13.834374999999998 4.6875a7.03125 7.03125 0 1 0 0 9.375"
//                   strokeWidth={1.25}
//                 />
//                 <path
//                   id="Vector 1185"
//                   stroke="#000000"
//                   d="M17.1875 9.375H6.25"
//                   strokeWidth={1.25}
//                 />
//                 <path
//                   id="Vector 1186"
//                   stroke="#000000"
//                   d="m14.0625 6.25 3.125 3.125 -3.125 3.125"
//                   strokeWidth={1.25}
//                 />
//               </g>
//             </svg>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SideHeader;

"use client";

import Image from "next/image";
import styles from "./SideHeader.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";

import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import { openPopup } from "@/redux/storySlice";

export default function SideHeader() {
  const pathname = usePathname();

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("https://massoudnet-backend.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    dispatch(logout());
    router.push("/login");
  };

  const handleStoryClick = (e) => {
    e.preventDefault();
    dispatch(openPopup());
    router.push("/");
  };

  // Helper: true if href is exact or a parent of current pathname
  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className={styles.sideHeader}>
      <div className={styles.sideHeaderContainer}>
        {/* Logo */}
        <div className="logo">
          <Image src="/black-logo.png" alt="Logo" width={50} height={50} />
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navLinks}>
            {/* Home */}
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink}>
                <Button active={isActive("/")} after>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-1.565 -1.565 50 50"
                    height={18}
                    width={18}
                  >
                    <path
                      stroke={isActive("/") ? "#fff" : "#000"}
                      d="M42.964 42.964H3.906V21.482l19.529-17.576 19.529 17.576v21.482Z"
                      strokeWidth={3.13}
                    />
                  </svg>
                </Button>
              </Link>
            </li>

            {/* Messages */}
            <li className={styles.navItem}>
              <Link href="/messages" className={styles.navLink}>
                <Button active={isActive("/messages")} after>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-1.565 -1.565 50 50"
                    height={18}
                    width={18}
                  >
                    <path
                      stroke={isActive("/messages") ? "#fff" : "#000"}
                      d="M23.435 42.964c10.786 0 19.529-8.743 19.529-19.529S34.221 3.906 23.435 3.906 3.906 12.649 3.906 23.435c0 4.712 1.67 9.036 4.449 12.411L3.906 42.964l19.529 0Z"
                      strokeWidth={3.13}
                    />
                    <path
                      stroke={isActive("/messages") ? "#fff" : "#000"}
                      d="M13.918 22.707h1.457v1.457h-1.457z"
                      strokeWidth={3.13}
                    />
                    <path
                      stroke={isActive("/messages") ? "#fff" : "#000"}
                      d="M22.707 22.707h1.457v1.457h-1.457z"
                      strokeWidth={3.13}
                    />
                    <path
                      stroke={isActive("/messages") ? "#fff" : "#000"}
                      d="M31.495 22.707h1.457v1.457h-1.457z"
                      strokeWidth={3.13}
                    />
                  </svg>
                </Button>
              </Link>
            </li>

            {/* Friends */}
            <li className={styles.navItem}>
              <Link href="/friends" className={styles.navLink}>
                <Button active={isActive("/friends")} after>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.625 -0.625 20 20"
                    height={18}
                    width={18}
                  >
                    <path
                      stroke={isActive("/friends") ? "#fff" : "#000"}
                      d="M1.5625 9.375a7.8125 7.8125 0 1 0 15.625 0 7.8125 7.8125 0 1 0-15.625 0"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/friends") ? "#fff" : "#000"}
                      d="M4.0766 7.4828a2.2586 2.2586 0 1 0 4.5171 0 2.2586 2.2586 0 1 0-4.5171 0"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/friends") ? "#fff" : "#000"}
                      d="M10.9859 9.4117a1.9289 1.9289 0 1 0 3.8578 0 1.9289 1.9289 0 1 0-3.8578 0"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/friends") ? "#fff" : "#000"}
                      d="M10.0859 16.8945v-4.3484a8.9977 8.9977 0 0 0-3.8711-0.8695c-1.3852 0-2.6977 0.3125-3.8711 0.8695"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/friends") ? "#fff" : "#000"}
                      d="M15.3984 14.3313c-0.9656-0.4359-2.1422-0.7242-3.2719-0.7242-0.7055 0-1.3883 0.0945-2.0383 0.2727"
                      strokeWidth={1.25}
                    />
                  </svg>
                </Button>
              </Link>
            </li>

            {/* Groups */}
            <li className={styles.navItem}>
              <Link href="/groups" className={styles.navLink}>
                <Button active={isActive("/groups")} after>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.625 -0.625 20 20"
                    height={18}
                    width={18}
                  >
                    <path
                      stroke={isActive("/groups") ? "#fff" : "#000"}
                      d="M15.625 12.8906a1.9531 1.9531 0 1 1-3.9062 0 1.9531 1.9531 0 0 1 3.9062 0Z"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/groups") ? "#fff" : "#000"}
                      d="M10.5469 17.9688v-1.1719s1.1719-0.7813 3.125-0.7813 3.125 0.7813 3.125 0.7813V17.9688"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/groups") ? "#fff" : "#000"}
                      d="M8.2031 15.625H3.9063v-4.2969"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/groups") ? "#fff" : "#000"}
                      d="M14.8438 7.4219V3.125h-4.2969"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/groups") ? "#fff" : "#000"}
                      d="M7.0313 3.5156a1.9531 1.9531 0 1 1-3.9062 0 1.9531 1.9531 0 0 1 3.9062 0Z"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/groups") ? "#fff" : "#000"}
                      d="M1.9531 8.5938V7.4219s1.1719-0.7813 3.125-0.7813 3.125.7813 3.125.7813V8.5938"
                      strokeWidth={1.25}
                    />
                  </svg>
                </Button>
              </Link>
            </li>

            {/* Story/Post */}
            <li className={styles.navItem}>
              <Link
                href="/"
                className={styles.navLink}
                onClick={handleStoryClick}
              >
                <Button active={isActive("/story")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.625 -0.625 20 20"
                    height={18}
                    width={18}
                  >
                    <path
                      stroke={isActive("/story") ? "#fff" : "#000"}
                      d="M9.375 5.8594v7.0312M5.8594 9.375h7.0312"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/story") ? "#fff" : "#000"}
                      d="M1.5625 9.375c0 4.3148 3.4977 7.8125 7.8125 7.8125s7.8125-3.4977 7.8125-7.8125S13.6898 1.5625 9.375 1.5625"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/story") ? "#fff" : "#000"}
                      d="M1.7188 7.8125c0.132-0.6484 0.3438-1.268 0.625-1.8469"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/story") ? "#fff" : "#000"}
                      d="M4.6875 3.125a7.8578 7.8578 0 0 0-1.5625 1.5617"
                      strokeWidth={1.25}
                    />
                    <path
                      stroke={isActive("/story") ? "#fff" : "#000"}
                      d="M7.8125 1.7188c-0.6484 0.1313-1.268 0.3438-1.8469 0.625"
                      strokeWidth={1.25}
                    />
                  </svg>
                </Button>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Customer Support & Logout */}
        <div className={styles.customer}>
          <Link href="/help-support" className="nextLink">
            <Button active={isActive("/support")} after>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.625 -0.625 20 20"
                height={18}
                width={18}
              >
                <path
                  stroke={isActive("/support") ? "#fff" : "#000"}
                  d="M1.5625 7.8125h3.125v4.6875H1.5625v-4.6875Z"
                  strokeWidth={1.25}
                />
                <path
                  stroke={isActive("/support") ? "#fff" : "#000"}
                  d="M14.0625 7.8125h3.125v4.6875h-3.125v-4.6875Z"
                  strokeWidth={1.25}
                />
                <path
                  stroke={isActive("/support") ? "#fff" : "#000"}
                  d="M4.6875 7.8125V6.25a4.6875 4.6875 0 1 1 9.375 0v6.25a3.125 3.125 0 0 1-3.125 3.125"
                  strokeWidth={1.25}
                />
                <path
                  stroke={isActive("/support") ? "#fff" : "#000"}
                  d="M10.9375 16.7969v-2.3438h-3.125v2.3438h3.125Z"
                  strokeWidth={1.25}
                />
              </svg>
            </Button>
          </Link>

          <Button active={false} after={false} onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="-0.625 -0.625 20 20"
              height={18}
              width={18}
            >
              <path
                stroke="#000"
                d="M13.8344 4.6875a7.0313 7.0313 0 1 0 0 9.375"
                strokeWidth={1.25}
              />
              <path stroke="#000" d="M17.1875 9.375H6.25" strokeWidth={1.25} />
              <path
                stroke="#000"
                d="m14.0625 6.25 3.125 3.125-3.125 3.125"
                strokeWidth={1.25}
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
