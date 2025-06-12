import styles from "./SpinnerMini.module.css";

export default function SpinnerMini() {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
    </div>
  );
}
