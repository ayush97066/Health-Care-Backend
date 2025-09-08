import express from "express";
import pkg from "agora-access-token";

const { RtmTokenBuilder, RtmRole } = pkg;

const router = express.Router();

function unixTsNow() {
  return Math.floor(Date.now() / 1000);
}

// -------------------- GET RTM TOKEN --------------------
router.post("/chat/token", (req, res) => {
  try {
    let { uid, expireSeconds = 3600 } = req.body;

    if (!uid) uid = Math.floor(Math.random() * 100000);

    const expireAt = unixTsNow() + Number(expireSeconds);

    const token = RtmTokenBuilder.buildToken(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERT,
      String(uid),
      RtmRole.Rtm_User,
      expireAt
    );

    res.json({ rtmToken: token, uid, expireAt });
    console.log("✅ Chat RTM token request, UID:", uid);
  } catch (e) {
    console.error("Chat RTM token error:", e);
    res.status(500).json({ error: e.message });
  }
});

// -------------------- SEND MESSAGE (Mock Example) --------------------
// In real scenario, you will use Agora RTM SDK on frontend
router.post("/chat/message", (req, res) => {
  try {
    const { fromUid, toUid, message } = req.body;

    if (!fromUid || !toUid || !message) {
      return res.status(400).json({ error: "fromUid, toUid, and message are required" });
    }

    console.log(`Message from ${fromUid} to ${toUid}: ${message}`);
    res.json({ success: true, message: "Message sent" });
  } catch (e) {
    console.error("Chat message error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
