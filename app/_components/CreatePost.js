"use client";

import styles from "./CreatePost.module.css";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import dynamic from "next/dynamic";

// Dynamically import EmojiPicker to avoid SSR errors
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false }
);

export default function CreatePost({ onPostCreated }) {
  const user = useSelector((state) => state.auth.user);
  const [hasMounted, setHasMounted] = useState(false);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const resetForm = useCallback(() => {
    setText("");
    setFile(null);
    setPrivacy("public");
    setUploadProgress(0);
  }, []);

  const handleFileChange = useCallback((e) => {
    setFile(e.target.files?.[0] || null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!text.trim() && !file) {
      toast.error("Write something or add media");
      return;
    }

    setPosting(true);
    setUploadProgress(0);

    try {
      const payload = { text: text.trim(), privacy };
      if (file) {
        const { secure_url } = await uploadToCloudinary(
          file,
          setUploadProgress
        );
        const key = file.type.startsWith("video/") ? "video" : "image";
        payload[key] = secure_url;
      }

      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/posts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");

      if (onPostCreated) onPostCreated();

      toast.success("Post created!");
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setPosting(false);
      setUploadProgress(0);
    }
  }, [text, file, privacy, resetForm]);

  const onEmojiClick = useCallback((emojiData, _event) => {
    setText((t) => t + emojiData.emoji);
  }, []);

  const isVideo = file?.type?.startsWith("video/");
  const placeholder =
    hasMounted && user?.name
      ? `What's on your mind, ${user.name}?`
      : "What's on your mind?";

  return (
    <div className={`card ${styles.createPost}`}>
      {/* Top action row */}
      <div className={styles.topAction}>
        {hasMounted && (
          <img
            src={user?.profilePic || "/post.png"}
            alt="User"
            className={styles.userImg}
          />
        )}
        <textarea
          placeholder={placeholder}
          className="field"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Emoji picker popover */}
      {showEmojiPicker && (
        <div className={styles.emojiPickerWrapper}>
          <button
            className={`${styles.closeEmojiBtn} btn`}
            onClick={() => setShowEmojiPicker(false)}
            title="Close"
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
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={300} />
        </div>
      )}

      {/* Preview + progress */}
      {file && (
        <div className={styles.previewWrapper}>
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
            className={styles.removeBtn}
            onClick={() => setFile(null)}
            title="Remove file"
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
                  stroke="#fff"
                  d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                  strokeWidth={1.13}
                />
                <path
                  id="Vector 1859"
                  stroke="#fff"
                  d="m3.5145833333333334 3.5145833333333334 9.840833333333332 9.840833333333332"
                  strokeWidth={1.13}
                />
                <path
                  id="Vector 1860"
                  stroke="#fff"
                  d="M3.5145833333333334 13.355416666666667 13.355416666666667 3.5145833333333334"
                  strokeWidth={1.13}
                />
              </g>
            </svg>
          </button>

          {uploadProgress > 0 && (
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ height: `${uploadProgress}%` }}
                />
              </div>
              <span className={styles.progressText}>{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom row: privacy + file picker + emoji toggle */}
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

          <div
            className={`${styles.postSourceIcons} just-flex`}
            onClick={() => setShowEmojiPicker((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="-0.565 -0.565 18 18"
              id="Happy-Face--Streamline-Sharp"
              height={18}
              width={18}
            >
              <desc>
                {
                  "\n    Happy Face Streamline Icon: https://streamlinehq.com\n  "
                }
              </desc>
              <g id="happy-face--smiley-chat-message-smile-emoji-face-satisfied">
                <path
                  id="Ellipse 7"
                  stroke="#000000"
                  d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                  strokeWidth={1.13}
                />
                <path
                  id="Vector 2050"
                  stroke="#000000"
                  d="M5.9747916666666665 5.623333333333333v1.7572916666666667"
                  strokeWidth={1.13}
                />
                <path
                  id="Vector 2051"
                  stroke="#000000"
                  d="M10.895208333333333 5.623333333333333v1.7572916666666667"
                  strokeWidth={1.13}
                />
                <path
                  id="Ellipse 988"
                  stroke="#000000"
                  d="M10.895208333333333 9.137916666666666a2.460208333333333 2.460208333333333 0 1 1 -4.920416666666666 0"
                  strokeWidth={1.13}
                />
              </g>
            </svg>
          </div>

          <select
            id="privacy"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className={styles.privacySelect}
          >
            <option value="public">🌐 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="onlyMe">🔒 Only Me</option>
          </select>
        </div>

        <button
          className="just-flex"
          type="button"
          onClick={() => {
            handleCreate();
            setShowEmojiPicker(false);
          }}
          disabled={posting}
        >
          {posting ? (
            <div className="lds-roller">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
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
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
