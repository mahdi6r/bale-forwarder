const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GROUP_ID = process.env.GROUP_ID;

if (!BOT_TOKEN || !CHANNEL_ID || !GROUP_ID) {
  console.error("Missing BOT_TOKEN or CHANNEL_ID or GROUP_ID in environment variables.");
  process.exit(1);
}

const API = `https://tapi.bale.ai/bot${BOT_TOKEN}`;

let lastUpdateId = 0;

async function checkChannel() {
  try {
    const res = await axios.post(`${API}/getUpdates`, {
      offset: lastUpdateId + 1,
      limit: 50,
      timeout: 0
    });

    const updates = res.data.result || [];

    for (const update of updates) {
      lastUpdateId = update.update_id;

      if (
        update.message &&
        update.message.chat &&
        update.message.chat.type === "channel"
      ) {
        const text = update.message.text || "";

        if (!text) continue;

        await axios.post(`${API}/sendMessage`, {
          chat_id: GROUP_ID,
          text: text
        });

        console.log("Forwarded:", text);
      }
    }
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }

  setTimeout(checkChannel, 1000);
}

console.log("bale-forwarder started...");
checkChannel();
