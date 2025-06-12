"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSocket } from "@/lib/socket";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import styles from "./Post.module.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import EditPostModal from "./EditPostModal";
import SpinnerMini from "./SpinnerMini";
import MediaModal from "./MediaModal";
import { useParams } from "next/navigation";

dayjs.extend(relativeTime);

export default function PostId() {
  const { id } = useParams();

  const [isCommentOpen, setIsCommentOpen] = useState(null);
  const [comment, setComment] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImageFile, setNewPostImageFile] = useState(null);
  const [postPrivacy, setPostPrivacy] = useState("public");
  const [posting, setPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPreview, setEditPreview] = useState(null);
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [editPrivacy, setEditPrivacy] = useState("public");
  const [isUpdating, setIsUpdating] = useState(false);

  const observer = useRef();
  const user = useSelector((state) => state.auth.user);
  const socket = getSocket();
  const userId = user?._id || null;
  const [editPostModal, setEditPostModal] = useState(false);
  const [isPostMoreOption, setIsPostMoreOption] = useState(null);

  // Media modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  const fetchPosts = async () => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/posts/user/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch {
      toast.error("Couldn't load posts");
    }
  };

  const handleSubmit = (postId) => {
    const trimmed = comment.trim();
    if (trimmed) {
      addComment(postId, trimmed);
      setComment("");
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const lastPostRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setPage((prev) => prev + 1);
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const toggleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const liked = post.likes.includes(userId);
          const likes = liked
            ? post.likes.filter((id) => id !== userId)
            : [...post.likes, userId];
          return { ...post, likes };
        }
        return post;
      })
    );
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/posts/like/${postId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const post = posts.find((p) => p._id === postId);
      if (post.author._id !== userId && !post.likes.includes(userId)) {
        socket.emit("sendNotification", {
          senderId: userId,
          receiverId: post.author._id,
          type: "like",
          postId,
        });
      }
    } catch {
      toast.error("Failed to update like");
    }
  };

  const addComment = async (postId, commentText) => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/posts/comment/${postId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: commentText }),
        }
      );
      if (!res.ok) throw new Error();
      const { comments } = await res.json();
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, comments } : post))
      );
      const post = posts.find((p) => p._id === postId);
      if (post.author._id !== userId) {
        socket.emit("sendNotification", {
          senderId: userId,
          receiverId: post.author._id,
          type: "comment",
          postId,
        });
      }
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/posts/comment/${postId}/${commentId}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!res.ok) throw new Error("Delete failed");
      const { comments } = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments } : p))
      );
      toast.success("Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/posts/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const savePostChanges = async (postId) => {
    setIsUpdating(true);
    let updated = { text: editText, privacy: editPrivacy };
    setUploadProgress(0);
    if (editMediaFile) {
      const result = await uploadToCloudinary(editMediaFile, setUploadProgress);
      if (editMediaFile.type.startsWith("video/")) {
        updated.video = result.secure_url;
        updated.image = null;
      } else {
        updated.image = result.secure_url;
        updated.video = null;
      }
    } else if (removeMedia) {
      updated.image = null;
      updated.video = null;
    }
    await fetch(`https://massoudnet-backend.onrender.com/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updated),
    });
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updated } : p))
    );

    setIsUpdating(false);
    setEditingPostId(null);
    setEditText("");
    setEditMediaFile(null);
    setEditPreview(null);
    setRemoveMedia(false);
    setUploadProgress(0);
    toast.success("Post updated");
  };

  const formatTime = (ts) => dayjs(ts).fromNow();
  const privacyLabel = (p) =>
    p === "friends"
      ? "👥 Friends"
      : p === "onlyMe"
      ? "🔒 Only Me"
      : "🌍 Public";
  const renderMedia = (img, vid) =>
    vid ? (
      <video
        controls
        className={styles.postMedia}
        style={{ cursor: "pointer" }}
        onClick={() => {
          setModalMedia([vid]);
          setModalIndex(0);
          setIsModalOpen(true);
        }}
      >
        <source src={vid} type="video/mp4" />
      </video>
    ) : img ? (
      <img
        src={img}
        alt="post media"
        className={styles.postImg}
        style={{ cursor: "pointer" }}
        onClick={() => {
          setModalMedia([img]);
          setModalIndex(0);
          setIsModalOpen(true);
        }}
      />
    ) : null;

  return (
    <div className={styles.postContainer}>
      {loading ? (
        <SpinnerMini />
      ) : posts.length === 0 ? (
        <p
          className="paragraph-lg muted"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          No posts yet.
        </p>
      ) : (
        <>
          {posts.map((post, i) => {
            const isLast = i === posts.length - 1;
            const isAuthor = userId === post.author._id;
            const liked = userId && post.likes.includes(userId);
            const editing = editingPostId === post._id;

            return (
              <div
                key={post._id}
                ref={isLast ? lastPostRef : null}
                className={styles.postBox}
              >
                <div className={`${styles.post} card`}>
                  <div className={styles.postSContainer}>
                    {isAuthor && (
                      <div className={`${styles.topRightIcons} just-flex `}>
                        {isPostMoreOption !== post._id ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Horizontal-Menu-Square--Streamline-Sharp"
                            height={18}
                            width={18}
                            onClick={() => setIsPostMoreOption(post._id)}
                          >
                            <g id="horizontal-menu-square--navigation-dots-three-square-button-horizontal-menu">
                              <path
                                id="Rectangle 893"
                                stroke="#000000"
                                d="M1.4058333333333333 1.4058333333333333h14.058333333333334v14.058333333333334H1.4058333333333333z"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 2975"
                                stroke="#000000"
                                d="M5.096145833333333 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 2976"
                                stroke="#000000"
                                d="M8.610729166666665 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 2977"
                                stroke="#000000"
                                d="M12.1253125 8.259270833333334h-0.3514583333333333v0.3514583333333333h0.3514583333333333v-0.3514583333333333Z"
                                strokeWidth={1.13}
                              />
                            </g>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Elipse-Frame--Streamline-Sharp"
                            height={18}
                            width={18}
                            onClick={() => setIsPostMoreOption(null)}
                          >
                            <desc>
                              {
                                "\n    Elipse Frame Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
                            <g id="elipse-frame">
                              <path
                                id="Ellipse 575"
                                stroke="#000000"
                                d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 1859"
                                stroke="#000000"
                                d="m3.5145833333333334 3.5145833333333334 9.840833333333332 9.840833333333332"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 1860"
                                stroke="#000000"
                                d="M3.5145833333333334 13.355416666666667 13.355416666666667 3.5145833333333334"
                                strokeWidth={1.13}
                              />
                            </g>
                          </svg>
                        )}
                      </div>
                    )}

                    <div className={`${styles.postUserInfo} just-flex`}>
                      <div className={styles.postUserImg}>
                        <img
                          src={post.author.profilePic || "/profile.png"}
                          alt={post.author.name || "User"}
                          width={40}
                          height={40}
                          className={styles.avatar}
                        />
                      </div>

                      <div className={styles.userInfo}>
                        <p className={`${styles.postUserName}  paragraph-lg`}>
                          {post.author.name}
                        </p>
                        <p className={`${styles.postsDate} paragraph-md muted`}>
                          {formatTime(post.createdAt)} ·{" "}
                          {!editing && privacyLabel(post.privacy)}
                        </p>
                      </div>
                    </div>

                    <div className={styles.postContent}>
                      {editing ? (
                        <>
                          <EditPostModal
                            editText={editText}
                            setEditText={setEditText}
                            editPrivacy={editPrivacy}
                            setEditPrivacy={setEditPrivacy}
                            editPreview={editPreview}
                            editMediaFile={editMediaFile}
                            setEditMediaFile={setEditMediaFile}
                            setEditPreview={setEditPreview}
                            removeMedia={removeMedia}
                            setRemoveMedia={setRemoveMedia}
                            post={post}
                            renderMedia={renderMedia}
                            uploadProgress={uploadProgress}
                            savePostChanges={savePostChanges}
                            setEditingPostId={setEditingPostId}
                            isUpdating={isUpdating}
                          />
                        </>
                      ) : (
                        <p className={`paragraph-lg ${styles.postContentText}`}>
                          {post.text}
                        </p>
                      )}
                      {!editing && renderMedia(post.image, post.video)}
                      {isAuthor && !editing && (
                        <>
                          {isPostMoreOption === post._id && (
                            <div className={styles.actions}>
                              <button
                                onClick={() => {
                                  setEditingPostId(post._id);
                                  setEditText(post.text);
                                  setEditPrivacy(post.privacy);
                                  setEditPostModal((e) => !e);
                                  setIsPostMoreOption(null);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  handleDeletePost(post._id);
                                  setIsPostMoreOption(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className={`${styles.postStatus} just-flex`}>
                      <div className={`${styles.statusBox} just-flex`}>
                        <div
                          className="just-flex"
                          onClick={() => userId && toggleLike(post._id)}
                          disabled={!userId}
                        >
                          {liked ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="-0.565 -0.565 18 18"
                              id="Like-1--Streamline-Sharp"
                              height={18}
                              width={18}
                              fill="#0067ff"
                            >
                              <g id="like-1--reward-social-up-rating-media-like-thumb-hand">
                                <path
                                  id="Vector 33"
                                  stroke="#0067ff"
                                  fill="#0067ff"
                                  d="M4.217499999999999 8.083541666666667 4.217499999999999 14.761249999999999"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 34"
                                  // stroke="#000000"
                                  d="M13.706875 14.761249999999999H1.4058333333333333v-6.677708333333333h2.8116666666666665L5.9747916666666665 2.1087499999999997h0.632625A2.5305 2.5305 0 0 1 9.137916666666666 4.63925V6.32625h6.32625l-1.7572916666666667 8.434999999999999Z"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="-0.565 -0.565 18 18"
                              id="Like-1--Streamline-Sharp"
                              height={18}
                              width={18}
                              fill="none"
                            >
                              <g id="like-1--reward-social-up-rating-media-like-thumb-hand">
                                <path
                                  id="Vector 33"
                                  stroke="#000000"
                                  d="M4.217499999999999 8.083541666666667 4.217499999999999 14.761249999999999"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 34"
                                  stroke="#000000"
                                  d="M13.706875 14.761249999999999H1.4058333333333333v-6.677708333333333h2.8116666666666665L5.9747916666666665 2.1087499999999997h0.632625A2.5305 2.5305 0 0 1 9.137916666666666 4.63925V6.32625h6.32625l-1.7572916666666667 8.434999999999999Z"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                          )}{" "}
                          <p className="paragraph-md strong">
                            {post.likes.length}
                          </p>
                        </div>
                      </div>

                      <div className={`${styles.statusBox} just-flex`}>
                        <div
                          className="just-flex"
                          onClick={() =>
                            setIsCommentOpen(
                              post._id !== isCommentOpen ? post._id : null
                            )
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Chat-Two-Bubbles-Oval--Streamline-Sharp"
                            height={18}
                            width={18}
                          >
                            <g id="chat-two-bubbles-oval--messages-message-bubble-chat-oval-conversation">
                              <path
                                id="Ellipse 331"
                                stroke="#000000"
                                d="M4.920416666666666 14.058333333333334H1.4058333333333333l1.4409791666666665 -2.3055666666666665A6.32625 6.32625 0 1 1 13.400403333333333 4.920416666666666"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Ellipse 332"
                                stroke="#000000"
                                d="M10.895208333333333 15.464166666666666a4.568958333333333 4.568958333333333 0 1 1 3.5286416666666662 -1.6659125L15.464166666666666 15.464166666666666l-4.568958333333333 0Z"
                                strokeWidth={1.13}
                              />
                            </g>
                          </svg>

                          <p className="paragraph-md strong">
                            {post.comments.length}
                          </p>
                        </div>
                      </div>

                      <div className={`${styles.statusBox} just-flex`}>
                        <div className="just-flex">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Link-Share-2--Streamline-Sharp"
                            height={18}
                            width={18}
                          >
                            <g id="link-share-2--create-hyperlink-link-make-unlink-square">
                              <path
                                id="Vector 1312"
                                stroke="#000000"
                                d="M8.434999999999999 3.5145833333333334H1.4058333333333333v11.949583333333333h11.949583333333333V8.434999999999999"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 1309"
                                stroke="#000000"
                                d="M7.029166666666667 9.840833333333332 15.464166666666666 1.4058333333333333"
                                strokeWidth={1.13}
                              />
                              <path
                                id="Vector 1310"
                                stroke="#000000"
                                d="M9.840833333333332 1.4058333333333333h5.623333333333333v5.623333333333333"
                                strokeWidth={1.13}
                              />
                            </g>
                          </svg>

                          <Link href={`/post/${post._id}`}>
                            <p className="paragraph-md">Share</p>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {isCommentOpen === post._id && (
                      <div className={styles.comments}>
                        {post.comments.map((c, idx) => (
                          <div
                            key={idx}
                            className={`${styles.commentItem} just-flex`}
                          >
                            <div
                              className={`${styles.commentItemUser} just-flex`}
                            >
                              <img
                                src={c.user.profilePic || "/profile.png"}
                                alt={c.user.name || "User"}
                                className={styles.commentAvatar}
                              />
                              <div className={styles.commentInfo}>
                                <p
                                  className={`${styles.commentName} just-flex`}
                                  style={{ gap: "0.6rem" }}
                                >
                                  <strong>{c.user.name}</strong>{" "}
                                  <span
                                    className={`${styles.postsDate} paragraph-md muted`}
                                    style={{ fontSize: "1.1rem" }}
                                  >
                                    {formatTime(c.createdAt)}
                                  </span>
                                </p>

                                <p
                                  className={`${styles.commentTextP} paragraph-md`}
                                >
                                  {" "}
                                  {c.text}
                                </p>

                                <p> </p>
                              </div>
                            </div>

                            {c.user._id === userId && (
                              <button
                                onClick={() => deleteComment(post._id, c._id)}
                                className={styles.deleteCommentBtn}
                                title="Delete comment"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="-0.565 -0.565 18 18"
                                  id="Recycle-Bin-2--Streamline-Sharp"
                                  height={16}
                                  width={16}
                                >
                                  <desc>
                                    {
                                      "\n    Recycle Bin 2 Streamline Icon: https://streamlinehq.com\n  "
                                    }
                                  </desc>
                                  <g id="recycle-bin-2--remove-delete-empty-bin-trash-garbage">
                                    <path
                                      id="Vector 2273"
                                      stroke="#000000"
                                      d="M0.7029166666666666 4.217499999999999h15.464166666666666"
                                      strokeWidth={1.13}
                                    />
                                    <path
                                      id="Rectangle 760"
                                      stroke="#000000"
                                      d="M2.8116666666666665 4.217499999999999h11.246666666666666v11.246666666666666H2.8116666666666665V4.217499999999999Z"
                                      strokeWidth={1.13}
                                    />
                                    <path
                                      id="Vector 2275"
                                      stroke="#000000"
                                      d="M6.32625 7.029166666666667v5.623333333333333"
                                      strokeWidth={1.13}
                                    />
                                    <path
                                      id="Vector 2277"
                                      stroke="#000000"
                                      d="M10.54375 7.029166666666667v5.623333333333333"
                                      strokeWidth={1.13}
                                    />
                                    <path
                                      id="Vector 2274"
                                      stroke="#000000"
                                      d="M5.623333333333333 4.217499999999999a2.8116666666666665 2.8116666666666665 0 0 1 5.623333333333333 0"
                                      strokeWidth={1.13}
                                    />
                                  </g>
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}

                        {post?.comments?.length === 0 && (
                          <p
                            className="paragraph-lg margin-bottom-sm just-flex"
                            style={{ paddingTop: "1rem" }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Video-Subtitles--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <desc>
                                {
                                  "\n    Video Subtitles Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="video-subtitles">
                                <path
                                  id="Rectangle 729"
                                  stroke="#000000"
                                  d="M14.761249999999999 1.7572916666666667 14.761249999999999 13.355416666666667 4.9202479666666665 13.355416666666667 2.1087499999999997 15.112708333333332l0 -13.355416666666667 12.6525 0Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2046"
                                  stroke="#000000"
                                  d="M4.217499999999999 8.434999999999999h4.920416666666666"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2047"
                                  stroke="#000000"
                                  d="M4.217499999999999 10.895208333333333h2.8116666666666665"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2048"
                                  stroke="#000000"
                                  d="M8.434999999999999 10.895208333333333h4.217499999999999"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2601"
                                  stroke="#000000"
                                  d="M12.6525 8.434999999999999h-2.1087499999999997"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>{" "}
                            No comment yet
                          </p>
                        )}

                        <div className={styles.addCommentArea}>
                          <textarea
                            placeholder="Add a comment..."
                            className={styles.commentInput}
                            disabled={!userId}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault(); // Prevent newline
                                handleSubmit(post._id);
                              }
                            }}
                          />

                          <button
                            className="btn"
                            onClick={() => handleSubmit(post._id)}
                            disabled={!comment.trim()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Mail-Send-Email-Message--Streamline-Sharp"
                              height={18}
                              width={18}
                            >
                              <desc>
                                {
                                  "\n    Mail Send Email Message Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="mail-send-email-message--send-email-paper-airplane-deliver">
                                <path
                                  id="Vector 2587"
                                  stroke="#fff"
                                  d="M2.1087499999999997 6.632721666666666 15.204087499999998 1.6659125 10.237981249999999 14.761249999999999l-2.70974375 -5.418784583333333L2.1087499999999997 6.632721666666666Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Vector 2588"
                                  stroke="#fff"
                                  d="m7.527534583333333 9.342465416666666 3.16101625 -3.16101625"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {isModalOpen && (
                  <MediaModal
                    media={modalMedia}
                    currentIndex={modalIndex}
                    onClose={() => setIsModalOpen(false)}
                    onNavigate={(newIndex) => setModalIndex(newIndex)}
                  />
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
