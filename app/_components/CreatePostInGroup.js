"use client";

import styles from "./CreatePost.module.css";
import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export default function CreatePostInGroup({ groupId, setTriger }) {
  const user = useSelector((state) => state.auth.user);
  const [postText, setPostText] = useState("");
  const [postMedia, setPostMedia] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploading, setUploading] = useState(false);

  const resetForm = useCallback(() => {
    setPostText("");
    setPostMedia([]);
    setUploadProgress([]);
  }, []);

  const handleMediaChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setPostMedia(files);
      setUploadProgress(new Array(files.length).fill(0));
    }
  }, []);

  const handleRemoveMedia = useCallback((index) => {
    setPostMedia((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePost = useCallback(
    async (e) => {
      e.preventDefault();
      if (!postText.trim() && postMedia.length === 0) {
        toast.error("Type something or add an image/video to post.");
        return;
      }

      setUploading(true);
      try {
        const mediaUrls = [];
        for (let i = 0; i < postMedia.length; i++) {
          const file = postMedia[i];
          const result = await uploadToCloudinary(file, (percent) => {
            setUploadProgress((prev) => {
              const updated = [...prev];
              updated[i] = percent;
              return updated;
            });
          });
          if (result?.secure_url) mediaUrls.push(result.secure_url);
        }

        const res = await fetch(
          `https://massoudnet-backend.onrender.com/api/groups/${groupId}/posts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: postText.trim(), media: mediaUrls }),
          }
        );

        if (!res.ok) throw new Error("Post failed");
        const random = Math.floor(Math.random() * 4);
        setTriger(random);

        toast.success("Post added to group!");
        resetForm();
      } catch (err) {
        toast.error(err.message || "Failed to create post");
      } finally {
        setUploading(false);
      }
    },
    [groupId, postText, postMedia, resetForm]
  );

  const placeholder = user?.name
    ? `What&apos;s on your mind, ${user.name}?`
    : "Write something...";

  return (
    <form className={`card ${styles.createPost}`} onSubmit={handlePost}>
      <div className={styles.topAction}>
        <img
          src={user?.profilePic || "/post.png"}
          alt={user?.name || "User"}
          className={styles.userImg}
        />
        <textarea
          placeholder={placeholder}
          className="field"
          rows={1}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />
      </div>

      {postMedia.length > 0 && (
        <div className={styles.previewWrapper}>
          {postMedia.map((file, i) => {
            const isVideo = file.type.startsWith("video/");
            return (
              <div key={i} className={styles.previewItem}>
                {isVideo ? (
                  <video
                    controls
                    src={URL.createObjectURL(file)}
                    className={styles.previewMedia}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className={styles.previewMedia}
                    style={{ width: "100%" }}
                  />
                )}
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleRemoveMedia(i)}
                  title="Remove media"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    height={18}
                    width={18}
                  >
                    <path
                      stroke="#fff"
                      d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                      strokeWidth={1.13}
                    />
                    <path
                      stroke="#fff"
                      d="m3.5145833333333334 3.5145833333333334 9.840833333333332 9.840833333333332"
                      strokeWidth={1.13}
                    />
                    <path
                      stroke="#fff"
                      d="M3.5145833333333334 13.355416666666667 13.355416666666667 3.5145833333333334"
                      strokeWidth={1.13}
                    />
                  </svg>
                </button>
                {uploadProgress[i] > 0 && (
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressBar}
                        style={{ height: `${uploadProgress[i]}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {uploadProgress[i]}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.postContent}>
        <div className={styles.postSource}>
          <label htmlFor="media" className="paragraph-md">
            <div className={`${styles.postSourceIcons} just-flex`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                height={18}
                width={18}
              >
                <path
                  stroke="#000"
                  strokeWidth={1.13}
                  d="M1.4058 15.4642V1.4058h14.0583v14.0583H1.4058Z"
                />
                <path
                  stroke="#000"
                  strokeWidth={1.13}
                  d="M5.2719 3.866a1.4058 1.4058 0 1 1 0 2.8117 1.4058 1.4058 0 0 1 0-2.8117Z"
                />
                <path
                  stroke="#000"
                  strokeWidth={1.13}
                  d="M1.4058 11.9496h14.0583"
                />
                <path
                  stroke="#000"
                  strokeWidth={1.13}
                  d="m15.4642 10.5438-4.2175-4.2175-5.6233 5.6233"
                />
              </svg>
            </div>
          </label>
          <div className={`${styles.postSourceIcons} just-flex`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="-0.565 -0.565 18 18"
              height={18}
              width={18}
            >
              <path
                stroke="#000"
                strokeWidth={1.13}
                d="M1.4058 8.435a7.0292 7.0292 0 1 0 14.0583 0 7.0292 7.0292 0 1 0-14.0583 0Z"
              />
              <path
                stroke="#000"
                strokeWidth={1.13}
                d="M5.9748 5.6233v1.7573"
              />
              <path
                stroke="#000"
                strokeWidth={1.13}
                d="M10.8952 5.6233v1.7573"
              />
              <path
                stroke="#000"
                strokeWidth={1.13}
                d="M10.8952 9.1379a2.4602 2.4602 0 1 1-4.9204 0"
              />
            </svg>
          </div>
        </div>

        <small
          style={{ color: "#f90" }}
          hidden={!(postText.trim() === "" && postMedia.length === 0)}
        >
          Type something or add an image/video to post.
        </small>

        <button
          className="just-flex"
          type="submit"
          disabled={
            uploading || (postText.trim() === "" && postMedia.length === 0)
          }
        >
          {uploading ? (
            <div className="lds-roller">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} />
              ))}
            </div>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                height={18}
                width={18}
              >
                <path
                  stroke="#fff"
                  strokeWidth={1.13}
                  d="M2.1087 6.6327L15.2041 1.6659 10.238 14.7613l-2.7097-5.4188L2.1087 6.6327Z"
                />
                <path
                  stroke="#fff"
                  strokeWidth={1.13}
                  d="m7.5275 9.3425 3.161-3.161"
                />
              </svg>
              <span style={{ marginLeft: "0.6rem" }}>Post</span>
            </>
          )}
        </button>
      </div>

      <div className={styles.actions}>
        <input
          id="media"
          type="file"
          // multiple
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleMediaChange}
        />
      </div>
    </form>
  );
}
