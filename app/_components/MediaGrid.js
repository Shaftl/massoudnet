import styles from "./MediaGrid.module.css";

export default function MediaGrid({ media, onMediaClick }) {
  if (!media || media.length === 0) return null;

  const getGridClass = () => {
    if (media.length === 1) return styles.one; // Single image
    if (media.length === 2) return styles.two; // 2nd image (double size)
    if (media.length === 3) return styles.three; // Triple size image
    return styles.grid; // Default grid layout for others
  };

  const displayImages = media.slice(0, 6); // Show only the first 6 images
  const extraImagesCount = media.length > 6 ? `+${media.length - 6}` : "";

  return (
    <div className={styles.gridWrapper}>
      {displayImages.map((url, i) => (
        <div
          key={i}
          className={`${styles.mediaItem} ${getGridClass()}`}
          onClick={() => onMediaClick(i)}
        >
          {url.endsWith(".mp4") ? (
            <video src={url} className={styles.media} muted />
          ) : (
            <img src={url} className={styles.media} alt="" />
          )}
        </div>
      ))}
      {extraImagesCount && (
        <div className={`${styles.overlay} ${styles.plusOverlay}`}>
          {extraImagesCount} more
        </div>
      )}
    </div>
  );
}
