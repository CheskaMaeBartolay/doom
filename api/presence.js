export default async function handler(req, res) {
  const userId = Number(req.query.userId || 977146001);
  if (!Number.isFinite(userId)) return res.status(400).json({ error: "Invalid userId" });
  try {
    const response = await fetch("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ userIds: [userId] })
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Roblox presence request failed" });
  }
}
