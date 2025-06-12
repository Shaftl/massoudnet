"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import styles from "./page.module.css";
import { checkAuth } from "@/utils/checkAuth";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const passwordChecks = {
    length: (pass) => pass.length >= 8,
    lowercase: (pass) => /[a-z]/.test(pass),
    uppercase: (pass) => /[A-Z]/.test(pass),
    number: (pass) => /\d/.test(pass),
    specialChar: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
  };

  const allPasswordChecksPass = (pass) =>
    Object.values(passwordChecks).every((check) => check(pass));

  useEffect(() => {
    const newErrors = {};
    if (step === 1) {
      if (!email) newErrors.email = "Email is required.";
      else if (!validateEmail(email))
        newErrors.email = "Invalid email address.";
    }
    if (step === 2 && !code) newErrors.code = "Verification code is required.";
    if (step === 3) {
      if (!newPass) newErrors.newPass = "Password is required.";
      else if (!allPasswordChecksPass(newPass))
        newErrors.newPass = "Password does not meet all requirements.";
    }
    setErrors(newErrors);
  }, [email, code, newPass, step]);

  const requestCode = async () => {
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) throw await res.json();
      toast.success("Verification code sent to your email.");
      setStep(2);
    } catch (e) {
      toast.error(e.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/verify-reset-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, code }),
        }
      );
      if (!res.ok) throw await res.json();
      toast.success("Code verified! Please enter a new password.");
      setStep(3);
    } catch (e) {
      toast.error(e.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, code, newPassword: newPass }),
        }
      );
      if (!res.ok) throw await res.json();
      toast.success("Password reset! Redirecting to login...");
      router.push("/login");
    } catch (e) {
      toast.error(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const check = async () => {
      const user = await checkAuth();
      if (user) router.push("/");
    };
    check();
  }, []);

  return (
    <div className={styles.forgotWrapper}>
      <div className={styles.forgotBox}>
        <p className={`paragraph-xl ${styles.heading}`}>Forgot Password</p>

        {step === 1 && (
          <>
            <p className={styles.stepText}>
              Enter your email address and we&apos;ll send you a verification
              code.
            </p>
            <input
              className={styles.input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
            <button
              className={styles.button}
              onClick={requestCode}
              disabled={loading}
            >
              {loading ? "Sending…" : "Send Code"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className={styles.stepText}>
              Check your email for the 6-digit code.
            </p>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errors.code && <p className={styles.error}>{errors.code}</p>}
            <button
              className={styles.button}
              onClick={verifyCode}
              disabled={loading}
            >
              {loading ? "Verifying…" : "Verify Code"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className={styles.stepText}>Enter your new password below.</p>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  top: "36%",
                  right: "2rem",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.newPass && <p className={styles.error}>{errors.newPass}</p>}

            <ul className={styles.checkList}>
              <li
                className={styles.checkListItem}
                style={{
                  color: passwordChecks.length(newPass) ? "green" : "inherit",
                }}
              >
                {passwordChecks.length(newPass) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Check--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                      <path
                        id="Vector 2356"
                        stroke="green"
                        d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Warning-Shield--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                      <path
                        id="Vector 2351"
                        stroke="#000000"
                        d="m7.5 3.125 0 5.3125"
                        strokeWidth={1}
                      />
                      <path
                        id="Vector 2352"
                        stroke="#000000"
                        d="M7.5 9.6875V10.625"
                        strokeWidth={1}
                      />
                      <path
                        id="Rectangle 38"
                        stroke="#000000"
                        d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                )}{" "}
                At least 8 characters
              </li>
              <li
                className={styles.checkListItem}
                style={{
                  color: passwordChecks.lowercase(newPass)
                    ? "green"
                    : "inherit",
                }}
              >
                {passwordChecks.lowercase(newPass) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Check--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                      <path
                        id="Vector 2356"
                        stroke="green"
                        d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Warning-Shield--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                      <path
                        id="Vector 2351"
                        stroke="#000000"
                        d="m7.5 3.125 0 5.3125"
                        strokeWidth={1}
                      />
                      <path
                        id="Vector 2352"
                        stroke="#000000"
                        d="M7.5 9.6875V10.625"
                        strokeWidth={1}
                      />
                      <path
                        id="Rectangle 38"
                        stroke="#000000"
                        d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                )}{" "}
                A lowercase letter
              </li>
              <li
                className={styles.checkListItem}
                style={{
                  color: passwordChecks.uppercase(newPass)
                    ? "green"
                    : "inherit",
                }}
              >
                {passwordChecks.uppercase(newPass) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Check--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                      <path
                        id="Vector 2356"
                        stroke="green"
                        d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Warning-Shield--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                      <path
                        id="Vector 2351"
                        stroke="#000000"
                        d="m7.5 3.125 0 5.3125"
                        strokeWidth={1}
                      />
                      <path
                        id="Vector 2352"
                        stroke="#000000"
                        d="M7.5 9.6875V10.625"
                        strokeWidth={1}
                      />
                      <path
                        id="Rectangle 38"
                        stroke="#000000"
                        d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                )}{" "}
                An uppercase letter
              </li>
              <li
                className={styles.checkListItem}
                style={{
                  color: passwordChecks.number(newPass) ? "green" : "inherit",
                }}
              >
                {passwordChecks.number(newPass) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Check--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                      <path
                        id="Vector 2356"
                        stroke="green"
                        d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Warning-Shield--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                      <path
                        id="Vector 2351"
                        stroke="#000000"
                        d="m7.5 3.125 0 5.3125"
                        strokeWidth={1}
                      />
                      <path
                        id="Vector 2352"
                        stroke="#000000"
                        d="M7.5 9.6875V10.625"
                        strokeWidth={1}
                      />
                      <path
                        id="Rectangle 38"
                        stroke="#000000"
                        d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                )}{" "}
                A number
              </li>
              <li
                className={styles.checkListItem}
                style={{
                  color: passwordChecks.specialChar(newPass)
                    ? "green"
                    : "inherit",
                }}
              >
                {passwordChecks.specialChar(newPass) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Check--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Check Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="check--check-form-validation-checkmark-success-add-addition-tick">
                      <path
                        id="Vector 2356"
                        stroke="green"
                        d="m0.9375 7.8125 4.375 4.375 8.75 -8.75"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.5 -0.5 16 16"
                    id="Warning-Shield--Streamline-Sharp"
                    height={16}
                    width={16}
                  >
                    <desc>
                      {
                        "\n    Warning Shield Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="warning-shield--frame-alert-warning-shield-exclamation-caution-security-protection">
                      <path
                        id="Vector 2351"
                        stroke="#000000"
                        d="m7.5 3.125 0 5.3125"
                        strokeWidth={1}
                      />
                      <path
                        id="Vector 2352"
                        stroke="#000000"
                        d="M7.5 9.6875V10.625"
                        strokeWidth={1}
                      />
                      <path
                        id="Rectangle 38"
                        stroke="#000000"
                        d="m1.5625 1.25 0 9.375 5.9375 3.125 5.9375 -3.125 0 -9.375 -11.875 0Z"
                        strokeWidth={1}
                      />
                    </g>
                  </svg>
                )}{" "}
                A special character
              </li>
            </ul>

            <button
              className={styles.button}
              onClick={resetPassword}
              disabled={loading}
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
