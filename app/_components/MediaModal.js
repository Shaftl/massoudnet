import styles from "./MediaModal.module.css";

export default function MediaModal({
  media,
  currentIndex,
  onClose,
  onNavigate,
}) {
  const current = media[currentIndex];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>
        {current.endsWith(".mp4") ? (
          <video src={current} controls autoPlay className={styles.media} />
        ) : (
          <img src={current} className={styles.media} alt="Example" />
        )}
        <div className={styles.nav}>
          {currentIndex > 0 && (
            <button onClick={() => onNavigate(currentIndex - 1)}>← Prev</button>
          )}
          {currentIndex < media.length - 1 && (
            <button onClick={() => onNavigate(currentIndex + 1)}>Next →</button>
          )}
        </div>
      </div>
    </div>
  );
}
