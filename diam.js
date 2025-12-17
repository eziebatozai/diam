
import fs from "fs";
import puppeteer from "puppeteer";

const DELAY = 60 * 1000; // 1 menit

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const wallets = fs.readFileSync("wallet.txt", "utf8")
  .split("\n")
  .map(w => w.trim())
  .filter(Boolean);

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // ganti true jika di VPS
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    console.log(`\n[${i + 1}/${wallets.length}] Processing ${wallet}`);

    try {
      await page.goto("https://campaign.diamante.io/transactions", {
        waitUntil: "networkidle2"
      });

      // open modal
      await page.waitForXPath("//button/span", { timeout: 15000 });
      const [openBtn] = await page.$x("//button/span");
      await openBtn.click();

      // input fields
      await page.waitForXPath("//input", { timeout: 15000 });
      const inputs = await page.$x("//input");

      // wallet address
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type(wallet);

      // amount = 1
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type("1");

      // submit
      const [submitBtn] = await page.$x("//button[@type='submit']");
      await submitBtn.click();

      // confirm popup (jika ada)
      await page.waitForTimeout(2000);
      const confirm = await page.$x("//button/img");
      if (confirm.length > 0) {
        await confirm[0].click();
      }

      console.log("✔ Success");

    } catch (err) {
      console.log("✖ Failed:", err.message);
    }

    if (i < wallets.length - 1) {
      console.log("⏳ Waiting 1 minute...");
      await sleep(DELAY);
    }
  }

  await browser.close();
  console.log("\n🎉 All wallets processed");
})();
