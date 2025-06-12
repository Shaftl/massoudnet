import styles from "./EditPostModal.module.css";
import { toast } from "react-toastify";

function EditPostModal({
  post,
  renderMedia,
  uploadProgress,
  editText,
  setEditText,
  editPrivacy,
  setEditPrivacy,
  editPreview,
  editMediaFile,
  setEditMediaFile,
  setEditPreview,
  removeMedia,
  setRemoveMedia,
  savePostChanges,
  setEditingPostId,
  isUpdating,
}) {
  const hasOriginalMedia = post.image || post.video;
  const showNoMedia = !editPreview && (!hasOriginalMedia || removeMedia);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setEditMediaFile(f);
      setEditPreview(URL.createObjectURL(f));
      setRemoveMedia(false);
    }
  };

  const handleRemoveMedia = () => {
    setEditPreview(null);
    setEditMediaFile(null);
    setRemoveMedia(true);
  };

  const handleSave = () => {
    const hasText = editText.trim().length > 0;
    const hasMedia = Boolean(editPreview) || (hasOriginalMedia && !removeMedia);

    if (!hasText && !hasMedia) {
      toast.error("Please add some text or media before saving.");
      return;
    }
    savePostChanges(post._id);
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
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="field"
          placeholder="What&apos;s on your mind?"
          rows="4"
          disabled={isUpdating}
        />

        <div className={styles.previewImgs}>
          {!showNoMedia && (
            <>
              <label
                htmlFor="image"
                className={`${styles.privacySelect} ${styles.changeImage}`}
              >
                Change Media
              </label>
              <button
                type="button"
                className={`${styles.removeMediaBtn} btn`}
                onClick={handleRemoveMedia}
                disabled={isUpdating}
              >
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

          {editPreview ? (
            editMediaFile.type.startsWith("video/") ? (
              <video controls src={editPreview} className={styles.previewImg} />
            ) : (
              <img
                src={editPreview}
                alt="preview"
                className={styles.previewImg}
              />
            )
          ) : showNoMedia ? (
            <div className={styles.noMediaBox}>
              <label htmlFor="image" className={styles.empty}>
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
          ) : (
            !removeMedia && renderMedia(post.image, post.video)
          )}
        </div>

        {/* {removeMedia && <p>Media will be removed.</p>} */}

        <input
          id="image"
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={isUpdating}
        />

        {uploadProgress > 0 && (
          <div className={styles.progress}>
            <div style={{ width: `${uploadProgress}%` }} />
            <p>{uploadProgress}%</p>
          </div>
        )}

        <div className="justify-between" style={{ width: "100%" }}>
          <select
            value={editPrivacy}
            onChange={(e) => setEditPrivacy(e.target.value)}
            className={styles.privacySelect}
            disabled={isUpdating}
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="onlyMe">🔒 Only Me</option>
          </select>

          <div className="just-flex" style={{ gap: "1rem" }}>
            <button
              onClick={() => setEditingPostId(null)}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPostModal;
