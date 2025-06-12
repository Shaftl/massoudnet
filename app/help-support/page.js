"use client";
import { useState } from "react";
import styles from "../../styles/HelpSupport.module.css";
import ProtectedRoute from "../_components/ProtectedRoute";
import { useSelector } from "react-redux";

export default function HelpSupport() {
  const currentUser = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/support",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else if (res.status === 429) {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(
          data.error || "You can only send one message every 24 hours."
        );
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <h1 className={styles.h1}>Help & Support</h1>

        {/* FAQ Section */}
        <section className={styles.faq}>
          <h2>Frequently Asked Questions</h2>

          {/* User Account */}
          <details className={styles.details}>
            <summary className={styles.summary}>
              How do I reset my password?
            </summary>
            <p>
              Go to your account settings → Security → Reset Password. You’ll
              get an email or SMS with instructions.
            </p>
          </details>
          <details className={styles.details}>
            <summary className={styles.summary}>
              How can I delete my account?
            </summary>
            <p>
              Contact support via the form below to request account deletion.
            </p>
          </details>

          {/* Profiles */}
          <details className={styles.details}>
            <summary className={styles.summary}>
              How can I change my profile privacy?
            </summary>
            <p>
              Go to Profile Settings → Privacy to control who can see your
              profile and posts.
            </p>
          </details>

          {/* Posts */}
          <details className={styles.details}>
            <summary className={styles.summary}>
              Why can’t I upload media?
            </summary>
            <p>
              Check your file type and size meet our upload guidelines.
              Supported formats: JPG, PNG, MP4, GIF.
            </p>
          </details>

          {/* Notifications */}
          <details className={styles.details}>
            <summary className={styles.summary}>
              Why am I not receiving notifications?
            </summary>
            <p>
              Make sure your notification settings allow alerts. Also, check
              device permissions.
            </p>
          </details>

          {/* Reporting */}
          <details className={styles.details}>
            <summary className={styles.summary}>
              How do I report abuse or inappropriate content?
            </summary>
            <p>
              Use the “Report” button on the post or user profile, or contact
              support here.
            </p>
          </details>
        </section>

        {/* Contact Form */}
        <section className={styles.formSection}>
          <h2>Need More Help? Contact Us!</h2>
          <p>
            If you don’t find an answer above, please send us a message below.
            We’re here to help you!
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              disabled
              style={{ opacity: "0.5" }}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              disabled
              style={{ opacity: "0.5" }}
            />
            <textarea
              name="message"
              placeholder="Describe your issue clearly, including usernames, dates, or error messages"
              value={formData.message}
              onChange={handleChange}
              required
              className={styles.textarea}
            ></textarea>
            <button
              className={styles.button}
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p className={`${styles.status} ${styles.success}`}>
                ✅ Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className={`${styles.status} ${styles.error}`}>
                ❌ {errorMessage}
              </p>
            )}
          </form>
        </section>
      </div>
    </ProtectedRoute>
  );
}
