"use client";

import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import styles from "@/app/groups/page.module.css";
import Link from "next/link";

export default function GroupSettingsForm({
  group,
  onSaved,
  setIsGroupSettingOpen,
  joinRequest,
  setJoinRequest,
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [privacy, setPrivacy] = useState(group.privacy || "public");
  const [coverFile, setCoverFile] = useState(null);
  const [bgCoverFile, setBgCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- New: Join Requests State ---
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);

  // Upload & save settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // 1️⃣ Upload new cover image, if any
    let coverImageUrl = group.coverImage || "";
    if (coverFile) {
      const resp = await uploadToCloudinary(coverFile);
      coverImageUrl = resp.secure_url;
    }

    // 2️⃣ Upload new background cover image, if any
    let bgCoverImageUrl = group.bgCoverImage || "";
    if (bgCoverFile) {
      const resp2 = await uploadToCloudinary(bgCoverFile);
      bgCoverImageUrl = resp2.secure_url;
    }

    // 3️⃣ Send updated settings
    const res = await fetch(
      `https://massoudnet-backend.onrender.com/api/groups/${group._id}/settings`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          privacy,
          coverImage: coverImageUrl,
          bgCoverImage: bgCoverImageUrl,
        }),
      }
    );

    if (res.ok) {
      onSaved();
      setIsGroupSettingOpen(false);
    } else {
      console.error("Failed to save settings");
    }
    setSaving(false);
  };

  // --- New: fetch join requests on mount if private & leader ---
  useEffect(() => {
    if (privacy === "private") {
      (async () => {
        setReqLoading(true);
        try {
          const res = await fetch(
            `https://massoudnet-backend.onrender.com/api/groups/${group._id}/admin/requests`,
            {
              credentials: "include",
            }
          );
          const json = await res.json();
          if (res.ok) {
            setRequests(json.data);
          } else {
            console.error("Failed to fetch join requests");
          }
        } catch (err) {
          console.error("Error loading requests:", err);
        }
        setReqLoading(false);
      })();
    }
  }, [group._id, privacy]);

  // Approve or deny a single request
  const handleRequest = async (userId, action) => {
    try {
      await fetch(
        `https://massoudnet-backend.onrender.com/api/groups/${group._id}/admin/requests/${userId}/${action}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      // remove from local list
      setRequests((prev) => prev.filter((u) => u._id !== userId));
      onSaved(); // re-fetch group members if needed
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  return (
    <div className={styles.createFormContainer}>
      <form
        onSubmit={handleSubmit}
        className={`${styles.createForm} ${styles.createFormGroupSetting}`}
      >
        {joinRequest ? (
          <>
            {privacy === "private" && (
              <div className={styles.joinRequestsSection}>
                <p className="paragraph-lg strong">Pending Join Requests</p>
                {reqLoading ? (
                  <p className="paragraph-md">Loading requests…</p>
                ) : requests.length === 0 ? (
                  <p className="paragraph-md">No pending requests.</p>
                ) : (
                  <ul className={styles.requestsList}>
                    {requests.map((u) => (
                      <li key={u?._id} className={styles.requestItem}>
                        <Link
                          href={`/profile/${u?._id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div className="just-flex">
                            <img
                              src={u.profilePic || "/profile.png"}
                              alt="example"
                            />
                            <p className="paragraph-lg">{u.name}</p>
                          </div>
                        </Link>

                        <div className={styles.requestActions}>
                          <button
                            onClick={() => handleRequest(u._id, "approve")}
                            className={styles.buttonActions}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRequest(u._id, "deny")}
                            className={styles.buttonActions}
                            style={{ marginLeft: "0.5rem", color: "red" }}
                          >
                            Deny
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              className={`${styles.closeBtnGROUP}`}
              type="button"
              onClick={() => {
                setIsGroupSettingOpen(false);
                setJoinRequest(false);
              }}
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
          </>
        ) : (
          <>
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4rem",
              }}
            >
              <div className={styles.formBox}>
                <div>
                  <label htmlFor="groupName">Group name</label>
                  <input
                    id="groupName"
                    type="text"
                    placeholder="Group name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description">Description (optional)</label>
                  <textarea
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
              </div>

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
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`${styles.button} ${styles.buttonGroupSettingPage}`}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {/* ─────────────────────────────── */}

            <button
              className={`${styles.closeBtnGROUP}`}
              type="button"
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
          </>
        )}
      </form>
    </div>
  );
}
