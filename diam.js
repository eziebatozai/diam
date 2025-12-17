import fs from "fs";
import puppeteer from "puppeteer-core";

const URL = "https://campaign.diamante.io/transactions";
const DELAY = 60 * 1000;
const AMOUNT = "1";

const wallets = fs.readFileSync("wallet.txt", "utf8")
  .split("\n")
  .map(w => w.trim())
  .filter(w => w.startsWith("0x"));

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("🚀 DIAM BOT START");

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    userDataDir: "./profile",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    console.log(`[${i + 1}/${wallets.length}] Send to ${wallet}`);

    try {
      await page.goto(URL, { waitUntil: "networkidle2" });

      // OPEN SEND MODAL
      await page.waitForSelector("button");
      await page.click("button");

      // WAIT INPUTS
      await page.waitForSelector("input");
      const inputs = await page.$$("input");

      // inputs[0] = FROM (SKIP)
      // inputs[1] = TO
      // inputs[2] = AMOUNT

      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type(wallet);

      await inputs[2].click({ clickCount: 3 });
      await inputs[2].type(AMOUNT);

      // SEND
      await page.click("button[type='submit']");

      console.log("✅ TRANSACTION SENT");

    } catch (e) {
      console.log("❌ FAILED:", e.message);
    }

    if (i < wallets.length - 1) {
      console.log("⏳ delay 1 menit");
      await sleep(DELAY);
    }
  }

  console.log("🎉 DONE");
})();
