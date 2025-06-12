// components/AdminSupportMessages.jsx
"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/AdminSupport.module.css";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PuzzleLogin from "@/app/_components/PuzzleLogin";
import PatternLock from "@/app/_components/PatternLock";

export default function AdminSupportMessages() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user && user._id !== "683896af024f013387ef6920") {
      toast.error("Don't touch in higer switches");
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (step !== 3 || !user) return;
    (async () => {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/support",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setMessages(data || []);
      setLoading(false);
    })();
  }, [step, user]);

  if (step === 1) return <PuzzleLogin onSuccess={() => setStep(2)} />;
  if (step === 2) return <PatternLock onSuccess={() => setStep(3)} />;
  if (!user) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Support Messages</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div key={msg._id} className={styles.card}>
              <h3>{msg.name}</h3>
              <p>
                <strong>Email:</strong> {msg.email}
              </p>
              <p>
                <strong>Message:</strong> {msg.message}
              </p>
              <p className={styles.date}>
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
