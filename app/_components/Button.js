import styles from "./Button.module.css";

function Button({ onClick, active, children, after }) {
  return (
    <button
      className={`${styles.button} ${after ? styles.buttonTip : null} ${
        active ? styles.activeBtn : null
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
