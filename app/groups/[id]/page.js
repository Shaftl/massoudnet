"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import styles from "./page.module.css";
// import { ReactSortable } from "react-sortablejs";
import MediaGrid from "@/app/_components/MediaGrid";
import MediaModal from "@/app/_components/MediaModal";

import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import GroupSettingsForm from "@/app/_components/GroupSettingsForm";
import SpinnerMini from "@/app/_components/SpinnerMini";
import Link from "next/link";
import CreatePostInGroup from "@/app/_components/CreatePostInGroup";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EditPostModalGroup from "@/app/_components/EditPostModalGroup";

dayjs.extend(relativeTime);

export default function SingleGroupPage() {
  const user = useSelector((state) => state.auth.user);
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const [postMedia, setPostMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [modalMedia, setModalMedia] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  // Edit Post State
  const [editExistingMedia, setEditExistingMedia] = useState([]); // Already uploaded media
  const [editPostMedia, setEditPostMedia] = useState([]); // New files
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isGroupSettingOpen, setIsGroupSettingOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(null);
  const [isPostMoreOption, setIsPostMoreOption] = useState(null);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState("");
  const [editPreview, setEditPreview] = useState(null);
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [joinRequest, setJoinRequest] = useState(false);
  const [triger, setTriger] = useState(null);

  const isLeader = group?.leader?._id === user?._id;
  const isMember = group?.members?.some((m) => m._id === user?._id);
  const userId = user?._id || null;

  // ───────────────────────────────────────────────────────
  // FETCH GROUP & POSTS
  // ───────────────────────────────────────────────────────

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/${groupId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch group");
      setGroup(data.data);
    } catch (err) {
      console.error("Error fetching group:", err.message);
    }
    setLoading(false);
  };

  const fetchGroupPosts = async () => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/${groupId}/posts`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
        const initialInputs = {};
        data.forEach((post) => (initialInputs[post._id] = ""));
        setCommentInputs(initialInputs);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    }
  };

  // ───────────────────────────────────────────────────────
  // HANDLERS: POSTS
  // ───────────────────────────────────────────────────────

  const handleEditPostSubmit = async (postId) => {
    setUploading(true);
    setEditUploadProgress(0);

    try {
      // Build the finalMedia array of length 0 or 1
      let finalMedia = [];

      if (!removeMedia) {
        if (editMediaFile) {
          // Upload the new file
          const result = await uploadToCloudinary(editMediaFile, (pct) => {
            setEditUploadProgress(pct);
          });
          if (result?.secure_url) {
            finalMedia = [result.secure_url];
          }
        } else if (editPreview) {
          // Keep the existing URL
          finalMedia = [editPreview];
        }
      }

      // Send the update
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            text: editPostText,
            media: finalMedia,
          }),
        }
      );

      if (!res.ok) throw new Error("Edit failed");

      // Reset state & reload posts
      setEditingPostId(null);
      setEditPostText("");
      setEditPreview(null);
      setEditMediaFile(null);
      setRemoveMedia(false);
      fetchGroupPosts();
    } catch (err) {
      console.error("Edit error:", err.message);
    }

    setUploading(false);
  };

  // ───────────────────────────────────────────────────────
  // HANDLERS: MEDIA
  // ───────────────────────────────────────────────────────

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setPostMedia(files);
    setUploadProgress(new Array(files.length).fill(0));
  };

  const handleEditMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setEditPostMedia(files);
    setEditUploadProgress(new Array(files.length).fill(0));
  };

  const removeExistingMedia = (index) => {
    setEditExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // ───────────────────────────────────────────────────────
  // HANDLERS: REACTIONS & COMMENTS
  // ───────────────────────────────────────────────────────

  const handleLike = async (postId) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      fetchGroupPosts();
    } catch (err) {
      console.error("Like error:", err.message);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}/unlike`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      fetchGroupPosts();
    } catch (err) {
      console.error("Unlike error:", err.message);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text }),
        }
      );
      if (!res.ok) throw new Error("Comment failed");

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchGroupPosts();
    } catch (err) {
      console.error("Comment error:", err.message);
    }
  };

  // ───────────────────────────────────────────────────────
  // HANDLERS: DELETE
  // ───────────────────────────────────────────────────────

  const handleDeletePost = async (postId) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      fetchGroupPosts();
    } catch (err) {
      console.error("Delete post error:", err.message);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      fetchGroupPosts();
    } catch (err) {
      console.error("Delete comment error:", err.message);
    }
  };

  // ───────────────────────────────────────────────────────
  // HANDLERS: MEMBERSHIP
  // ───────────────────────────────────────────────────────

  const handleKick = async (memberId) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/kick/${groupId}/${memberId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      fetchGroup();
    } catch (err) {
      console.error("Kick error:", err.message);
    }
  };

  const handleLeave = async () => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/leave/${groupId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to leave group");
      router.push("/groups");
    } catch (err) {
      console.error("Leave error:", err.message);
    }
  };

  // ───────────────────────────────────────────────────────
  // HANDLERS: JOIN / REQUEST FLOW (NEW)
  // ───────────────────────────────────────────────────────

  // Request to Join (private groups)
  const handleRequestJoin = async () => {
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/join/${groupId}`,
        { method: "POST", credentials: "include" }
      );
      const json = await res.json();
      alert(json.message || json.error);
      fetchGroup();
    } catch (err) {
      console.error("Request join error:", err);
    }
  };

  // Approve / Deny in settings (leader-only)
  const approveRequest = async (userId) => {
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/${groupId}/requests/${userId}/approve`,
      { method: "POST", credentials: "include" }
    );
    fetchGroup();
  };
  const denyRequest = async (userId) => {
    await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/${groupId}/requests/${userId}/deny`,
      { method: "POST", credentials: "include" }
    );
    fetchGroup();
  };

  // ───────────────────────────────────────────────────────
  // HANDLER: MEDIA VIEWER
  // ───────────────────────────────────────────────────────

  const openMediaViewer = (media, index) => {
    setModalMedia(media); // Set media for modal
    setModalIndex(index); // Set current media index
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm("Are you sure you want to delete this group and all its posts?")
    )
      return;
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/${group._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Group deleted.");
        router.push("/groups");
      } else {
        alert(data.message || "Failed to delete group");
      }
    } catch (err) {
      console.error("Delete group error:", err);
      alert("Something went wrong.");
    }
  };

  // ───────────────────────────────────────────────────────
  // EFFECTS
  // ───────────────────────────────────────────────────────

  const formatTime = (ts) => dayjs(ts).fromNow();

  useEffect(() => {
    if (user && groupId) {
      fetchGroup();
      fetchGroupPosts();
    }
  }, [groupId, user]);

  useEffect(() => {
    fetchGroupPosts();
  }, [triger]);

  // ───────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────

  if (loading)
    return (
      <div className={styles.container}>
        <SpinnerMini />
      </div>
    );
  if (!group) return <p className={styles.container}>Group not found</p>;

  return (
    <div className={styles.profile}>
      <div className="container">
        <div className={styles.coverPhoto}>
          <img
            src={`${group.bgCoverImage || "/default-bg.jpg"}`}
            alt="Conver photo"
          />
        </div>
        <div className={styles.container}>
          <div className={`${styles.profileInfo} just-flex gap-2`}>
            {group.coverImage && (
              <img
                src={group.coverImage}
                alt="Group Cover"
                className={styles.profileImg}
              />
            )}

            <div>
              <h3 className="heading-tertiary margin-bottom-sm">
                {group.name}
              </h3>
              <p className="paragraph-lg muted">{group.description}</p>
            </div>
          </div>

          <div className={`${styles.list} ${styles.listButtton}`}>
            <div className={styles.btnsList}>
              <button className={styles.buttonActive}>Posts</button>
              {/* <button className="">About</button> */}
            </div>

            <div className={styles.btnsList}>
              {group?.leader?._id === user?._id && (
                <button
                  onClick={handleDeleteGroup}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Group
                </button>
              )}

              {isMember && !isLeader && (
                <button className={styles.button} onClick={handleLeave}>
                  Leave Group
                </button>
              )}

              {isLeader && (
                <>
                  <button
                    className={styles.button}
                    onClick={() => {
                      setIsGroupSettingOpen(true);
                      setJoinRequest(false);
                    }}
                  >
                    Group Settings
                  </button>

                  <button
                    className={styles.button}
                    onClick={() => {
                      setIsGroupSettingOpen(true);
                      setJoinRequest(true);
                    }}
                  >
                    Review Join Requests
                  </button>

                  {isGroupSettingOpen && (
                    <div className={`${styles.overlaySettingsSection}`}>
                      <div className={styles.settingsSection}>
                        <button
                          className={`${styles.closeBtn}`}
                          onClick={() => setIsGroupSettingOpen(false)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Elipse-Frame--Streamline-Sharp"
                            height={18}
                            width={18}
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
                        </button>

                        <GroupSettingsForm
                          setIsGroupSettingOpen={setIsGroupSettingOpen}
                          group={group}
                          joinRequest={joinRequest}
                          setJoinRequest={setJoinRequest}
                          onSaved={() => {
                            fetchGroup();
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.userProfileContent}>
            <div className={`${styles.card} card`}>
              <p className="paragraph-xl strong margin-bottom-md">Intro</p>

              <p className="paragraph-lg margin-bottom-lg">
                {group?.description}
              </p>

              <div>
                <p className="paragraph-lg just-flex margin-bottom-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Shield-2--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <desc>
                      {
                        "\n    Shield 2 Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="shield-2--shield-protection-security-defend-crime-war-cover">
                      <path
                        id="Rectangle 38"
                        stroke="#000000"
                        d="m1.7572916666666667 2.460208333333333 0 9.489374999999999 6.677708333333333 3.5145833333333334 6.677708333333333 -3.5145833333333334 0 -9.489374999999999 -0.34724083333333333 0.10403166666666666a7.029166666666667 7.029166666666667 0 0 1 -5.918558333333333 -0.8842691666666667L8.434999999999999 1.4058333333333333l-0.74228 0.44564916666666665a7.029166666666667 7.029166666666667 0 0 1 -5.83912875 0.64106L1.7572916666666667 2.460208333333333Z"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  Leader:{" "}
                  <span className="strong-sm">{group.leader?.name}</span>
                </p>
              </div>

              <div>
                <p className="paragraph-lg just-flex margin-bottom-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="User-Single-Neutral-Male--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <desc>
                      {
                        "\n    User Single Neutral Male Streamline Icon: https://streamlinehq.com\n  "
                      }
                    </desc>
                    <g id="user-single-neutral-male--close-geometric-human-person-single-up-user-male">
                      <path
                        id="Ellipse 414"
                        stroke="#000000"
                        d="M8.434999999999999 11.246666666666666a13.995070833333333 13.995070833333333 0 0 0 -6.677708333333333 1.6841883333333332V15.464166666666666h13.355416666666667v-2.5333116666666666A13.995070833333333 13.995070833333333 0 0 0 8.434999999999999 11.246666666666666Z"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 1259"
                        stroke="#000000"
                        d="M4.920416666666666 5.623333333333333V2.1087499999999997h7.029166666666667v3.5145833333333334A3.5145833333333334 3.5145833333333334 0 0 1 4.920416666666666 5.623333333333333Z"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  Members:{" "}
                  <span className="strong-sm">{group?.members.length}</span>
                  <button
                    onClick={() => setIsMemberListOpen(!isMemberListOpen)}
                    className={styles.isMemberListOpenBtn}
                  >
                    {isMemberListOpen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="-0.565 -0.565 18 18"
                        id="Arrow-Turn-Down-Large--Streamline-Sharp"
                        height={18}
                        width={18}
                      >
                        <desc>
                          {
                            "\n    Arrow Turn Down Large Streamline Icon: https://streamlinehq.com\n  "
                          }
                        </desc>
                        <g id="arrow-turn-down-large--arrow-bend-curve-change-direction-return-down-large-head">
                          <path
                            id="Vector"
                            stroke="#000000"
                            d="m6.25666125 15.332721249999999 0 -9.674945A4.252645833333333 4.252645833333333 0 0 1 14.761249999999999 5.658479166666667l0 3.1701541666666664"
                            strokeWidth={1.13}
                          />
                          <path
                            id="Vector_2"
                            stroke="#000000"
                            d="m11.326799166666667 10.262583333333332 -5.0694349999999995 5.070137916666667 -5.070137916666667 -5.0694349999999995"
                            strokeWidth={1.13}
                          />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="-0.565 -0.565 18 18"
                        id="End-Point-Arrow--Streamline-Sharp"
                        height={18}
                        width={18}
                      >
                        <desc>
                          {
                            "\n    End Point Arrow Streamline Icon: https://streamlinehq.com\n  "
                          }
                        </desc>
                        <g id="end-point-arrow">
                          <path
                            id="Vector 4"
                            stroke="#000000"
                            strokeLinecap="square"
                            d="M1.4058333333333333 8.434999999999999h9.575130833333333"
                            strokeWidth={1.13}
                          />
                          <path
                            id="Vector 6"
                            stroke="#000000"
                            strokeLinecap="square"
                            d="M9.880196666666665 12.157646666666666 15.464166666666666 8.434999999999999l-5.58397 -3.722646666666667L11.121547499999998 8.434999999999999l-1.2413508333333332 3.722646666666667Z"
                            strokeWidth={1.13}
                          />
                        </g>
                      </svg>
                    )}
                  </button>
                </p>
              </div>

              {isMemberListOpen && (
                <ul className={styles.membersList}>
                  {group.members.map((member) => (
                    <li
                      key={member._id}
                      className={`${
                        member._id === group.leader._id
                          ? styles.leaderGroup
                          : ""
                      }`}
                    >
                      <Link
                        href={`/profile/${member?._id}`}
                        className="just-flex"
                      >
                        <img
                          src={member?.profilePic || "/profile.png"}
                          alt="Memper img"
                          className={styles.groupUserImg}
                        />

                        <p
                          className="paragraph-md just-flex"
                          style={{ gap: "0.6rem" }}
                        >
                          {member.name}
                          {"  "}
                          {member._id === group.leader._id && (
                            <span className="muted"> (Group Leader)</span>
                          )}

                          {member._id !== group.leader._id && (
                            <span className="muted"> (Member)</span>
                          )}
                        </p>
                      </Link>

                      {isLeader && member._id !== user._id && (
                        <button
                          className={styles.button}
                          onClick={() => handleKick(member._id)}
                        >
                          Kick
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.feed}>
              {(isMember || isLeader) && (
                <>
                  {/* <CreatePostInGroup /> */}
                  <CreatePostInGroup groupId={groupId} setTriger={setTriger} />

                  {/* Feed */}
                  <div className={styles.postContainer}>
                    {/*  */}
                    {posts.map((post) => (
                      <div key={post._id} className={styles.postBox}>
                        <div className={`${styles.post} card`}>
                          <div className={styles.postSContainer}>
                            {post.author?._id === user?._id && (
                              <div
                                className={`${styles.topRightIcons} just-flex `}
                              >
                                {isPostMoreOption !== post._id ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="-0.565 -0.565 18 18"
                                    id="Horizontal-Menu-Square--Streamline-Sharp"
                                    height={18}
                                    width={18}
                                    onClick={() =>
                                      setIsPostMoreOption(post._id)
                                    }
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
                                <p
                                  className={`${styles.postUserName}  paragraph-lg`}
                                >
                                  {post.author.name}
                                </p>
                                <p
                                  className={`${styles.postsDate} paragraph-md muted`}
                                >
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
                                  savePostChanges={() =>
                                    handleEditPostSubmit(post._id)
                                  }
                                  setEditingPostId={setEditingPostId}
                                  isUpdating={uploading}
                                />
                              ) : (
                                <>
                                  <p
                                    className={`paragraph-lg ${styles.postContentText}`}
                                  >
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
                                      onNavigate={(newIndex) =>
                                        setModalIndex(newIndex)
                                      }
                                    />
                                  )}

                                  <div
                                    className={`${styles.postStatus} just-flex`}
                                  >
                                    <div
                                      className={`${styles.statusBox} just-flex`}
                                    >
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
                                                fill={
                                                  hasLiked ? "#0067ff" : "none"
                                                }
                                                stroke={
                                                  hasLiked ? "#0067ff" : "#000"
                                                }
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

                                    <div
                                      className={`${styles.statusBox} just-flex`}
                                    >
                                      <div
                                        className="just-flex"
                                        onClick={() =>
                                          setIsCommentOpen(
                                            post._id === isCommentOpen
                                              ? null
                                              : post._id
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

                                    <div
                                      className={`${styles.statusBox} just-flex`}
                                    >
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
                                                setEditPreview(
                                                  post.media?.[0] || null
                                                );
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
                                    <div
                                      className={`${styles.commentItemUser} just-flex`}
                                    >
                                      <img
                                        src={
                                          c?.author?.profilePic ||
                                          "/profile.png"
                                        }
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

                                        <p
                                          className={`${styles.commentTextP} paragraph-md`}
                                        >
                                          {" "}
                                          {c.text}
                                        </p>

                                        <p> </p>
                                      </div>
                                    </div>
                                    {c.author?._id === user?._id && (
                                      <button
                                        onClick={() =>
                                          handleDeleteComment(post._id, c._id)
                                        }
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
                                      handleComment(
                                        post._id,
                                        commentInputs[post._id]
                                      );
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
                </>
              )}

              {/* Join / Request to Join */}
              {!isMember &&
                !isLeader &&
                (group.privacy === "private" ? (
                  <>
                    <p className="paragraph-lg">
                      To see group content you should join group
                    </p>
                    <button
                      className={styles.buttonJoin}
                      onClick={handleRequestJoin}
                    >
                      Request to Join
                    </button>
                  </>
                ) : (
                  <>
                    <p className="paragraph-lg">
                      To see group content you should join group
                    </p>
                    <button
                      className={styles.buttonJoin}
                      onClick={() => handleRequestJoin(groupId)}
                    >
                      Join Group
                    </button>
                  </>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
