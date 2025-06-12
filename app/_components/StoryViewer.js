"use client";
import React, { useEffect, useState } from "react";

const StoryViewer = ({ stories, currentUserIndex, onClose }) => {
  const [current, setCurrent] = useState(0);

  const storyGroup = stories?.[currentUserIndex];
  const story = storyGroup?.stories?.[current];

  useEffect(() => {
    if (!storyGroup || !storyGroup.stories?.length) return;

    const timer = setTimeout(() => {
      nextStory();
    }, 4000);

    return () => clearTimeout(timer);
  }, [current, storyGroup]);

  const nextStory = () => {
    if (current < storyGroup.stories.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      onClose(); // All stories viewed
    }
  };

  if (!story) return null;

  return (
    <div
      onClick={nextStory}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          gap: 5,
        }}
      >
        {storyGroup?.stories?.map((_, i) => (
          <div
            key={i}
            style={{
              height: 4,
              flex: 1,
              backgroundColor: i <= current ? "#fff" : "#555",
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </div>

      <h4 style={{ color: "white", marginBottom: 10 }}>
        {storyGroup?.user?.username}
      </h4>

      {story?.mediaType === "image" ? (
        <img
          src={story.mediaUrl}
          alt="story"
          style={{ maxHeight: "80vh", maxWidth: "100%" }}
        />
      ) : (
        <video
          src={story?.mediaUrl}
          controls
          autoPlay
          style={{ maxHeight: "80vh" }}
        />
      )}
    </div>
  );
};

export default StoryViewer;
