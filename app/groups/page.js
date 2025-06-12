"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import styles from "./page.module.css";
import ProtectedRoute from "../_components/ProtectedRoute";

export default function GroupsPage() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create-group form state
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [coverFile, setCoverFile] = useState(null);
  const [bgCoverFile, setBgCoverFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── ADD ───────────────────────────────────────────────────────────────────
  // which tab is active: “your” or “suggested”
  const [activeTab, setActiveTab] = useState("all");
  // ────────────────────────────────────────────────────────────────────────────

  // ** New: multi-step state **
  const [step, setStep] = useState(1);

  // Fetch all groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/groups",
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      setGroups(res.ok && Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Join public or request private
  const handleJoinOrRequest = async (group) => {
    const endpoint = `https://massoudnet-backend.onrender.com/api/groups/join/${group._id}`;
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });
    const json = await res.json();
    alert(json.message || json.error);

    if (res.ok) {
      // 1) Optimistically add current user to that group’s members
      setGroups((prev) =>
        prev.map((g) =>
          g._id === group._id ? { ...g, members: [...g.members, user] } : g
        )
      );

      // 2) Switch into the "joined" tab so you see it immediately

      // once you’ve successfully joined, flip to the “joined” tab
      // setActiveTab("joined");
    }

    fetchGroups();
  };

  // Leave group
  const handleLeave = async (groupId) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/leave/${groupId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      fetchGroups();
    } catch (err) {
      console.error("Leave error:", err);
    }
  };

  // Create a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      let coverUrl = "";
      let bgUrl = "";

      if (coverFile) {
        const resp = await uploadToCloudinary(coverFile);
        coverUrl = resp.secure_url;
      }
      if (bgCoverFile) {
        const resp = await uploadToCloudinary(bgCoverFile);
        bgUrl = resp.secure_url;
      }

      const res = await fetch(
        "https://massoudnet-backend.onrender.com/api/groups/create",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: groupName,
            description: groupDesc,
            privacy,
            coverImage: coverUrl,
            bgCoverImage: bgUrl,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create group");

      // Reset & reload
      setGroupName("");
      setGroupDesc("");
      setPrivacy("public");
      setCoverFile(null);
      setBgCoverFile(null);
      setStep(1);
      setIsCreateGroup(false);
      fetchGroups();
      router.push(`/groups/${json.data._id}`);
    } catch (err) {
      console.error("Error creating group:", err);
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const cancelCreate = () => {
    setStep(1);
    setIsCreateGroup(false);
    setGroupName("");
    setGroupDesc("");
    setPrivacy("public");
    setCoverFile(null);
    setBgCoverFile(null);
  };

  // Ensure step resets when modal opens
  const openCreateModal = () => {
    setStep(1);
    setIsCreateGroup(true);
  };

  const allGroups = groups;
  const createdGroups = groups.filter((g) => g.leader._id === user._id);
  const joinedGroups = groups.filter((g) => {
    if (g.leader._id === user._id) return false;
    return g.members.some(
      (m) => (typeof m === "string" ? m : m._id) === user._id
    );
  });
  const suggestedGroups = groups.filter((g) => {
    if (g.leader._id === user._id) return false;
    return !g.members.some(
      (m) => (typeof m === "string" ? m : m._id) === user._id
    );
  });

  let displayedGroups;
  if (activeTab === "all") displayedGroups = allGroups;
  else if (activeTab === "created") displayedGroups = createdGroups;
  else if (activeTab === "joined") displayedGroups = joinedGroups;
  else if (activeTab === "suggested") displayedGroups = suggestedGroups;
  else displayedGroups = allGroups;

  const filteredGroups = displayedGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <div className="container">
        <div className={styles.container}>
          <div className={`${styles.sidebar} ${styles.cardBox} card`}>
            <h3 className="heading-tertiary margin-bottom-lg">Groups</h3>
            <button
              className={styles.createSidebarButton}
              onClick={openCreateModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Story-Post--Streamline-Sharp"
                height={18}
                width={18}
              >
                <g id="story-post">
                  <path
                    id="Vector 1366"
                    stroke="#000000"
                    d="M8.434999999999999 5.271875v6.32625M5.271875 8.434999999999999h6.32625"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Ellipse 445"
                    stroke="#000000"
                    d="M1.4058333333333333 8.434999999999999c0 3.8822087499999998 3.1469579166666666 7.029166666666667 7.029166666666667 7.029166666666667s7.029166666666667 -3.1469579166666666 7.029166666666667 -7.029166666666667S12.317208749999999 1.4058333333333333 8.434999999999999 1.4058333333333333"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Ellipse 446"
                    stroke="#000000"
                    d="M1.5464166666666668 7.029166666666667c0.11879291666666666 -0.5834208333333333 0.3092833333333333 -1.1408337499999999 0.5623333333333334 -1.661695"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Ellipse 448"
                    stroke="#000000"
                    d="M4.217499999999999 2.8116666666666665a7.069935833333333 7.069935833333333 0 0 0 -1.4058333333333333 1.4051304166666667"
                    strokeWidth={1.13}
                  />
                  <path
                    id="Ellipse 449"
                    stroke="#000000"
                    d="M7.029166666666667 1.5464166666666668c-0.5834208333333333 0.11809 -1.1408337499999999 0.3092833333333333 -1.661695 0.5623333333333334"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>{" "}
              Create New Group
            </button>

            <div className={styles.sidebarNav}>
              {/* All Groups */}
              <div
                className={`just-flex ${
                  activeTab === "all" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("all")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                  height={18}
                  width={18}
                >
                  <path
                    stroke="#000"
                    d="M3 5h12M3 9h12M3 13h12"
                    strokeWidth="1.5"
                  />
                </svg>
                <p className="paragraph-md">All Groups</p>
              </div>

              {/* Your Created */}
              <div
                className={`just-flex ${
                  activeTab === "created" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("created")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                  height={18}
                  width={18}
                >
                  <g>
                    <path
                      stroke="#000"
                      d="M1 8.8l4.9 4.9L15 5"
                      strokeWidth="1.13"
                    />
                  </g>
                </svg>
                <p className="paragraph-md">Your Created</p>
              </div>

              {/* Groups I’m In */}
              <div
                className={`just-flex ${
                  activeTab === "joined" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("joined")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="-0.565 -0.565 18 18"
                  id="User-Multiple-Circle--Streamline-Sharp"
                  height={18}
                  width={18}
                >
                  <desc>
                    {
                      "\n    User Multiple Circle Streamline Icon: https://streamlinehq.com\n  "
                    }
                  </desc>
                  <g id="user-multiple-circle--close-geometric-human-multiple-person-up-user-circle">
                    <path
                      id="Ellipse 350"
                      stroke="#000000"
                      d="M1.4058333333333333 8.434999999999999a7.029166666666667 7.029166666666667 0 1 0 14.058333333333334 0 7.029166666666667 7.029166666666667 0 1 0 -14.058333333333334 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 418"
                      stroke="#000000"
                      d="M3.6678191666666664 6.7325358333333325a2.0321320833333334 2.0321320833333334 0 1 0 4.064264166666667 0 2.0321320833333334 2.0321320833333334 0 1 0 -4.064264166666667 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 419"
                      stroke="#000000"
                      d="M9.884414166666666 8.468037083333334a1.7355012499999998 1.7355012499999998 0 1 0 3.4710024999999995 0 1.7355012499999998 1.7355012499999998 0 1 0 -3.4710024999999995 0"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 417"
                      stroke="#000000"
                      d="M9.074654166666667 15.200572916666665v-3.9124341666666664a8.095491249999998 8.095491249999998 0 0 0 -3.482952083333333 -0.7823462499999999c-1.24627125 0 -2.42717125 0.2811666666666667 -3.482952083333333 0.7823462499999999"
                      strokeWidth={1.13}
                    />
                    <path
                      id="Ellipse 420"
                      stroke="#000000"
                      d="M13.8544875 12.894303333333333c-0.8688049999999999 -0.3922275 -1.9273974999999999 -0.65160375 -2.943815 -0.65160375 -0.63473375 0 -1.2490829166666666 0.08505291666666666 -1.8339095833333332 0.24531791666666664"
                      strokeWidth={1.13}
                    />
                  </g>
                </svg>
                <p className="paragraph-md">Groups I’m In</p>
              </div>

              {/* Suggested for You */}
              <div
                className={`just-flex ${
                  activeTab === "suggested" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("suggested")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                  height={18}
                  width={18}
                >
                  <g>
                    <path
                      stroke="#000"
                      d="M1.4 8.4a6.9 6.9 0 1113.8 0 6.9 6.9 0 01-13.8 0z"
                      strokeWidth="1.13"
                    />
                    <path
                      stroke="#000"
                      d="M8.4 4.6l1.25 2.15 2.43.53-1.65 1.85.25 2.47-2.27-1-2.27 1 .25-2.47-1.65-1.85 2.43-.53L8.4 4.6z"
                      strokeWidth="1.13"
                    />
                  </g>
                </svg>
                <p className="paragraph-md">Suggested for You</p>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.header}>
              <div className={`justify-between ${styles.actions}`}>
                <div className={`${styles.searchBox} field`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Magnifying-Glass--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <g id="magnifying-glass--glass-search-magnifying">
                      <path
                        id="Ellipse 44"
                        stroke="#000000"
                        d="M1.4058333333333333 7.732083333333333a6.32625 6.32625 0 1 0 12.6525 0 6.32625 6.32625 0 1 0 -12.6525 0"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 195"
                        stroke="#000000"
                        d="M12.205445 12.205445 15.464166666666666 15.464166666666666"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className={styles.createButton}
                  onClick={openCreateModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Story-Post--Streamline-Sharp"
                    height={18}
                    width={18}
                  >
                    <g id="story-post">
                      <path
                        id="Vector 1366"
                        stroke="#fff"
                        d="M8.434999999999999 5.271875v6.32625M5.271875 8.434999999999999h6.32625"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 445"
                        stroke="#fff"
                        d="M1.4058333333333333 8.434999999999999c0 3.8822087499999998 3.1469579166666666 7.029166666666667 7.029166666666667 7.029166666666667s7.029166666666667 -3.1469579166666666 7.029166666666667 -7.029166666666667S12.317208749999999 1.4058333333333333 8.434999999999999 1.4058333333333333"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 446"
                        stroke="#fff"
                        d="M1.5464166666666668 7.029166666666667c0.11879291666666666 -0.5834208333333333 0.3092833333333333 -1.1408337499999999 0.5623333333333334 -1.661695"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 448"
                        stroke="#fff"
                        d="M4.217499999999999 2.8116666666666665a7.069935833333333 7.069935833333333 0 0 0 -1.4058333333333333 1.4051304166666667"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 449"
                        stroke="#fff"
                        d="M7.029166666666667 1.5464166666666668c-0.5834208333333333 0.11809 -1.1408337499999999 0.3092833333333333 -1.661695 0.5623333333333334"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>{" "}
                  Create Group
                </button>
              </div>
            </div>

            <div className={styles.groupsGrid}>
              {loading ? (
                <p>Loading…</p>
              ) : filteredGroups.length === 0 ? (
                <p>No groups found.</p>
              ) : (
                filteredGroups.map((g, idx) => {
                  const isLeader = g.leader._id === user._id;
                  // handle both populated (object) or unpopulated (string) member entries:
                  const isMember = g.members.some(
                    (m) => (typeof m === "string" ? m : m._id) === user._id
                  );

                  return (
                    <div key={idx} className={`card ${styles.card}`}>
                      <img
                        src={g.bgCoverImage}
                        alt={g.name}
                        className={styles.cover}
                      />
                      <div className={styles.cardContent}>
                        <p className="strong paragraph-lg margin-bottom-sm">
                          {g.name}
                        </p>

                        <div className="just-flex margin-bottom-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="User-Single-Neutral-Male--Streamline-Sharp"
                            height={18}
                            width={18}
                          >
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
                          <p className="paragraph-sm muted">
                            {g.members.length} members
                          </p>
                        </div>

                        <div className={styles.cardActions}>
                          <Link
                            href={`/groups/${g._id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <button>View</button>
                          </Link>
                          <button>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Horizontal-Menu-Square--Streamline-Sharp"
                              height={18}
                              width={18}
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
                          </button>
                        </div>

                        <div className={styles.actions}>
                          {isLeader ? (
                            <span>You are the Leader</span>
                          ) : isMember ? (
                            <button
                              onClick={() => handleLeave(g._id)}
                              className={styles.button}
                            >
                              Leave
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinOrRequest(g)}
                              className={styles.button}
                            >
                              {g.privacy === "private"
                                ? "Request to Join"
                                : "Join"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {isCreateGroup && (
          <div className={styles.createFormContainer}>
            <form onSubmit={handleCreateGroup} className={styles.createForm}>
              <p className="paragraph-xl margin-bottom-lg">
                {step === 1 && "Create New Group"}
                {step === 2 && "Select Group Images "}
              </p>

              {step === 1 && (
                <div className={styles.formBox}>
                  <div>
                    <label htmlFor="groupName">Group name</label>
                    <input
                      id="groupName"
                      type="text"
                      placeholder="Group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description">Description (optional)</label>
                    <textarea
                      id="description"
                      placeholder="Description"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      rows="4"
                    />
                  </div>

                  <div>
                    <label htmlFor="privacy">Privacy</label>
                    <select
                      id="privacy"
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className={styles.stepActionsSecond}>
                    <button type="button" onClick={cancelCreate}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${
                        groupName.trim() ? styles.btnActive : ""
                      }`}
                      onClick={nextStep}
                      disabled={!groupName.trim()}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={styles.formBox}>
                  <div className={styles.formImgPlaceholder}>
                    <div className={styles.coverIMG}>
                      {/* Cover preview */}
                      {coverFile && (
                        <>
                          <img
                            src={URL.createObjectURL(coverFile)}
                            alt="Cover preview"
                            className={styles.preview}
                          />

                          <label
                            className={styles.imageUplAbsolute}
                            htmlFor="coverImage"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Camera-Setting-Pin--Streamline-Sharp"
                              height={22}
                              width={22}
                            >
                              <desc>
                                {
                                  "\n    Camera Setting Pin Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="camera-setting-pin--photos-camera-map-photography-pictures-maps-settings-pin-photo">
                                <path
                                  id="Vector 2904"
                                  stroke="#000000"
                                  d="M1.4058333333333333 11.949583333333333V4.217499999999999h2.460208333333333L5.623333333333333 1.4058333333333333h5.623333333333333l1.7572916666666667 2.8116666666666665H15.464166666666666v7.732083333333333h-4.568958333333333L8.434999999999999 15.112708333333332 5.9747916666666665 11.949583333333333H1.4058333333333333Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Ellipse 4"
                                  stroke="#000000"
                                  d="M5.9747916666666665 7.380624999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>
                            Cover Image
                          </label>
                        </>
                      )}

                      <label className={styles.imageUpl} htmlFor="coverImage">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="-0.565 -0.565 18 18"
                          id="Camera-Setting-Pin--Streamline-Sharp"
                          height={22}
                          width={22}
                        >
                          <desc>
                            {
                              "\n    Camera Setting Pin Streamline Icon: https://streamlinehq.com\n  "
                            }
                          </desc>
                          <g id="camera-setting-pin--photos-camera-map-photography-pictures-maps-settings-pin-photo">
                            <path
                              id="Vector 2904"
                              stroke="#000000"
                              d="M1.4058333333333333 11.949583333333333V4.217499999999999h2.460208333333333L5.623333333333333 1.4058333333333333h5.623333333333333l1.7572916666666667 2.8116666666666665H15.464166666666666v7.732083333333333h-4.568958333333333L8.434999999999999 15.112708333333332 5.9747916666666665 11.949583333333333H1.4058333333333333Z"
                              strokeWidth={1.13}
                            />
                            <path
                              id="Ellipse 4"
                              stroke="#000000"
                              d="M5.9747916666666665 7.380624999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                              strokeWidth={1.13}
                            />
                          </g>
                        </svg>
                        Cover Image
                      </label>

                      <input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files[0])}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div className={`${styles.bgCoverImageImg}`}>
                      {/* Background preview */}
                      {bgCoverFile && (
                        <>
                          <img
                            src={URL.createObjectURL(bgCoverFile)}
                            alt="Background preview"
                            className={`${styles.preview} `}
                          />

                          <label
                            className={styles.imageUplAbsolute}
                            htmlFor="backgroundCover"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Camera-Setting-Pin--Streamline-Sharp"
                              height={22}
                              width={22}
                            >
                              <desc>
                                {
                                  "\n    Camera Setting Pin Streamline Icon: https://streamlinehq.com\n  "
                                }
                              </desc>
                              <g id="camera-setting-pin--photos-camera-map-photography-pictures-maps-settings-pin-photo">
                                <path
                                  id="Vector 2904"
                                  stroke="#000000"
                                  d="M1.4058333333333333 11.949583333333333V4.217499999999999h2.460208333333333L5.623333333333333 1.4058333333333333h5.623333333333333l1.7572916666666667 2.8116666666666665H15.464166666666666v7.732083333333333h-4.568958333333333L8.434999999999999 15.112708333333332 5.9747916666666665 11.949583333333333H1.4058333333333333Z"
                                  strokeWidth={1.13}
                                />
                                <path
                                  id="Ellipse 4"
                                  stroke="#000000"
                                  d="M5.9747916666666665 7.380624999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                                  strokeWidth={1.13}
                                />
                              </g>
                            </svg>{" "}
                            Background Cover
                          </label>
                        </>
                      )}
                      <label
                        className={styles.imageUpl}
                        htmlFor="backgroundCover"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="-0.565 -0.565 18 18"
                          id="Camera-Setting-Pin--Streamline-Sharp"
                          height={22}
                          width={22}
                        >
                          <desc>
                            {
                              "\n    Camera Setting Pin Streamline Icon: https://streamlinehq.com\n  "
                            }
                          </desc>
                          <g id="camera-setting-pin--photos-camera-map-photography-pictures-maps-settings-pin-photo">
                            <path
                              id="Vector 2904"
                              stroke="#000000"
                              d="M1.4058333333333333 11.949583333333333V4.217499999999999h2.460208333333333L5.623333333333333 1.4058333333333333h5.623333333333333l1.7572916666666667 2.8116666666666665H15.464166666666666v7.732083333333333h-4.568958333333333L8.434999999999999 15.112708333333332 5.9747916666666665 11.949583333333333H1.4058333333333333Z"
                              strokeWidth={1.13}
                            />
                            <path
                              id="Ellipse 4"
                              stroke="#000000"
                              d="M5.9747916666666665 7.380624999999999a2.460208333333333 2.460208333333333 0 1 0 4.920416666666666 0 2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0"
                              strokeWidth={1.13}
                            />
                          </g>
                        </svg>{" "}
                        Background Cover
                      </label>
                      <input
                        id="backgroundCover"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBgCoverFile(e.target.files[0])}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>

                  <div className={styles.stepActionsSecond}>
                    <button type="button" onClick={prevStep}>
                      Back
                    </button>

                    <button
                      type="submit"
                      className={`${styles.btn} ${
                        coverFile && bgCoverFile ? styles.btnActive : ""
                      }`}
                      disabled={creating || !(coverFile && bgCoverFile)}
                    >
                      {creating ? "Creating..." : "Create Group"}
                    </button>
                  </div>
                </div>
              )}

              <button
                className={`${styles.closeBtn} btn`}
                type="button"
                onClick={cancelCreate}
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
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
