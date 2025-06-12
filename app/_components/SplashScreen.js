import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  return (
    <div className={styles.container}>
      <img src="/black-logo.png" alt="Logo" className={styles.logo} />
    </div>
  );
}
