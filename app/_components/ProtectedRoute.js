"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "@/utils/checkAuth";
import { setUser } from "@/redux/authSlice";
import SplashScreen from "./SplashScreen";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const userData = await checkAuth();
      if (!userData) {
        router.push("/login");
      } else {
        dispatch(setUser(userData)); // This fills user in Redux
      }
      setLoading(false);
    };

    verify();
  }, [dispatch, router]);

  if (loading || (!user && typeof window !== "undefined")) {
    return <SplashScreen />;
  }

  return children;
}
