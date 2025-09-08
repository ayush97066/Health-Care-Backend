import express from "express";
import pkg from "agora-access-token";

const { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = pkg;

const router = express.Router();

function unixTsNow() {
  return Math.floor(Date.now() / 1000);
}

// -------------------- RTC TOKEN POST --------------------
router.post("/rtc/token", (req, res) => {
  try {
    let { channelName, uid, role = "publisher", expireSeconds = 3600 } = req.body;

    if (!channelName) return res.status(400).json({ error: "channelName is required" });
    if (!uid) uid = Math.floor(Math.random() * 100000);

    const expireAt = unixTsNow() + Number(expireSeconds);
    const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(process.env.AGORA_APP_ID, process.env.AGORA_APP_CERT, channelName, Number(uid), agoraRole, expireAt);

    res.json({ rtcToken: token, uid, expireAt });
    console.log("✅ RTC POST token request:", req.body);
  } catch (e) {
    console.error("RTC token POST error:", e);
    res.status(500).json({ error: e.message });
  }
});

// -------------------- RTC TOKEN GET (test in browser) --------------------
router.get("/rtc/token", (req, res) => {
  try {
    const uid = Math.floor(Math.random() * 100000);
    const channelName = req.query.channelName || "testChannel";
    const expireAt = unixTsNow() + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(process.env.AGORA_APP_ID, process.env.AGORA_APP_CERT, channelName, uid, RtcRole.PUBLISHER, expireAt);

    res.json({ rtcToken: token, uid, expireAt });
    console.log("✅ RTC GET token request, channel:", channelName);
  } catch (e) {
    console.error("RTC GET token error:", e);
    res.status(500).json({ error: e.message });
  }
});

// -------------------- RTM TOKEN POST --------------------
router.post("/rtm/token", (req, res) => {
  try {
    let { uid, expireSeconds = 3600 } = req.body;
    if (!uid) uid = Math.floor(Math.random() * 100000);

    const expireAt = unixTsNow() + Number(expireSeconds);
    const token = RtmTokenBuilder.buildToken(process.env.AGORA_APP_ID, process.env.AGORA_APP_CERT, String(uid), RtmRole.Rtm_User, expireAt);

    res.json({ rtmToken: token, uid, expireAt });
  } catch (e) {
    console.error("RTM token POST error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
