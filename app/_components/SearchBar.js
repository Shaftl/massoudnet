"use client";

import { useState, useEffect } from "react";
import styles from "./SearchBar.module.css";
import { useSelector } from "react-redux";
// import { Search, X } from "lucide-react";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [] });
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSearch();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://massoudnet-backend.onrender.com/api/search?q=${encodeURIComponent(
          query
        )}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();

      const filteredUsers = Array.isArray(data.users)
        ? data.users.filter((user) => user._id !== currentUser._id)
        : [];

      const filteredPosts = Array.isArray(data.posts)
        ? data.posts.filter((post) => post.author?._id !== currentUser._id)
        : [];

      setResults({
        users: filteredUsers,
        posts: filteredPosts,
      });

      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
      setResults({ users: [], posts: [] });
    } finally {
      setLoading(false);
    }
  };

  const noResults =
    !loading &&
    query.trim() &&
    results.users.length === 0 &&
    results.posts.length === 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        {/* <Search className={styles.icon} size={18} /> */}
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className={`${styles.input} field`}
        />
      </div>

      {showDropdown && query.trim() && (
        <div className={styles.dropdown}>
          {loading && <p className={styles.loading}>Searching...</p>}

          {!loading && noResults && (
            <p className={styles.noResults}>No results found.</p>
          )}

          {results.users.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <p className="paragraph-lg strong">Users</p>
                {/* <X className={styles.close} size={18} /> */}
              </div>
              {results.users.map((user) => (
                <Link
                  href={`/profile/${user._id}`}
                  key={user._id}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className={styles.item}>
                    <img
                      src={user.profilePic?.trim() || "/default-profile.png"}
                    />

                    <div className={styles.details}>
                      <p className={styles.name}>{user.name}</p>
                      <p className={styles.subtext}>{user.location}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.posts.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <p className="paragraph-lg strong">Posts</p>
              </div>
              {results.posts.map((post) => (
                <Link
                  href={`/post/${post?._id}`}
                  key={post?._id}
                  className="link"
                >
                  <div className={styles.item}>
                    <div className={`${styles.details} just-flex`}>
                      {post?.image && (
                        <img
                          src={post?.image}
                          className={styles.searchPostImg}
                        />
                      )}

                      {post?.video && (
                        <video
                          src={post?.video}
                          className={styles.searchPostImg}
                        />
                      )}
                      <div>
                        <p className={styles.name}>
                          {post.text.slice(0, 80)}...
                        </p>
                        <p className={styles.subtext}>by {post.author?.name}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
