"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import styles from "./page.module.css";

import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";

export default function CompleteProfile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true); // ✅ New loading state

  const [form, setForm] = useState({
    bio: "",
    country: "",
    city: "",
    profilePic: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // → cropping modal state
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://massoudnet-backend.onrender.com/api/auth/me",
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        dispatch(setUser(data)); // Update Redux state

        // ← REPLACED this block to use country/city:
        const isComplete =
          data.bio?.trim() &&
          data.country?.trim() &&
          data.city?.trim() &&
          data.profilePic?.trim();

        if (isComplete) {
          router.push("/");
        } else {
          setForm({
            bio: data.bio || "",
            country: data.country || "",
            city: data.city || "",
            profilePic: data.profilePic || "",
          });
        }
      } catch (err) {
        router.push("/login"); // Not logged in
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { bio, country, city, profilePic } = form;
    if (!bio || !country || !city || !profilePic) {
      toast.error("Please fill in all fields.");
      return;
    }

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
      toast.success("Profile completed successfully");
      router.push("/");
    } else {
      toast.error("Failed to update profile");
    }
  };

  // → open crop modal instead of instant upload
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

  // → cancel cropping
  const cancelCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
  };

  // → perform crop + upload
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
          setForm((f) => ({ ...f, profilePic: secure_url }));
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

  if (loading) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={`card ${styles.loginBox}`}>
        <div className={`${styles.logo} just-flex `}>
          <img src="black-logo.png" alt="Company Logo" />
        </div>
        <h1 className="heading-primary margin-bottom-xl">
          Complete Your Profile
        </h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Bio</label>
          <input
            className={styles.input}
            name="bio"
            value={form.bio}
            onChange={handleChange}
            required
          />

          <label>Country</label>
          <CountryDropdown
            classes={styles.input}
            className={styles.input}
            name="country"
            value={form.country}
            onChange={(val) =>
              setForm((f) => ({ ...f, country: val, city: "" }))
            }
            required
          />

          <label>City</label>
          <RegionDropdown
            classes={styles.input}
            className={styles.input}
            country={form.country}
            name="city"
            value={form.city}
            onChange={(val) => setForm((f) => ({ ...f, city: val }))}
            required
          />

          <label>Profile Picture</label>
          <div className={styles.imageUploadBox}>
            {form.profilePic ? (
              <div className={styles.imagePreviewWrapper}>
                <img
                  src={form.profilePic}
                  alt="Profile Preview"
                  className={styles.profilePreview}
                />
                <label className={styles.changePicButton}>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    hidden
                  />
                </label>
              </div>
            ) : (
              <label className={styles.uploadPlaceholder}>
                Click to upload your profile picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  hidden
                  required
                />
              </label>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={isUploadingImage}
          >
            {isUploadingImage ? "Uploading..." : "Finish Setup"}
          </button>
        </form>

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
                  marginTop: "1rem",
                }}
              >
                <button onClick={cancelCrop} className={styles.button}>
                  Cancel
                </button>
                <button
                  onClick={uploadCroppedImage}
                  className={styles.cropButton}
                >
                  {isUploadingImage ? "Uploading..." : "Crop & Upload"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
