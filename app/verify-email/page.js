"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { toast } from "react-toastify";
import styles from "./page.module.css";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [token, setToken] = useState(""); // ✅ FIXED
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || !token) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/auth/verify-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, code }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Email verified successfully!");
        dispatch(setUser(data.user));
        setIsLoading(false);
        router.push("/complete-profile");
      } else {
        toast.error(data.message || "Verification failed.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`card ${styles.box}`}>
        <p className="paragraph-xl margin-bottom-sm">Verify your email</p>
        <p className="paragraph-md margin-bottom-md">
          A code has been sent to your email.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={styles.input}
            required
          />
          <button className={styles.button} type="submit">
            <span>{isLoading ? "Verifying..." : "Verify"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
