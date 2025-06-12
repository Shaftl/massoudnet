import styles from "./Spinner.module.css";

export default function Spinner() {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
    </div>
  );
}
