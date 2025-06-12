"use client";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/authSlice";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import Link from "next/link";
import { toast } from "react-toastify";

import styles from "./page.module.css";
import ProtectedRoute from "@/app/_components/ProtectedRoute";

import CreatePost from "@/app/_components/CreatePost";
import PostMe from "@/app/_components/PostMe";

import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";

export default function MyProfile() {
  // ── Hydration guard ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // ─────────────────────
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [userPosts, setUserPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [whichTabIsOpen, setWhichTabIsOpen] = useState("post");

  const [form, setForm] = useState({ profilePic: user?.profilePic });

  // — cropping state
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // — cover-photo state & ref
  const [coverSrc, setCoverSrc] = useState(user?.coverImg || "");
  const [coverFile, setCoverFile] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef(null);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const socket = getSocket();

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (user?._id) {
      fetchFriends();
    }
  }, [user?._id]);

  const fetchFriends = async () => {
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/friends",
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in again");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch friends");
      }
      const data = await res.json();
      setFriends(data.friends);
      console.log("Alyas khan massoudi");
    } catch {
      toast.error("Could not load friends.");
    }
  };

  useEffect(() => {
    if (coverFile) {
      (async () => {
        setCoverUploading(true);
        try {
          // 1) upload to Cloudinary
          const formData = new FormData();
          formData.append("file", coverFile);
          formData.append("upload_preset", "massoudnetv2");
          const cloudRes = await fetch(
            "https://api.cloudinary.com/v1_1/dhljprc8i/image/upload",
            { method: "POST", body: formData }
          );
          const { secure_url } = await cloudRes.json();
          // 2) persist to your backend
          await fetch(
            "https://massoudnet-backend.onrender.com/api/user/cover",
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ coverImg: secure_url }),
            }
          );
          // 3) update UI + Redux
          setCoverSrc(secure_url);
          dispatch(setUser({ ...user, coverImg: secure_url }));
          toast.success("Cover updated!");
        } catch {
          toast.error("Cover upload failed");
        } finally {
          setCoverUploading(false);
        }
      })();
    }
  }, [coverFile]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // cancel cropping
  const cancelCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
  };

  // when user confirms crop, upload the cropped image
  const uploadCroppedImage = async () => {
    try {
      setIsUploadingImage(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", croppedFile);
      formData.append("upload_preset", "massoudnetv2");

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      });
      xhr.onreadystatechange = async () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
          const { secure_url } = JSON.parse(xhr.responseText);
          setForm({ profilePic: secure_url });
          dispatch(setUser({ ...user, profilePic: secure_url }));
          await fetch(
            "https://massoudnet-backend.onrender.com/api/user/update",
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ profilePic: secure_url }),
            }
          );
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Upload failed");
        }
        setIsUploadingImage(false);
        setUploadProgress(0);
        setShowCropModal(false);
      };
      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/dhljprc8i/image/upload"
      );
      xhr.send(formData);
    } catch {
      toast.error("Crop or upload failed");
      setIsUploadingImage(false);
    }
  };

  if (!mounted) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <>
        {user ? (
          <div className={styles.profile}>
            <div className="container">
              <div className={styles.coverPhoto}>
                {/* 2) show current cover or fallback */}
                <img
                  src={user?.coverImg ? user?.coverImg : "/cover-image.jpg"}
                  alt="Cover photo"
                  className={styles.coverImg}
                />
                {/* 3) hidden file input */}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setCoverFile(e.target.files[0] || null)}
                />
                {/* 4) trigger picker */}
                <button
                  disabled={coverUploading}
                  onClick={() => coverInputRef.current?.click()}
                  className={`${styles.changeCoverBtn} just-flex`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Camera-Setting-Pin--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <desc>
                      {
                        "\n    Camera Setting Pin Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="camera-setting-pin--photos-camera-map-photography-pictures-maps-settings-pin-photo">
                      <path
                        id="Vector 2904"
                        stroke="#000000"
                        d="M1.4058333333333333 11.949583333333333V4.217499999999999h2.460208333333333L5.623333333333333 1.4058333333333333h5.623333333333333l1.7572916666666667 2.8116666666666665H15.464166666666666v7.732083333333333h-4.568958333333333L8.434999999999999 15.112708333333332 5.9747916666666665 11.949583333333333H1.4058333333333333Z"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 4"
                        stroke="#000000"
                        d="M5.9747916666666665 7.380624999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>

                  {coverUploading ? "Uploading…" : "Change Cover"}
                </button>
              </div>

              <div className={styles.container}>
                <div className={`${styles.profileInfo} just-flex gap-2`}>
                  <div className={styles.formGroup}>
                    <div
                      className={styles.picUploader}
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFileUpload({
                          target: { files: e.dataTransfer.files },
                        });
                      }}
                    >
                      <img
                        src={user.profilePic || "/profile.png"}
                        alt="Profile Pic"
                        className={styles.profileImg}
                      />
                      <div className={styles.overlay}>
                        {/* your camera SVG */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="-0.565 -0.565 18 18"
                          id="Camera-Setting-Pin--Streamline-Sharp"
                          height={22}
                          width={22}
                        >
                          <desc>
                            {
                              "\n    Camera Setting Pin Streamline Icon: https://streamlinehq.com\n  "
                            }
                          </desc>
                          <g id="camera-setting-pin--photos-camera-map-photography-pictures-maps-settings-pin-photo">
                            <path
                              id="Vector 2904"
                              stroke="#fff"
                              d="M1.4058333333333333 11.949583333333333V4.217499999999999h2.460208333333333L5.623333333333333 1.4058333333333333h5.623333333333333l1.7572916666666667 2.8116666666666665H15.464166666666666v7.732083333333333h-4.568958333333333L8.434999999999999 15.112708333333332 5.9747916666666665 11.949583333333333H1.4058333333333333Z"
                              strokeWidth={1.13}
                            />
                            <path
                              id="Ellipse 4"
                              stroke="#fff"
                              d="M5.9747916666666665 7.380624999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                              strokeWidth={1.13}
                            />
                          </g>
                        </svg>
                      </div>

                      {uploadProgress > 0 && (
                        <div className={styles.progressBarWrapper}>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressBar}
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {uploadProgress}%
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div>
                    <h3 className="heading-tertiary margin-bottom-sm">
                      {user.name}
                    </h3>
                    <p className="paragraph-lg muted">
                      {user.friends.length} Friends
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
                </div>

                <div className={styles.userProfileContent}>
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
                          {user.bio}
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
                              {" "}
                              {user?.country}, {user?.city}
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
                          {user.bio}
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
                            <span className="strong-sm">{user.email}</span>
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
                            <span className="strong-sm">{user.gender}</span>
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
                            <span className="strong-sm">{user.dob}</span>
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
                          <div className={`${styles.friendsGrid}`}>
                            {friends.map((friend) => (
                              <div
                                key={friend._id}
                                className={`${styles.friendCard} card`}
                              >
                                <Link
                                  href={`/profile/${friend._id}`}
                                  className="just-flex gap-2"
                                >
                                  <img
                                    src={friend.profilePic || "/profile.png"}
                                    alt={friend.name}
                                    className={styles.avatar}
                                  />
                                  <p className="paragraph-lg">{friend.name}</p>
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {whichTabIsOpen === "post" && (
                    <div className={styles.feed}>
                      <CreatePost onPostCreated={handlePostCreated} />
                      <PostMe refreshTrigger={refreshTrigger} />
                    </div>
                  )}

                  {/* cropping modal */}
                  {showCropModal && (
                    <div className={styles.cropModal}>
                      <div className={styles.cropContainer}>
                        <div style={{ flex: 1, position: "relative" }}>
                          <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            style={{
                              containerStyle: { width: "100%", height: "100%" },
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "1rem",
                          }}
                        >
                          <button
                            onClick={cancelCrop}
                            className={styles.cropButton}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={uploadCroppedImage}
                            className={styles.cropButton}
                          >
                            {isUploadingImage
                              ? "Uploading..."
                              : "Crop & Upload"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </>
    </ProtectedRoute>
  );
}
