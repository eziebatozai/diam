import fs from "fs";
import puppeteer from "puppeteer";

const URL = "https://campaign.diamante.io/transactions";
const DELAY = 60 * 1000; // 1 menit

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const wallets = fs.readFileSync("wallet.txt", "utf8")
  .split("\n")
  .map(w => w.trim())
  .filter(Boolean);

(async () => {
  console.log("🚀 DIAM TESTNET BOT STARTED");
  console.log(`📂 Wallet loaded: ${wallets.length}`);

  const browser = await puppeteer.launch({
    headless: false, // WAJIB false untuk wallet
    userDataDir: "./profile", // SIMPAN LOGIN WALLET
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  console.log("\n🔑 Pastikan WALLET SUDAH CONNECT ke Diamante");
  console.log("⏸ Jika belum, login manual sekarang lalu tekan ENTER");

  await new Promise(resolve => process.stdin.once("data", resolve));

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    console.log(`\n[${i + 1}/${wallets.length}] Sending to: ${wallet}`);

    try {
      await page.goto(URL, { waitUntil: "networkidle2" });

      // OPEN SEND MODAL
      await page.waitForXPath("//button/span");
      const [openBtn] = await page.$x("//button/span");
      await openBtn.click();

      // INPUT FIELDS
      await page.waitForXPath("//input");
      const inputs = await page.$x("//input");

      // WALLET ADDRESS
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type(wallet);

      // AMOUNT
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type("1");

      // SUBMIT
      const [submitBtn] = await page.$x("//button[@type='submit']");
      await submitBtn.click();

      // CONFIRM (JIKA ADA)
      await page.waitForTimeout(2000);
      const confirm = await page.$x("//button/img");
      if (confirm.length > 0) {
        await confirm[0].click();
      }

      console.log("✅ SUCCESS");

    } catch (err) {
      console.log("❌ FAILED:", err.message);
    }

    if (i < wallets.length - 1) {
      console.log("⏳ Delay 1 minute...");
      await sleep(DELAY);
    }
  }

  console.log("\n🎉 ALL WALLET DONE");
  await browser.close();
})();
