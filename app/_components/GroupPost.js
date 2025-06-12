"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./GroupPost.module.css";
import MediaGrid from "@/app/_components/MediaGrid";
import MediaModal from "@/app/_components/MediaModal";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import EditPostModalGroup from "./EditPostModalGroup";

dayjs.extend(relativeTime);

export default function GroupFeed() {
  const user = useSelector((s) => s.auth.user);
  const userId = user?._id || null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [modalMedia, setModalMedia] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  // Edit-post state
  const [uploading, setUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState("");
  const [editPreview, setEditPreview] = useState(null);
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(null);
  const [isPostMoreOption, setIsPostMoreOption] = useState(null);
  const [checkGroupImg, setCheckGroupImg] = useState("");

  // Fetch feed
  const fetchFeed = async () => {
    const res = await fetch(
      "https://massoudnet-backend.onrender.com/api/feed/group-posts",
      {
        credentials: "include",
      }
    );
    const data = await res.json();
    setPosts(data);
    // init comments
    const inputs = {};
    data.forEach((p) => (inputs[p._id] = ""));
    setCommentInputs(inputs);
  };

  useEffect(() => {
    (async () => {
      await fetchFeed();
      setLoading(false);
    })();
  }, []);

  // Reactions & actions
  const handleLike = (postId) => toggleLike(postId, true);
  const handleUnlike = (postId) => toggleLike(postId, false);
  const toggleLike = async (id, like = true) => {
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/posts/${id}/${
        like ? "like" : "unlike"
      }`,
      { method: "POST", credentials: "include" }
    );
    fetchFeed();
  };

  const handleComment = async (postId, text) => {
    if (!text?.trim()) return;
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}/comments`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    setCommentInputs((c) => ({ ...c, [postId]: "" }));
    fetchFeed();
  };

  const handleDeleteComment = async (postId, commentId) => {
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}/comments/${commentId}`,
      { method: "DELETE", credentials: "include" }
    );
    fetchFeed();
  };

  const handleDeletePost = async (postId) => {
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    fetchFeed();
  };

  const openMediaViewer = (media, index) => {
    setModalMedia(media);
    setModalIndex(index);
  };

  const handleEditPostSubmit = async (postId) => {
    setUploading(true);
    setEditUploadProgress(0);
    let finalMedia = [];
    if (!removeMedia) {
      if (editMediaFile) {
        const result = await uploadToCloudinary(editMediaFile, (pct) => {
          setEditUploadProgress(pct);
        });
        if (result?.secure_url) finalMedia = [result.secure_url];
      } else if (editPreview) {
        finalMedia = [editPreview];
      }
    }
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editPostText, media: finalMedia }),
      }
    );
    setEditingPostId(null);
    setEditPostText("");
    setEditPreview(null);
    setEditMediaFile(null);
    setRemoveMedia(false);
    setUploading(false);
    fetchFeed();
  };

  useEffect(
    function () {
      console.log(checkGroupImg);
    },
    [checkGroupImg]
  );

  const formatTime = (ts) => dayjs(ts).fromNow();

  if (loading) return <p>Loading…</p>;
  // if (!posts?.length) return <p>No posts yet.</p>;

  return (
    <div className={styles.feedContainer}>
      {posts.map((post) => (
        <div key={post._id} className={styles.postBox}>
          <div
            className={`${styles.post} card`}
            onClick={() => setCheckGroupImg(post?.group)}
          >
            <div className={styles.postSContainer}>
              {post.author?._id === user?._id && (
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
                <div className={styles.postUserImgAndGroup}>
                  <img src={`${post?.group?.coverImage}`} alt="Group picture" />
                  <img src={`${post?.author?.profilePic}`} alt="User Profile" />
                </div>

                <div className={styles.userInfo}>
                  <p className={`${styles.postUserName}  paragraph-lg`}>
                    <span className="strong">{post.group.name}</span> ||{" "}
                    {post.author.name}
                  </p>
                  <p className={`${styles.postsDate} paragraph-md muted`}>
                    {formatTime(post.createdAt)} ·{" "}
                  </p>
                </div>
              </div>

              <div className={styles.postContent}>
                {/* Edit Mode */}
                {editingPostId === post._id ? (
                  <EditPostModalGroup
                    post={post}
                    uploadProgress={editUploadProgress}
                    editText={editPostText}
                    setEditText={setEditPostText}
                    editPreview={editPreview}
                    setEditPreview={setEditPreview}
                    editMediaFile={editMediaFile}
                    setEditMediaFile={setEditMediaFile}
                    removeMedia={removeMedia}
                    setRemoveMedia={setRemoveMedia}
                    savePostChanges={() => handleEditPostSubmit(post._id)}
                    setEditingPostId={setEditingPostId}
                    isUpdating={uploading}
                  />
                ) : (
                  <>
                    <p className={`paragraph-lg ${styles.postContentText}`}>
                      {post.text}
                    </p>

                    <MediaGrid
                      media={post.media}
                      onMediaClick={(index) =>
                        openMediaViewer(post.media, index)
                      }
                    />

                    {modalMedia.length > 0 && (
                      <MediaModal
                        media={modalMedia}
                        currentIndex={modalIndex}
                        onClose={() => setModalMedia([])}
                        onNavigate={(newIndex) => setModalIndex(newIndex)}
                      />
                    )}

                    <div className={`${styles.postStatus} just-flex`}>
                      <div className={`${styles.statusBox} just-flex`}>
                        {(() => {
                          const hasLiked = post.likes?.some(
                            (likeId) => likeId === userId
                          );
                          return (
                            <>
                              <button
                                onClick={() =>
                                  hasLiked
                                    ? handleUnlike(post._id)
                                    : handleLike(post._id)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "0",
                                  margin: "0",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="-0.565 -0.565 18 18"
                                  height={18}
                                  width={18}
                                  fill={hasLiked ? "#0067ff" : "none"}
                                  stroke={hasLiked ? "#0067ff" : "#000"}
                                >
                                  {/* same paths as before */}
                                  <g id="like-1--...">
                                    <path
                                      id="Vector 33"
                                      d="M4.2175 8.0835L4.2175 14.7612"
                                    />
                                    <path
                                      id="Vector 34"
                                      d="M13.7069 14.7612H1.4058V8.0835h2.8117L5.9748 2.1087h0.6326A2.5305 2.5305 0 0 1 9.1379 4.6393V6.3263h6.3263l-1.7573 8.435Z"
                                    />
                                  </g>
                                </svg>
                              </button>

                              <p className="paragraph-md strong">
                                {post.likes?.length || 0}
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      <div className={`${styles.statusBox} just-flex`}>
                        <div
                          className="just-flex"
                          onClick={() =>
                            setIsCommentOpen(
                              post._id === isCommentOpen ? null : post._id
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

                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {/* Like / Unlike / Edit / Delete */}

                      {post.author?._id === user?._id && (
                        <>
                          {isPostMoreOption === post._id && (
                            <div className={styles.actions}>
                              <button
                                onClick={() => {
                                  setEditingPostId(post._id);
                                  setEditPostText(post.text);
                                  // load the first existing image/video URL (if any)
                                  setEditPreview(post.media?.[0] || null);
                                  setEditMediaFile(null);
                                  setRemoveMedia(false);
                                  setEditUploadProgress(0);
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
                  </>
                )}
              </div>

              {isCommentOpen === post._id && (
                <div className={styles.comments}>
                  {/* Comments */}

                  {post.comments?.map((c, idx) => (
                    <div
                      key={idx}
                      className={`${styles.commentItem} just-flex`}
                    >
                      <div className={`${styles.commentItemUser} just-flex`}>
                        <img
                          src={c?.author?.profilePic || "/profile.png"}
                          alt={c.author?.name || "User"}
                          className={styles.commentAvatar}
                        />

                        <div className={styles.commentInfo}>
                          <p
                            className={`${styles.commentName} just-flex`}
                            style={{ gap: "0.6rem" }}
                          >
                            <strong>{c.author?.name}</strong>
                            <span
                              className={`${styles.postsDate} paragraph-md muted`}
                              style={{ fontSize: "1.1rem" }}
                            >
                              {formatTime(c.createdAt)}
                            </span>
                          </p>

                          <p className={`${styles.commentTextP} paragraph-md`}>
                            {" "}
                            {c.text}
                          </p>

                          <p> </p>
                        </div>
                      </div>
                      {c.author?._id === user?._id && (
                        <button
                          onClick={() => handleDeleteComment(post._id, c._id)}
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
                      value={commentInputs[post._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleComment(post._id, commentInputs[post._id]);
                      }}
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
        </div>
      ))}
    </div>
  );
}
