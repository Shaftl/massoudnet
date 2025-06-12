"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/authSlice";
import { checkAuth } from "@/utils/checkAuth";
import { toast } from "react-toastify";
import styles from "./page.module.css";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true); // 👁️ toggle state

  const [pwChecks, setPwChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false,
    special: false,
  });

  const router = useRouter();
  const dispatch = useDispatch();

  const today = new Date();
  const minAge = 13;
  const earliestYear = 1900;
  const maxDate = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  const minDate = `${earliestYear}-01-01`;

  const regexes = {
    length: /.{8,}/,
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    digit: /\d/,
    special: /[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]/,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPwChecks({
        length: regexes.length.test(value),
        lowercase: regexes.lowercase.test(value),
        uppercase: regexes.uppercase.test(value),
        digit: regexes.digit.test(value),
        special: regexes.special.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, dob, gender } = form;

    if (!firstName || !lastName || !email || !password || !dob || !gender) {
      return toast.error("Please fill out all fields.");
    }

    if (Object.values(pwChecks).some((ok) => !ok)) {
      return toast.error("Please satisfy all password requirements.");
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification code sent! Check your email.");
        router.push(`/verify-email?token=${encodeURIComponent(data.token)}`);
      } else {
        toast.error(data.error || "Registration failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth().then((user) => {
      if (user) router.push("/home");
    });
  }, [router]);

  return (
    <div className={styles.loginWrapper}>
      <div className={`card ${styles.loginBox}`}>
        <div className={`${styles.logo} just-flex`}>
          <img src="/black-logo.png" alt="Company Logo" />
        </div>

        <h1 className="heading-primary margin-bottom-xl">
          Create a new account
        </h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* First & Last Name */}
          <div className="grid grid--2-cols sm-gap">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              className={styles.input}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              className={styles.input}
              onChange={handleChange}
              required
            />
          </div>

          {/* DOB & Gender */}
          <div className="grid grid--2-cols sm-gap">
            <input
              type="date"
              name="dob"
              className={styles.input}
              onChange={handleChange}
              required
              min={minDate}
              max={maxDate}
              style={{ fontSize: "1.5rem", padding: "1.2rem 1.8rem" }}
            />
            <fieldset className={styles.input}>
              <legend>Gender</legend>
              <div className="grid grid--3-cols">
                {["Female", "Male", "Custom"].map((g) => (
                  <label key={g}>
                    <input
                      type="radio"
                      name="gender"
                      value={g.toLowerCase()}
                      onChange={handleChange}
                      checked={form.gender === g.toLowerCase()}
                      required
                    />{" "}
                    {g}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={styles.input}
            onChange={handleChange}
            required
          />

          {/* Password with Show/Hide */}
          <div style={{ marginBottom: "1rem", position: "relative" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              className={styles.input}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                top: "12%",
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

            {/* Checklist */}
            <ul className={styles.checkList}>
              {[
                ["length", "At least 8 characters"],
                ["lowercase", "A lowercase letter"],
                ["uppercase", "An uppercase letter"],
                ["digit", "A number"],
                ["special", "A special character"],
              ].map(([key, label]) => (
                <li
                  key={key}
                  className={styles.checkListItem}
                  style={{ color: pwChecks[key] ? "green" : "inherit" }}
                >
                  {pwChecks[key] ? (
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
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? (
              <span>
                <span className={styles.spinner}></span> Signing Up...
              </span>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <p className="paragraph-md" style={{ textAlign: "center" }}>
          Already have an account
          <Link href="/login" className={styles.registerLink}>
            Login
          </Link>{" "}
        </p>
      </div>
    </div>
  );
}
