"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import styles from "@/app/_components/Story.module.css";
import { openPopup, closePopup } from "@/redux/storySlice";

const StoryUpload = ({ onStoryUploaded, setTriger }) => {
  const dispatch = useDispatch();
  const isOpenPopup = useSelector((state) => state.story.isOpen);

  const [file, setFile] = useState(null);
  const [visibility, setVisibility] = useState("friends");
  const [preview, setPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "massoudnet-stories");

    setUploading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/dhljprc8i/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = async () => {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status !== 200) {
        setUploading(false);
        return alert("Upload failed: " + data.error?.message);
      }

      const mediaUrl = data.secure_url;
      const mediaType = file.type.startsWith("video") ? "video" : "image";

      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/stories",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mediaUrl, mediaType, visibility }),
        }
      );

      const result = await res.json();
      setUploading(false);

      const random = Math.floor(Math.random() * 4);
      setTriger(random);

      if (!res.ok) {
        return alert("Story save failed: " + result.message);
      }

      setFile(null);
      setPreview("");
      setUploadProgress(0);
      onStoryUploaded();
      dispatch(closePopup());
      toast.success("Story Successful Posted");
    };

    xhr.onerror = () => {
      setUploading(false);
      alert("Network error during upload.");
    };

    xhr.send(formData);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div className={`${styles.story} `}>
        <div className={styles.storyContainer}>
          <div
            className={styles.createStory}
            onClick={() => dispatch(openPopup())}
          >
            {/* SVG markup unchanged */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="-1.565 -1.565 50 50"
              id="Story-Post--Streamline-Sharp"
              height={28}
              width={28}
            >
              <g id="story-post">
                <path
                  id="Vector 1366"
                  stroke="#000000"
                  d="M23.435000000000002 14.646875000000001v17.57625M14.646875000000001 23.435000000000002h17.57625"
                  strokeWidth={3.13}
                />
                <path
                  id="Ellipse 445"
                  stroke="#000000"
                  d="M3.9058333333333337 23.435000000000002c0 10.78595875 8.743207916666668 19.52916666666667 19.52916666666667 19.52916666666667s19.52916666666667 -8.743207916666668 19.52916666666667 -19.52916666666667S34.22095875 3.9058333333333337 23.435000000000002 3.9058333333333337"
                  strokeWidth={3.13}
                />
                <path
                  id="Ellipse 446"
                  stroke="#000000"
                  d="M4.296416666666667 19.52916666666667c0.33004291666666674 -1.6209208333333334 0.8592833333333334 -3.16958375 1.5623333333333336 -4.616695"
                  strokeWidth={3.13}
                />
                <path
                  id="Ellipse 448"
                  stroke="#000000"
                  d="M11.717500000000001 7.811666666666667a19.642435833333334 19.642435833333334 0 0 0 -3.9058333333333337 3.9038804166666674"
                  strokeWidth={3.13}
                />
                <path
                  id="Ellipse 449"
                  stroke="#000000"
                  d="M19.52916666666667 4.296416666666667c-1.6209208333333334 0.32809000000000005 -3.16958375 0.8592833333333334 -4.616695 1.5623333333333336"
                  strokeWidth={3.13}
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {isOpenPopup && (
        <div className={styles.overlay}>
          <div className={styles.createStoryPopup}>
            <button
              className={styles.closePopupBtn}
              onClick={() => dispatch(closePopup())}
            >
              {/* Close SVG unchanged */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                id="Elipse-Frame--Streamline-Sharp"
                height="24"
                width="24"
              >
                <desc>
                  Elipse Frame Streamline Icon: https://streamlinehq.com
                </desc>
                <g id="elipse-frame">
                  <path
                    id="Ellipse 575"
                    stroke="#000000"
                    d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0 -20 0"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    id="Vector 1859"
                    stroke="#000000"
                    d="m5 5 14 14"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    id="Vector 1860"
                    stroke="#000000"
                    d="M5 19 19 5"
                    strokeWidth="1.5"
                  ></path>
                </g>
              </svg>
            </button>

            <label htmlFor="storySource">
              <div className={styles.sourcePlacholder}>
                {preview ? (
                  <div>
                    {file?.type.startsWith("image") ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className={styles.selectedSource}
                      />
                    ) : (
                      <video
                        src={preview}
                        width={200}
                        controls
                        className={styles.selectedSource}
                      />
                    )}

                    {uploadProgress > 0 && (
                      <div className={styles.progressBarWrapper}>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressBar}
                            style={{ height: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>
                          {uploadProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="paragraph-lg just-flex">
                    {/* Upload prompt SVG unchanged */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      id="Arrow-Up-Large-2--Streamline-Sharp"
                      height="18"
                      width="18"
                    >
                      <desc>
                        Arrow Up Large 2 Streamline Icon:
                        https://streamlinehq.com
                      </desc>
                      <g id="arrow-up-large-2--move-up-arrow-arrows-large-head">
                        <path
                          id="Vector"
                          stroke="#000000"
                          d="M3.23 15.615 12 6.845l8.769 8.77"
                          strokeWidth="1.5"
                        ></path>
                        <path
                          id="Vector_2"
                          stroke="#000000"
                          d="m12 23 0 -16.154"
                          strokeWidth="1.5"
                        ></path>
                        <path
                          id="Vector_3"
                          stroke="#000000"
                          d="m1.5 2 21 0"
                          strokeWidth="1.5"
                        ></path>
                      </g>
                    </svg>{" "}
                    Upload Image
                  </p>
                )}
              </div>
            </label>

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              id="storySource"
              style={{ display: "none" }}
            />

            <div className="justify-between">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className={styles.privacySelect}
              >
                <option value="friends">Friends</option>
                <option value="public">Public</option>
              </select>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`${styles.uploadBtn}`}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryUpload;
