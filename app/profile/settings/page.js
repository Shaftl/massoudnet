"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import styles from "./page.module.css";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

export default function EditProfile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    country: "",
    city: "",
    profilePic: "",
    profileVisibility: "public",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPasswordTabOpen, setIsPasswordTabOpen] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const getPasswordErrors = (password) => {
    return {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const [passwordErrors, setPasswordErrors] = useState(getPasswordErrors(""));

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/me",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          country: data.country || "",
          city: data.city || "",
          profilePic: data.profilePic || "",
          profileVisibility: data.profileVisibility || "public",
        });
      } else {
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingImage) {
      toast.info("Please wait for the image to finish uploading.");
      return;
    }
    const res = await fetch(
      "https://massoudnet-backend.onrender.com/api/user/update",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      }
    );
    if (res.ok) {
      const refreshed = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/me",
        {
          credentials: "include",
        }
      );
      const user = await refreshed.json();
      dispatch(setUser(user));
      toast.success("Profile updated successfully");
      router.push("/profile/me");
    } else toast.error("Failed to update profile");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new passwords.");
      return;
    }
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/change-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else toast.error(data.message || "Failed to change password.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/delete-account",
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Account deleted.");
        setTimeout(() => router.push("/login"), 1500);
      } else toast.error(data.message || "Failed to delete account.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  // open crop modal on file select
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

  const cancelCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
  };

  const uploadCroppedImage = async () => {
    try {
      setIsUploadingImage(true);

      // 1️⃣ crop
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

      // 2️⃣ upload to Cloudinary
      const cloudForm = new FormData();
      cloudForm.append("file", croppedFile);
      cloudForm.append("upload_preset", "massoudnetv2");
      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dhljprc8i/image/upload",
        { method: "POST", body: cloudForm }
      );
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error?.message);

      // 3️⃣ persist to your backend
      const apiRes = await fetch(
        "https://massoudnet-backend.onrender.com/api/user/update",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePic: cloudData.secure_url }),
        }
      );
      const apiData = await apiRes.json();
      if (!apiRes.ok) throw new Error(apiData.message);

      // 4️⃣ update local form
      setForm((f) => ({ ...f, profilePic: cloudData.secure_url }));

      // 5️⃣ re-fetch the full user and push into Redux
      const meRes = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/me",
        {
          credentials: "include",
        }
      );
      if (meRes.ok) {
        const freshUser = await meRes.json();
        dispatch(setUser(freshUser));
      }

      toast.success("Profile picture updated");
    } catch (err) {
      console.error("uploadCroppedImage error:", err);
      toast.error(err.message || "Crop or upload failed");
    } finally {
      setIsUploadingImage(false);
      setShowCropModal(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    setPasswordErrors(getPasswordErrors(newPassword));
  }, [newPassword]);

  return (
    <div className={`${styles.setting} container`}>
      <div className={styles.settingContainer}>
        <div className={`${styles.rightPanel} card`}>
          <div className={styles.btns}>
            <button
              className={!isPasswordTabOpen ? styles.activeButton : ""}
              onClick={() => setIsPasswordTabOpen(false)}
            >
              Edit profile
            </button>
            <button
              className={isPasswordTabOpen ? styles.activeButton : ""}
              onClick={() => setIsPasswordTabOpen(true)}
            >
              Reset password
            </button>
          </div>
          <button onClick={handleDeleteAccount}>
            <span>Delete account</span>
          </button>
        </div>

        <div className="card" style={{ padding: "2.6rem" }}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formContainer}>
              {!isPasswordTabOpen ? (
                <>
                  <div>
                    {/* profile pic & name row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        alignItems: "center",
                        gap: "2.6rem",
                      }}
                    >
                      <div
                        className={styles.picUploader}
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                      >
                        {form.profilePic ? (
                          <>
                            <img
                              src={form.profilePic}
                              alt="Profile"
                              className={styles.avatarImg}
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
                          </>
                        ) : (
                          <span className={styles.placeholder}>
                            Upload Photo
                          </span>
                        )}
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleFileUpload}
                        />
                        {isUploadingImage && (
                          <div
                            className={styles.progressBar}
                            style={{ width: `${uploadProgress}%` }}
                          />
                        )}
                      </div>
                      <input
                        className={`${styles.input} field`}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label>Bio:</label>
                    <input
                      className={`${styles.input} field`}
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label>Country:</label>
                    <CountryDropdown
                      className={`${styles.input} field`}
                      value={form.country}
                      onChange={(val) =>
                        setForm((f) => ({ ...f, country: val, city: "" }))
                      }
                    />
                  </div>
                  <div>
                    <label>City:</label>
                    <RegionDropdown
                      className={`${styles.input} field`}
                      country={form.country}
                      value={form.city}
                      onChange={(val) => setForm((f) => ({ ...f, city: val }))}
                    />
                  </div>

                  <div>
                    <label>Profile Visibility:</label>
                    <select
                      className={`${styles.input} field`}
                      name="profileVisibility"
                      value={form.profileVisibility}
                      onChange={handleChange}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className={styles.button}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? "Uploading..." : "Update"}
                  </button>
                </>
              ) : (
                <div className={styles.container}>
                  <div className={styles.section}>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`${styles.input} field`}
                        style={{ width: "100%" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className={styles.showPasswordToggle}
                      >
                        {showCurrentPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${styles.input} field`}
                        style={{ width: "100%" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className={styles.showPasswordToggle}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <ul className={styles.checkList}>
                      <li
                        style={{
                          color: passwordErrors.length ? "green" : "inherit",
                        }}
                        className={styles.checkListItem}
                      >
                        {passwordErrors.length ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Check--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                              <path
                                id="Vector 2356"
                                stroke="green"
                                d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Warning-Shield--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                              <path
                                id="Vector 2351"
                                stroke="#000000"
                                d="m7.5 3.125 0 5.3125"
                                strokeWidth={1}
                              />
                              <path
                                id="Vector 2352"
                                stroke="#000000"
                                d="M7.5 9.6875V10.625"
                                strokeWidth={1}
                              />
                              <path
                                id="Rectangle 38"
                                stroke="#000000"
                                d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        )}{" "}
                        At least 8 characters
                      </li>
                      <li
                        style={{
                          color: passwordErrors.lower ? "green" : "inherit",
                        }}
                        className={styles.checkListItem}
                      >
                        {passwordErrors.lower ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Check--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                              <path
                                id="Vector 2356"
                                stroke="green"
                                d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Warning-Shield--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                              <path
                                id="Vector 2351"
                                stroke="#000000"
                                d="m7.5 3.125 0 5.3125"
                                strokeWidth={1}
                              />
                              <path
                                id="Vector 2352"
                                stroke="#000000"
                                d="M7.5 9.6875V10.625"
                                strokeWidth={1}
                              />
                              <path
                                id="Rectangle 38"
                                stroke="#000000"
                                d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        )}{" "}
                        A lowercase letter
                      </li>
                      <li
                        style={{
                          color: passwordErrors.upper ? "green" : "inherit",
                        }}
                        className={styles.checkListItem}
                      >
                        {passwordErrors.upper ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Check--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                              <path
                                id="Vector 2356"
                                stroke="green"
                                d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Warning-Shield--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                              <path
                                id="Vector 2351"
                                stroke="#000000"
                                d="m7.5 3.125 0 5.3125"
                                strokeWidth={1}
                              />
                              <path
                                id="Vector 2352"
                                stroke="#000000"
                                d="M7.5 9.6875V10.625"
                                strokeWidth={1}
                              />
                              <path
                                id="Rectangle 38"
                                stroke="#000000"
                                d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        )}{" "}
                        An uppercase letter
                      </li>
                      <li
                        style={{
                          color: passwordErrors.number ? "green" : "inherit",
                        }}
                        className={styles.checkListItem}
                      >
                        {passwordErrors.number ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Check--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                              <path
                                id="Vector 2356"
                                stroke="green"
                                d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Warning-Shield--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                              <path
                                id="Vector 2351"
                                stroke="#000000"
                                d="m7.5 3.125 0 5.3125"
                                strokeWidth={1}
                              />
                              <path
                                id="Vector 2352"
                                stroke="#000000"
                                d="M7.5 9.6875V10.625"
                                strokeWidth={1}
                              />
                              <path
                                id="Rectangle 38"
                                stroke="#000000"
                                d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        )}{" "}
                        A number
                      </li>
                      <li
                        style={{
                          color: passwordErrors.special ? "green" : "inherit",
                        }}
                        className={styles.checkListItem}
                      >
                        {passwordErrors.special ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Check--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                              <path
                                id="Vector 2356"
                                stroke="green"
                                d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.5 -0.5 16 16"
                            id="Warning-Shield--Streamline-Sharp"
                            height={16}
                            width={16}
                          >
                            <desc>
                              {
                                "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                              <path
                                id="Vector 2351"
                                stroke="#000000"
                                d="m7.5 3.125 0 5.3125"
                                strokeWidth={1}
                              />
                              <path
                                id="Vector 2352"
                                stroke="#000000"
                                d="M7.5 9.6875V10.625"
                                strokeWidth={1}
                              />
                              <path
                                id="Rectangle 38"
                                stroke="#000000"
                                d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                                strokeWidth={1}
                              />
                            </g>
                          </svg>
                        )}{" "}
                        A special character
                      </li>
                    </ul>

                    <button
                      onClick={handleChangePassword}
                      className={styles.button}
                      type="button"
                      disabled={
                        !currentPassword ||
                        !newPassword ||
                        Object.values(passwordErrors).includes(false)
                      }
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

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
                style={{ containerStyle: { width: "100%", height: "100%" } }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 2rem",
              }}
            >
              <button
                onClick={cancelCrop}
                className={styles.cropButton}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={uploadCroppedImage}
                className={styles.cropButton}
                type="button"
              >
                {isUploadingImage ? "Uploading..." : "Crop & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
