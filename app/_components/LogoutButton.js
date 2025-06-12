"use client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import Button from "./Button";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("https://massoudnet-backend.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    dispatch(logout());
    router.push("/login");
  };

  return (
    <Button color="#ff423d" onClick={handleLogout}>
      {/* <LogOut size={16} /> */}
    </Button>
  );
}
