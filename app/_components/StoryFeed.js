"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/_components/Story.module.css";
import SpinnerMini from "./SpinnerMini";

const StoryFeed = ({ onOpenStory, triger }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [uploadProgress, setUploadProgress] = useState({}); // key: storyId, value: percent
  const [isMoreOption, setIsMoreOption] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch all stories
        setIsLoading(true);
        const res = await fetch(
          "https://massoudnet-backend.onrender.com/api/stories",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        // ensure it's an array before setting state
        setStories(Array.isArray(data) ? data : []);

        // fetch current user
        const meRes = await fetch(
          "https://massoudnet-backend.onrender.com/api/auth/me",
          {
            credentials: "include",
          }
        );
        const meData = await meRes.json();
        setCurrentUserId(meData?._id || "");
      } catch (err) {
        console.error("Failed to fetch stories", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [triger]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;

    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/stories/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        return alert("Delete failed: " + errData.error);
      }
      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting story", err);
    }
  };

  const handleEditVisibility = async (id, newVisibility) => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/stories/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visibility: newVisibility }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        return alert("Edit failed: " + err.error);
      }
      const updated = await res.json();
      setStories((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, visibility: updated.visibility } : s
        )
      );
    } catch (err) {
      console.error("Error editing story", err);
    }
  };

  const handleMediaChange = async (id, file) => {
    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "massoudnet-stories");

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dhljprc8i/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [id]: pct }));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const { secure_url } = JSON.parse(xhr.responseText);
          const updateRes = await fetch(
            `https://massoudnet-backend.onrender.com/api/stories/${id}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mediaUrl: secure_url, mediaType }),
            }
          );
          if (!updateRes.ok) {
            const err = await updateRes.json();
            return alert("Media update failed: " + err.error);
          }
          const updated = await updateRes.json();
          setStories((prev) =>
            prev.map((s) => (s._id === id ? { ...s, ...updated } : s))
          );
        } else {
          console.error("Cloudinary upload failed", xhr.responseText);
        }
        setUploadProgress((prev) => ({ ...prev, [id]: null }));
      };

      xhr.onerror = () => {
        console.error("Upload error");
        setUploadProgress((prev) => ({ ...prev, [id]: null }));
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Failed to update media", err);
      setUploadProgress((prev) => ({ ...prev, [id]: null }));
    }
  };

  if (isLoading) return <SpinnerMini />;

  return (
    <div>
      <div className={styles.storyContainer}>
        {stories.map((story, idx) => {
          const isMine = story.user?._id === currentUserId;
          const pct = uploadProgress[story._id];

          return (
            <div key={story._id}>
              <div
                // className={styles.storyCard}
                className={styles.stories}
              >
                {isMine && (
                  <button
                    className={styles.moreOptionBtn}
                    onClick={() =>
                      setIsMoreOption(
                        isMoreOption === story._id ? null : story._id
                      )
                    }
                  >
                    {isMoreOption !== story._id ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="-0.565 -0.565 18 18"
                        id="Horizontal-Menu-Square--Streamline-Sharp"
                        height={16}
                        width={16}
                      >
                        <desc>
                          {
                            "\n    Horizontal Menu Square Streamline Icon: https://streamlinehq.com\n  "
                          }
                        </desc>
                        <g id="horizontal-menu-square--navigation-dots-three-square-button-horizontal-menu">
                          <path
                            id="Rectangle 893"
                            stroke="#fff"
                            d="M1.4058333333333333 1.4058333333333333h14.058333333333334v14.058333333333334H1.4058333333333333z"
                            strokeWidth={1.13}
                          />
                          <path
                            id="Vector 2975"
                            stroke="#fff"
                            d="M5.096145833333333 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                            strokeWidth={1.13}
                          />
                          <path
                            id="Vector 2976"
                            stroke="#fff"
                            d="M8.610729166666665 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                            strokeWidth={1.13}
                          />
                          <path
                            id="Vector 2977"
                            stroke="#fff"
                            d="M12.1253125 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                            strokeWidth={1.13}
                          />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="-0.565 -0.565 18 18"
                        id="Delete-2--Streamline-Sharp"
                        height={16}
                        width={16}
                      >
                        <desc>
                          {
                            "\n    Delete 2 Streamline Icon: https://streamlinehq.com\n  "
                          }
                        </desc>
                        <g id="delete-2--remove-bold-add-button-buttons-delete-cross-x-mathematics-multiply-math">
                          <path
                            id="Union"
                            stroke="#fff"
                            d="M4.920416666666666 1.4058333333333333 1.4058333333333333 4.920416666666666l3.5145833333333334 3.5145833333333334 -3.5145833333333334 3.5145833333333334 3.5145833333333334 3.5145833333333334 3.5145833333333334 -3.5145833333333334 3.5145833333333334 3.5145833333333334 3.5145833333333334 -3.5145833333333334 -3.5145833333333334 -3.5145833333333334 3.5145833333333334 -3.5145833333333334 -3.5145833333333334 -3.5145833333333334 -3.5145833333333334 3.5145833333333334 -3.5145833333333334 -3.5145833333333334Z"
                            strokeWidth={1.13}
                          />
                        </g>
                      </svg>
                    )}
                  </button>
                )}

                {isMine && isMoreOption === story._id && (
                  <div className={styles.moreOptionContent}>
                    <>
                      <button className={styles.storyOption}>
                        <label htmlFor="sourceInput">Change image</label>
                      </button>

                      <select
                        value={story.visibility}
                        onChange={(e) =>
                          handleEditVisibility(story._id, e.target.value)
                        }
                        className={styles.storyOption}
                      >
                        <option value="friends">Friends</option>
                        <option value="public">Public</option>
                      </select>

                      <button
                        onClick={() => handleDelete(story._id)}
                        className={styles.storyOption}
                      >
                        Delete
                      </button>

                      <input
                        id="sourceInput"
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) =>
                          e.target.files[0] &&
                          handleMediaChange(story._id, e.target.files[0])
                        }
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          fontSize: 10,
                          display: "none",
                        }}
                      />
                    </>
                  </div>
                )}

                <img
                  src={story.user.profilePic || "/default.jpg"}
                  alt="avatar"
                  className={styles.storyUser}
                  onClick={() => onOpenStory(idx)}
                />

                <div>
                  {pct != null ? (
                    <div
                      style={{
                        width: 120,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eee",
                      }}
                    >
                      <strong>{pct}%</strong>
                    </div>
                  ) : story.mediaType === "image" ? (
                    <img
                      src={story.mediaUrl}
                      alt="story"
                      style={{ width: 120, height: 200, objectFit: "cover" }}
                      className={styles.storyPost}
                      onClick={() => onOpenStory(idx)}
                    />
                  ) : (
                    <video
                      src={story.mediaUrl}
                      style={{ width: 120, height: 200, objectFit: "cover" }}
                      controls
                      className={styles.storyPost}
                      onClick={() => onOpenStory(idx)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryFeed;
