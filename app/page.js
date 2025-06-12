"use client";

import { Suspense } from "react";
import FeedPage from "./_components/FeedPage";
import ProtectedRoute from "./_components/ProtectedRoute";
import SideThree from "./_components/SideThree";
import UserProfileCard from "./_components/UserProfileCard";
import styles from "./page.module.css";
import SpinnerMini from "./_components/SpinnerMini";

function page() {
  return (
    <ProtectedRoute>
      <div className={`${styles.mainContainer} container`}>
        <Suspense fallback={<SpinnerMini />}>
          <UserProfileCard />
        </Suspense>

        <FeedPage />

        <SideThree />
      </div>
    </ProtectedRoute>
  );
}

export default page;
