const axios = require("axios");
const fs = require("fs");

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjU5MjE5MzYsInNlc3Npb25JZCI6IjkwMWEzMDQ5ZGQyZDI5MzM0ZGUzZWEwMDE0ZWVlMWE3YzZjYWU1NjJkZmNkOTdmYTM5YjkxM2YyNjI2NTE1MWUiLCJ1c2VySWQiOiI3NzU4ZTYzOS1kYmJmLTQ0OGItYWVlNi05MDFiOWJkYjljMmIifQ.9u_Rl-wZm_CERcIfp3RS53BV0OGf4RZ7fGm1dL3zC6I";
const USER_ID = "7758e639-dbbf-448b-aee6-901b9bdb9c2b";

// jumlah kirim per address
const AMOUNT = 1;

// jeda waktu (MENIT)
const DELAY_MINUTE = 1;

// baca address dari file
const addresses = fs
  .readFileSync("address.txt", "utf-8")
  .split("\n")
  .map(a => a.trim())
  .filter(Boolean);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function send(toAddress) {
  try {
    const res = await axios.post(
      "https://campapi.diamante.io/api/v1/transaction/transfer",
      {
        toAddress,
        amount: AMOUNT,
        userId: USER_ID
      },
      {
        headers: {
          "access-token": ACCESS_TOKEN,
          "content-type": "application/json",
          "origin": "https://campaign.diamante.io",
          "referer": "https://campaign.diamante.io/",
          "user-agent": "Mozilla/5.0"
        }
      }
    );

    console.log(`✅ Sent ${AMOUNT} to ${toAddress}`);
  } catch (err) {
    console.error(`❌ Failed ${toAddress}`, err.response?.data || err.message);
  }
}

(async () => {
  console.log(`🚀 Total address: ${addresses.length}`);
  console.log(`⏱ Delay: ${DELAY_MINUTE} menit\n`);

  for (let i = 0; i < addresses.length; i++) {
    console.log(`➡️ Sending ${i + 1}/${addresses.length}`);
    await send(addresses[i]);
    if (i < addresses.length - 1) {
      await sleep(DELAY_MINUTE * 60 * 1000);
    }
  }

  console.log("\n🎉 Selesai semua");
})();
