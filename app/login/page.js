"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/authSlice";
import { checkAuth } from "@/utils/checkAuth";
import { toast } from "react-toastify";
import Link from "next/link";

import styles from "./page.module.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Start spinner

    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",

          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (res.ok) {
        dispatch(setUser(data.user));
        router.push("/");
      } else {
        toast.error(data.message); // ✅ Now shows: "Email not found." or "Incorrect password."
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false); // ✅ Stop spinner
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
    <div className={styles.loginWrapper}>
      <div className={`card ${styles.loginBox}`}>
        <div className={`${styles.logo} just-flex`}>
          <img src="/black-logo.png" alt="Company Logo" />
        </div>

        <h1 className="heading-primary margin-bottom-xl">
          Log into MassoudNet
        </h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            className={styles.input}
            name="email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            name="password"
            onChange={handleChange}
            required
          />

          <div>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <button
            className={`${styles.button}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className={styles.spinner}></span> Logging in...
              </span>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <p className="paragraph-md" style={{ textAlign: "center" }}>
          Don&apos;t have an account?
          <Link href="/register" className={styles.registerLink}>
            {" "}
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
