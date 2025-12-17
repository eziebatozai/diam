
import fs from "fs";
import puppeteer from "puppeteer-core";

const URL = "https://campaign.diamante.io/transactions";
const DELAY = 60_000;

const wallets = fs.readFileSync("wallet.txt", "utf8")
  .split("\n")
  .map(w => w.trim())
  .filter(w => w.length > 20);

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("🚀 DIAM BOT START");

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    userDataDir: "./profile",
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    console.log(`[${i + 1}/${wallets.length}] Send → ${wallet}`);

    try {
      await page.goto(URL, { waitUntil: "networkidle2" });

      // OPEN SEND MODAL
      await page.waitForSelector("button");
      await page.click("button");

      // TO ADDRESS
      await page.waitForSelector("input[placeholder*='Address']");
      await page.click("input[placeholder*='Address']", { clickCount: 3 });
      await page.keyboard.type(wallet, { delay: 20 });

      // AMOUNT
      await page.waitForSelector("input[placeholder*='Amount']");
      await page.click("input[placeholder*='Amount']", { clickCount: 3 });
      await page.keyboard.type("1");

      // SUBMIT
      await page.waitForSelector("button[type='submit']");
      await page.click("button[type='submit']");

      console.log("✅ TX SENT");

    } catch (e) {
      console.log("❌ FAILED:", e.message);
    }

    if (i < wallets.length - 1) {
      console.log("⏳ delay 1 menit");
      await sleep(DELAY);
    }
  }

  console.log("🎉
