import Link from "next/link";
import Button from "./Button";
import styles from "./SideThree.module.css";

function SideThree() {
  return (
    <div className={`${styles.sideThree} card`}>
      <Link className="nextLink" href="/profile/settings">
        <Button after={true}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="-0.565 -0.565 18 18"
            id="Sun--Streamline-Sharp"
            height={18}
            width={18}
          >
            <g id="sun--photos-light-camera-mode-brightness-sun-photo-full">
              <path
                id="Ellipse 7"
                stroke="#000000"
                d="M5.9747916666666665 8.434999999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                strokeWidth={1.13}
              />
              <path
                id="Vector 2181"
                stroke="#000000"
                d="m6.32625 3.5145833333333334 2.1087499999999997 -2.1087499999999997 2.1087499999999997 2.1087499999999997h2.8116666666666665v2.8116666666666665l2.1087499999999997 2.1087499999999997 -2.1087499999999997 2.1087499999999997v2.8116666666666665h-2.8116666666666665l-2.1087499999999997 2.1087499999999997 -2.1087499999999997 -2.1087499999999997H3.5145833333333334v-2.8116666666666665l-2.1087499999999997 -2.1087499999999997 2.1087499999999997 -2.1087499999999997V3.5145833333333334h2.8116666666666665Z"
                strokeWidth={1.13}
              />
            </g>
          </svg>
        </Button>
      </Link>

      <Link className="nextLink" href="/help-support">
        <Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="-0.565 -0.565 18 18"
            id="Help-Chat-2--Streamline-Sharp"
            height={18}
            width={18}
          >
            <g id="help-chat-2--bubble-help-mark-message-query-question-speech-circle">
              <path
                id="Ellipse 331"
                stroke="#000000"
                d="M8.434999999999999 15.464166666666666c3.8822087499999998 0 7.029166666666667 -3.1469579166666666 7.029166666666667 -7.029166666666667S12.317208749999999 1.4058333333333333 8.434999999999999 1.4058333333333333 1.4058333333333333 4.55279125 1.4058333333333333 8.434999999999999c0 1.6961379166666664 0.60099375 3.2523954166666664 1.6012441666666666 4.467035416666667L1.4058333333333333 15.464166666666666l7.029166666666667 0Z"
                strokeWidth={1.13}
              />
              <path
                id="Vector 167"
                stroke="#000000"
                d="M6.2826691666666665 7.068529999999999V6.677708333333333a2.1087499999999997 2.1087499999999997 0 1 1 4.217499999999999 0v0.3908216666666667l-2.1087499999999997 1.8739758333333332 0 1.2497858333333334"
                strokeWidth={1.13}
              />
              <path
                id="Vector 166"
                stroke="#000000"
                d="m8.391419166666667 11.598125 0 1.0543749999999998"
                strokeWidth={1.13}
              />
            </g>
          </svg>
        </Button>
      </Link>
    </div>
  );
}

export default SideThree;
