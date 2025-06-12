export async function findOrCreateConversation(friendId) {
  const res = await fetch(
    "https://massoudnet-backend.onrender.com/api/conversations/findOrCreate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipientId: friendId }), // ✅ FIXED HERE
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to find or create conversation");

  return res.json();
}
