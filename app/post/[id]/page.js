import React from "react";
import styles from "@/app/_components/Post.module.css";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

async function getPost(postId) {
  const res = await fetch(
    `https://massoudnet-backend.onrender.com/api/posts/${postId}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function SinglePostPage({ params }) {
  const post = await getPost(params.id);
  const formatTime = (ts) => dayjs(ts).fromNow();

  if (!post)
    return (
      <div className={styles.postContainerId}>
        <p className="paragraph-lg">❌ Post not found</p>
      </div>
    );

  const privacyLabel = (p) =>
    p === "friends"
      ? "👥 Friends"
      : p === "onlyMe"
      ? "🔒 Only Me"
      : "🌍 Public";

  return (
    <div className={`${styles.postContainer} ${styles.postContainerId}`}>
      <div className={`${styles.postBox}`}>
        <div className={`${styles.post} card ${styles.postIdNew}`}>
          <div className={styles.postSContainer}>
            <div className={`${styles.postUserInfo} just-flex`}>
              <div className={styles.postUserImg}>
                <img
                  src={post.author?.profilePic || "/profile.png"}
                  alt={post.author?.name || "User"}
                  width={40}
                  height={40}
                  className={styles.avatar}
                />
              </div>

              <div className={styles.userInfo}>
                <p className={`${styles.postUserName} paragraph-lg`}>
                  {post.author?.name}
                </p>
                <p className={`${styles.postsDate} paragraph-md muted`}>
                  {formatTime(post.createdAt)} · {privacyLabel(post.privacy)}
                </p>
              </div>
            </div>

            <div className={styles.postContent}>
              <p className={`paragraph-lg ${styles.postContentText}`}>
                {post.text}
              </p>

              {post.image && (
                <img
                  src={post.image}
                  alt="post media"
                  className={styles.postImg}
                />
              )}
              {post.video && (
                <video controls className={styles.postMedia}>
                  <source src={post.video} type="video/mp4" />
                </video>
              )}
            </div>

            <div className={`${styles.postStatus} just-flex`}>
              <div className={`${styles.statusBox} just-flex`}>
                <p className="paragraph-md strong">{post.likes.length}</p>
                <p className="paragraph-md">Likes</p>
              </div>

              <div className={`${styles.statusBox} just-flex`}>
                <p className="paragraph-md strong">
                  {post.comments?.length || 0}
                </p>
                <p className="paragraph-md">Comments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
