import { useState } from "react";
import { Suspense } from "react";
import CreatePost from "./CreatePost";
import styles from "./FeedPage.module.css";
import GroupFeed from "./GroupPost";
import Post from "./Post";
import Story from "./Story";
import SpinnerMini from "./SpinnerMini";

function FeedPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className={styles.feedPage}>
      <Suspense fallback={<SpinnerMini />}>
        <CreatePost onPostCreated={handlePostCreated} />
      </Suspense>

      <Suspense fallback={<SpinnerMini />}>
        <Story />
      </Suspense>

      <Suspense fallback={<SpinnerMini />}>
        <GroupFeed />
      </Suspense>

      <Suspense fallback={<SpinnerMini />}>
        {/* Pass the trigger prop */}
        <Post refreshTrigger={refreshTrigger} />
      </Suspense>
    </div>
  );
}

export default FeedPage;
