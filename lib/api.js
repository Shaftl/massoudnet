export const followUser = async (userId) => {
  const res = await fetch(`/api/user/follow/${userId}`, {
    method: "PUT",
    credentials: "include",
  });
  return res.json();
};

export const unfollowUser = async (userId) => {
  const res = await fetch(`/api/user/unfollow/${userId}`, {
    method: "PUT",
    credentials: "include",
  });
  return res.json();
};

export const getFollowers = async (userId) => {
  const res = await fetch(`/api/user/followers/${userId}`, {
    credentials: "include",
  });
  return res.json();
};

export const getFollowing = async (userId) => {
  const res = await fetch(`/api/user/following/${userId}`, {
    credentials: "include",
  });
  return res.json();
};
