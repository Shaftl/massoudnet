"use client";
import React, { useState, useEffect, Suspense } from "react";
import StoryUpload from "@/app/_components/StoryUpload";
import StoryViewer from "@/app/_components/StoryViewer";
import StoryFeed from "@/app/_components/StoryFeed";
import styles from "./Story.module.css";
import SpinnerMini from "./SpinnerMini";

const StoriesPage = () => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [stories, setStories] = useState([]);
  const [triger, setTriger] = useState(null);

  const handleReload = async () => {
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/stories/feed",
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to load stories");
        return;
      }

      const data = await res.json(); // flat array
      const grouped = {};
      for (let story of data) {
        if (!story.user || !story.user._id) continue;

        const userId = story.user._id;
        if (!grouped[userId]) {
          grouped[userId] = {
            user: story.user,
            stories: [],
          };
        }
        grouped[userId].stories.push(story);
      }

      setStories(Object.values(grouped));
    } catch (err) {
      console.error("Error loading stories:", err);
    }
  };

  // Called when a story thumbnail is clicked
  const handleOpenStory = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  useEffect(() => {
    handleReload();
  }, []);

  return (
    <div className={styles.story}>
      <div className={styles.storyContainer}>
        <StoryUpload onStoryUploaded={handleReload} setTriger={setTriger} />
        <Suspense fallback={<SpinnerMini />}>
          <StoryFeed
            stories={stories}
            onOpenStory={handleOpenStory}
            triger={triger}
          />
        </Suspense>
      </div>
      {viewerOpen && (
        <StoryViewer
          stories={stories}
          currentUserIndex={viewerIndex}
          triger={triger}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default StoriesPage;
