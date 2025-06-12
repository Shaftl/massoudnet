// EditPostModalGroup.js
import styles from "./EditPostModal.module.css";
import { toast } from "react-toastify";

function EditPostModalGroup({
  post,
  uploadProgress, // number
  editText, // string
  setEditText, // fn
  editPreview, // string|null (objectURL or original URL)
  setEditPreview, // fn
  editMediaFile, // File|null
  setEditMediaFile, // fn
  removeMedia, // boolean
  setRemoveMedia, // fn
  savePostChanges, // fn
  setEditingPostId, // fn
  isUpdating, // boolean
}) {
  // original URL is the first element of post.media[]
  const originalUrl = Array.isArray(post.media) && post.media[0];

  // flags
  const showingNew = Boolean(editMediaFile); // user picked a file
  const showingOriginal = !editMediaFile && originalUrl && !removeMedia;
  const showingNone = !showingNew && !showingOriginal;

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setEditMediaFile(f);
    setEditPreview(URL.createObjectURL(f));
    setRemoveMedia(false);
  };

  const onRemove = () => {
    setEditMediaFile(null);
    setEditPreview(null);
    setRemoveMedia(true);
  };

  const onSave = () => {
    const hasText = editText.trim().length > 0;
    const hasMedia = showingNew || showingOriginal;
    if (!hasText && !hasMedia) {
      toast.error("Please add some text or media before saving.");
      return;
    }
    savePostChanges();
  };

  return (
    <div className={styles.editPostModal}>
      <div
        className={styles.postModal}
        style={{
          opacity: isUpdating ? 0.5 : 1,
          pointerEvents: isUpdating ? "none" : "auto",
        }}
      >
        {/* TEXTAREA */}
        <textarea
          className="field"
          rows={4}
          placeholder="What&apos;s on your mind?"
          disabled={isUpdating}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />

        {/* MEDIA PREVIEW + CONTROLS */}
        <div className={styles.previewImgs}>
          {!showingNone && (
            <>
              <label htmlFor="image" className={styles.changeImage}>
                {showingNone ? "Add Media" : "Change Media"}
              </label>
              <button
                type="button"
                className={`${styles.removeMediaBtn} btn`}
                onClick={onRemove}
                disabled={isUpdating}
              >
                {/* your same SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  height={18}
                  width={18}
                >
                  <g id="elipse-frame">
                    <path
                      stroke="#000"
                      d="M1.406 8.435a7.029 7.029 0 1 0 14.058 0 7.029 7.029 0 1 0-14.058 0"
                      strokeWidth={1.13}
                    />
                    <path
                      stroke="#000"
                      d="m3.515 3.515 9.841 9.841"
                      strokeWidth={1.13}
                    />
                    <path
                      stroke="#000"
                      d="M3.515 13.355 13.355 3.515"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>
              </button>
            </>
          )}

          {showingNew ? (
            // NEW preview
            editMediaFile.type.startsWith("video/") ? (
              <video controls src={editPreview} className={styles.previewImg} />
            ) : (
              <img
                src={editPreview}
                alt="preview"
                className={styles.previewImg}
              />
            )
          ) : showingOriginal ? (
            // ORIGINAL URL fallback
            originalUrl.endsWith(".mp4") ? (
              <video controls src={originalUrl} className={styles.previewImg} />
            ) : (
              <img
                src={originalUrl}
                alt="preview"
                className={styles.previewImg}
              />
            )
          ) : (
            // NO media yet
            <div className={styles.noMediaBox}>
              <label htmlFor="image" className={styles.empty}>
                {/* your same “empty” SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  height={18}
                  width={18}
                >
                  <g>
                    <path
                      stroke="#000"
                      d="M2.27 10.976L8.435 4.811l6.164 6.165"
                      strokeWidth={1.13}
                    />
                    <path
                      stroke="#000"
                      d="M8.435 16.167V4.812"
                      strokeWidth={1.13}
                    />
                    <path
                      stroke="#000"
                      d="M1.054 1.406h14.761"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>
                <span>Add Image or Video</span>
              </label>
            </div>
          )}
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          id="image"
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={onFileChange}
          disabled={isUpdating}
        />

        {/* UPLOAD PROGRESS */}
        {uploadProgress > 0 && (
          <div className={styles.progress}>
            <div style={{ width: `${uploadProgress}%` }} />
            <p>{uploadProgress}%</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="just-flex" style={{ gap: "1rem" }}>
          <button onClick={() => setEditingPostId(null)} disabled={isUpdating}>
            Cancel
          </button>
          <button onClick={onSave} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPostModalGroup;
