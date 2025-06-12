export const checkAuth = async () => {
  try {
    const res = await fetch(
      "https://massoudnet-backend.onrender.com/api/auth/me",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (err) {
    return null;
  }
};
