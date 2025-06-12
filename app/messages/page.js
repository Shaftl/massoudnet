"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../../utils/socket";
import styles from "./page.module.css";
import ProtectedRoute from "@/app/_components/ProtectedRoute";
import Link from "next/link";
import { findOrCreateConversation } from "@/lib/conversation";

const TYPING_TIMEOUT = 2000;

export default function Page() {
  const currentUser = useSelector((state) => state.auth.user);

  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);

  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUserProfiles, setOnlineUserProfiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const [isMoreOption, setIsMoreOption] = useState(null);

  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const scrollRef = useRef();
  const typingTimeoutRef = useRef();
  const currentChatRef = useRef(currentChat);

  const BACKEND_URL = "https://massoudnet-backend.onrender.com";
  const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/dhljprc8i/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "massoudnetv2";

  // Keep currentChatRef in sync
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // ────────────────────────────────────────────────────────────────────────────
  // 1. On mount, emit addUser and install a single socket listener
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?._id) return;

    // Tell server we’re online
    socket.emit("addUser", currentUser._id);

    // Receive updated online‐users list
    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    // Receive any new incoming message (text or image)
    socket.on("getMessage", (data) => {
      // Only append if it belongs to the currently open chat:
      if (currentChatRef.current?._id === data.conversationId) {
        // If data.media is missing, fetch the full message from our backend:
        if (!data.media && data._id) {
          fetch(`${BACKEND_URL}/api/messages/${data._id}`, {
            credentials: "include",
          })
            .then((res) => res.json())
            .then((fullMsg) => {
              // Normalize sender field (could be object or ID)
              const normalized = {
                ...fullMsg,
                sender:
                  typeof fullMsg.sender === "object"
                    ? fullMsg.sender._id
                    : fullMsg.sender,
              };
              setMessages((prev) => [...prev, normalized]);
            })
            .catch((err) => {
              console.error("Failed to fetch single message:", err);
            });
        } else {
          // data already contains media (URL) or no attachment was needed:
          setMessages((prev) => [...prev, data]);
        }
      }
    });

    // Typing indicator events
    socket.on("typing", ({ conversationId }) => {
      if (currentChatRef.current?._id === conversationId) {
        setIsTyping(true);
      }
    });
    socket.on("stopTyping", ({ conversationId }) => {
      if (currentChatRef.current?._id === conversationId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("getUsers");
      socket.off("getMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [currentUser]);

  // ────────────────────────────────────────────────────────────────────────────
  // 2. Fetch friends once currentUser is available
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?._id) return;

    fetch(`${BACKEND_URL}/api/user/friends/${currentUser._id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.friends)) {
          setFriends(data.friends);
          setFilteredFriends(data.friends);
        }
      })
      .catch((err) => console.error("Failed to load friends:", err));
  }, [currentUser]);

  // ────────────────────────────────────────────────────────────────────────────
  // 3. When currentChat changes, fetch that conversation’s messages & partner
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      setChatPartner(null);
      return;
    }

    // 3a. Fetch existing messages for this conversation
    fetch(`${BACKEND_URL}/api/messages/${currentChat._id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setMessages(
          data.map((m) => ({
            ...m,
            sender: typeof m.sender === "object" ? m.sender._id : m.sender,
          }))
        )
      )
      .catch((err) => console.error("Failed to load messages:", err));

    // 3b. Fetch the chat partner’s profile
    const friendId = currentChat.members.find((id) => id !== currentUser._id);
    fetch(`${BACKEND_URL}/api/user/${friendId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setChatPartner(data))
      .catch((err) => console.error("Failed to load chat partner:", err));
  }, [currentChat, currentUser]);

  // ────────────────────────────────────────────────────────────────────────────
  // 4. Scroll into view for the latest message
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ────────────────────────────────────────────────────────────────────────────
  // 5. Fetch online friends’ profiles whenever onlineUsers or friends change
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onlineFriendIds = friends
      .filter((f) => onlineUsers.includes(f._id))
      .map((f) => f._id);

    Promise.all(
      onlineFriendIds.map((userId) =>
        fetch(`${BACKEND_URL}/api/user/${userId}`, {
          credentials: "include",
        }).then((res) => res.json())
      )
    )
      .then((profiles) => setOnlineUserProfiles(profiles))
      .catch((err) =>
        console.error("Failed to fetch online user profiles:", err)
      );
  }, [friends, onlineUsers]);

  // ────────────────────────────────────────────────────────────────────────────
  // 6. Filter friends list when searchQuery changes
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredFriends(friends);
    } else {
      setFilteredFriends(
        friends.filter((f) => f.name.toLowerCase().includes(q))
      );
    }
  }, [searchQuery, friends]);

  // ────────────────────────────────────────────────────────────────────────────
  // Handler: send a message (possibly with an image)
  // ────────────────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if ((!newMessage.trim() && !image) || !currentChat) return;
    setIsSending(true);

    // 1) If there’s an image, first upload to Cloudinary:
    const receiverId = currentChat.members.find((id) => id !== currentUser._id);
    let imageUrl = null;
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", CLOUDINARY_UPLOAD_URL);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(percent);
        }
      };
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        };
        xhr.onerror = reject;
      });
      xhr.send(formData);
      imageUrl = await uploadPromise;
      setUploadProgress(0);
    }

    // 2) Build our message object
    const messageObj = {
      sender: currentUser._id,
      text: newMessage.trim(),
      media: imageUrl, // either null or the uploaded URL
      conversationId: currentChat._id,
    };

    // 5) Persist on backend
    const res = await fetch(`${BACKEND_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(messageObj),
    });
    if (!res.ok) {
      console.error("Failed to save message:", await res.text());
      setIsSending(false);
      return;
    }
    // 6) Read the saved message (with _id)…
    const savedMsg = await res.json();

    // Normalize sender if needed
    const normalized = {
      ...savedMsg,
      sender:
        typeof savedMsg.sender === "object"
          ? savedMsg.sender._id
          : savedMsg.sender,
    };

    // 3) Emit over socket so the other side sees it immediately:
    socket.emit("sendMessage", { ...messageObj, receiverId });

    // 4) Stop typing indicator
    socket.emit("stopTyping", {
      conversationId: currentChat._id,
      receiverId,
      senderId: currentUser._id,
    });
    // and append it
    setMessages((prev) => [...prev, normalized]);
    setNewMessage("");
    setImage(null);
    setIsSending(false);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handler: typing indicator
  // ────────────────────────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!currentChat) return;

    const receiverId = currentChat.members.find((id) => id !== currentUser._id);
    socket.emit("typing", {
      conversationId: currentChat._id,
      receiverId,
      senderId: currentUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: currentChat._id,
        receiverId,
        senderId: currentUser._id,
      });
    }, TYPING_TIMEOUT);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handler: delete entire conversation
  // ────────────────────────────────────────────────────────────────────────────
  const handleDeleteConversation = async () => {
    if (!currentChat) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this conversation?"
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/messages/conversation/${currentChat._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setCurrentChat(null);
        setMessages([]);
      } else {
        console.error("Failed to delete conversation");
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handler: delete message for current user only
  // ────────────────────────────────────────────────────────────────────────────
  const handleDeleteForMe = async (messageId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, deletedFor: [...(m.deletedFor || []), currentUser._id] }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Delete for me failed", err);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handler: delete message for everyone
  // ────────────────────────────────────────────────────────────────────────────
  const handleDeleteForEveryone = async (messageId) => {
    const confirmMsg = window.confirm("Delete this message for everyone?");
    if (!confirmMsg) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/messages/delete-everyone/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    } catch (err) {
      console.error("Delete for everyone failed", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className={`${styles.messages} container`}>
        <div className={styles.messagesContainer}>
          {/* ───────────────────── SIDEBAR: Search + Friends ───────────────────── */}
          <div className={`${styles.card} card`}>
            <div className="justify-between margin-bottom-md">
              <h3 className="heading-tertiary">Chats</h3>
              {/* Filter Icon (static) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Filter-2--Streamline-Sharp"
                height={18}
                width={18}
              >
                <g id="filter-2--funnel-filter-angle-oil">
                  <path
                    id="Union"
                    stroke="#000000"
                    d="M10.192291666666666 9.489374999999999 15.464166666666666 4.217499999999999V1.4058333333333333H1.4058333333333333v2.8116666666666665l5.271875 5.271875v5.623333333333333l3.5145833333333334 -2.1087499999999997v-3.5145833333333334Z"
                    strokeWidth={1.13}
                  />
                </g>
              </svg>
            </div>

            <div className={`${styles.searchbar} just-flex margin-bottom-md`}>
              {/* Magnifying Glass Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-0.565 -0.565 18 18"
                id="Magnifying-Glass--Streamline-Sharp"
                height={18}
                width={18}
                className={styles.searchIcon}
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
                className={`${styles.searchbarInput} field`}
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.list}>
              {filteredFriends.map((f) => (
                <div
                  key={f._id}
                  className={`just-flex ${styles.listItem} ${
                    selectedFriendId === f._id ? styles.activeListItem : ""
                  }`}
                  onClick={async () => {
                    // mark active
                    setSelectedFriendId(f._id);

                    // open or create conversation
                    try {
                      const convo = await findOrCreateConversation(f._id);
                      if (convo) setCurrentChat(convo);
                    } catch (err) {
                      console.error("Failed to open convo", err);
                    }
                  }}
                >
                  <img
                    src={f.profilePic || "/post.png"}
                    alt={f.name}
                    className={styles.friendImg}
                  />
                  <p className="paragraph-lg">{f.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─────────────────────────────────── CHAT AREA ────────────────────────────────── */}
          <div className={`${styles.card} ${styles.chat} card`}>
            <div className={`${styles.topBar} justify-between`}>
              {chatPartner ? (
                <div className="just-flex">
                  <img
                    src={chatPartner.profilePic || "/post.png"}
                    alt="ChatPartner"
                    className={styles.chatPartnerImg}
                  />
                  <p className="paragraph-xl">
                    Chatting with {chatPartner.name}
                  </p>
                </div>
              ) : (
                <p className="paragraph-xl">Select a chat</p>
              )}

              <div className="just-flex">
                {/* Info Circle Icon */}

                {/* Delete Conversation "X" Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height={18}
                  width={18}
                  className={styles.icon}
                  onClick={handleDeleteConversation}
                  title="Delete Conversation"
                  style={{ cursor: "pointer" }}
                >
                  <path
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.chatBox}>
              <div className={styles.messagesBox}>
                {messages.map((m, i) => {
                  const isMine = m.sender === currentUser._id;
                  const timestamp = new Date(m.createdAt).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  );
                  if (m.deletedFor?.includes(currentUser._id)) return null;

                  return (
                    <div
                      key={i}
                      ref={scrollRef}
                      className={`${styles.message} ${
                        isMine ? styles.fromMe : styles.fromOther
                      }`}
                    >
                      <button
                        className={styles.moreOption}
                        onClick={() =>
                          setIsMoreOption(m._id === isMoreOption ? null : m._id)
                        }
                      >
                        {isMoreOption === m._id ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Elipse-Frame--Streamline-Sharp"
                            height={14}
                            width={14}
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
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="-0.565 -0.565 18 18"
                            id="Horizontal-Menu-Square--Streamline-Sharp"
                            height={14}
                            width={14}
                          >
                            <desc>
                              {
                                "\n    Horizontal Menu Square Streamline Icon: https://streamlinehq.com\n  "
                              }
                            </desc>
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
                        )}
                      </button>

                      <div className={styles.messageContent}>
                        {m.text && (
                          <div
                            style={{
                              paddingRight: "4rem",
                            }}
                          >
                            {m.text}
                            <p className={styles.timestamp}>{timestamp}</p>
                          </div>
                        )}
                        {m.media && (
                          <img
                            src={m.media}
                            alt="message-img"
                            className={styles.messageImage}
                            onClick={() => setModalImage(m.media)}
                          />
                        )}
                      </div>

                      {isMoreOption === m._id && (
                        <div className={styles.messageActions}>
                          <button
                            onClick={() => {
                              console.log(
                                "Deleting message ID:",
                                m._id,
                                "or id:",
                                m.id
                              );
                              handleDeleteForMe(m._id);
                            }}
                            className={styles.messageOption}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="-0.565 -0.565 18 18"
                              id="Recycle-Bin-2--Streamline-Sharp"
                              height={18}
                              width={18}
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
                            </svg>{" "}
                            Delete for Me
                          </button>
                          {m.sender === currentUser._id && (
                            <button
                              onClick={() => handleDeleteForEveryone(m._id)}
                              className={styles.messageOption}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="-0.565 -0.565 18 18"
                                id="Recycle-Bin-2--Streamline-Sharp"
                                height={18}
                                width={18}
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
                              </svg>{" "}
                              Delete for Everyone
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {isTyping && (
                  <div className={styles.typingIndicator}>
                    {chatPartner?.name || "Friend"} is typing...
                  </div>
                )}
              </div>

              <div className={styles.inputArea}>
                <label>
                  {/* Attachment Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Email-Attachment-Image--Streamline-Sharp"
                    height={18}
                    width={18}
                    className={styles.icon}
                  >
                    <g id="email-attachment-image--mail-send-email-attachment-file-image-png-jpg">
                      <path
                        id="Vector 2539"
                        stroke="#000000"
                        d="M15.464166666666666 16.3428125V11.598125a2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0v4.217499999999999h2.460208333333333V11.949583333333333"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Rectangle 844"
                        stroke="#000000"
                        d="M8.786458333333332 14.058333333333334H1.4058333333333333V1.4058333333333333h12.6525v6.32625"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Ellipse 679"
                        stroke="#000000"
                        d="M8.434999999999999 5.271875a1.7572916666666667 1.7572916666666667 0 1 0 3.5145833333333334 0 1.7572916666666667 1.7572916666666667 0 1 0 -3.5145833333333334 0"
                        strokeWidth={1.13}
                      />
                      <path
                        id="Vector 2538"
                        stroke="#000000"
                        d="M1.4058333333333333 7.732083333333333h0.8217095833333333c2.5431524999999997 0 4.899329166666666 1.3341358333333333 6.207457083333333 3.5145833333333334"
                        strokeWidth={1.13}
                      />
                    </g>
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>

                <input
                  type="text"
                  placeholder="Enter the message"
                  className="field"
                  value={newMessage}
                  onChange={handleTyping}
                />

                <button
                  className="btn"
                  onClick={!isSending ? sendMessage : undefined}
                  style={{ cursor: isSending ? "not-allowed" : "pointer" }}
                  disabled={isSending}
                >
                  {/* Send Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="-0.565 -0.565 18 18"
                    id="Mail-Send-Email-Message--Streamline-Sharp"
                    height={18}
                    width={18}
                    className={styles.icon}
                  >
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
          </div>

          {image && (
            <div className={styles.previewContainer}>
              <div style={{ position: "relative" }}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className={styles.previewImage}
                />

                {uploadProgress > 0 && (
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressBar}
                        style={{ height: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {uploadProgress}%
                    </span>
                  </div>
                )}
              </div>
              <button
                className={styles.closePreview}
                onClick={() => setImage(null)}
              >
                {/* Close Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height={16}
                  width={16}
                >
                  <path
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
              <div
                style={{
                  width: "54rem",
                  position: "relative",
                }}
                className={styles.previewBox}
              >
                <div className={styles.inputArea}>
                  <label>
                    {/* Attachment Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="-0.565 -0.565 18 18"
                      id="Email-Attachment-Image--Streamline-Sharp"
                      height={18}
                      width={18}
                      className={styles.icon}
                    >
                      <g id="email-attachment-image--mail-send-email-attachment-file-image-png-jpg">
                        <path
                          id="Vector 2539"
                          stroke="#000000"
                          d="M15.464166666666666 16.3428125V11.598125a2.460208333333333 2.460208333333333 0 1 0 -4.920416666666666 0v4.217499999999999h2.460208333333333V11.949583333333333"
                          strokeWidth={1.13}
                        />
                        <path
                          id="Rectangle 844"
                          stroke="#000000"
                          d="M8.786458333333332 14.058333333333334H1.4058333333333333V1.4058333333333333h12.6525v6.32625"
                          strokeWidth={1.13}
                        />
                        <path
                          id="Ellipse 679"
                          stroke="#000000"
                          d="M8.434999999999999 5.271875a1.7572916666666667 1.7572916666666667 0 1 0 3.5145833333333334 0 1.7572916666666667 1.7572916666666667 0 1 0 -3.5145833333333334 0"
                          strokeWidth={1.13}
                        />
                        <path
                          id="Vector 2538"
                          stroke="#000000"
                          d="M1.4058333333333333 7.732083333333333h0.8217095833333333c2.5431524999999997 0 4.899329166666666 1.3341358333333333 6.207457083333333 3.5145833333333334"
                          strokeWidth={1.13}
                        />
                      </g>
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Enter the message"
                    className="field"
                    value={newMessage}
                    onChange={handleTyping}
                  />

                  <button
                    className="btn"
                    onClick={!isSending ? sendMessage : undefined}
                    style={{ cursor: isSending ? "not-allowed" : "pointer" }}
                    disabled={isSending}
                  >
                    {/* Send Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="-0.565 -0.565 18 18"
                      id="Mail-Send-Email-Message--Streamline-Sharp"
                      height={18}
                      width={18}
                      className={styles.icon}
                    >
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
            </div>
          )}

          {/* ────────────────────────────────── ONLINE FRIENDS ────────────────────────────────── */}
          <div className={`${styles.sideThree} card`}>
            <div className={styles.onlineUsers}>
              {onlineUserProfiles.map((user) => (
                <Link href={`/profile/${user._id}`} key={user._id}>
                  <div className={styles.onlineUserItem}>
                    <img
                      src={user.profilePic || "/post.png"}
                      alt={user.name}
                      className={styles.avatarS}
                      width={50}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────── IMAGE MODAL ────────────────────────────────── */}
        {modalImage && (
          <div
            className={styles.modalOverlay}
            onClick={() => setModalImage(null)}
          >
            <div className={styles.modalImgBox}>
              <img src={modalImage} className={styles.modalImage} />
              <button
                className={styles.modalClose}
                onClick={() => setModalImage(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height={24}
                  width={24}
                >
                  <path
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
