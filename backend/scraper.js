const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const ACCOUNTS_FILE = path.join(__dirname, "accounts.csv");
const DOWNLOADS_DIR = path.join(__dirname, "downloads");
const KE_IFRAME_URL = "https://staging.ke.com.pk:24555/ReBrand/DuplicateBill.aspx";
const CONCURRENCY = 5;

// Read accounts from CSV
function readAccounts() {
  return new Promise((resolve, reject) => {
    const accounts = [];
    fs.createReadStream(ACCOUNTS_FILE)
      .pipe(csv())
      .on("data", (row) => {
        if (row.account) accounts.push(row.account.trim());
      })
      .on("end", () => {
        console.log(`📄 Loaded ${accounts.length} accounts`);
        resolve(accounts);
      })
      .on("error", reject);
  });
}

// Random delay (anti-ban)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => sleep(200 + Math.random() * 600);

// Process one account
async function processAccount(context, accountNumber) {
  const page = await context.newPage();

  try {
    console.log(`🌐 Processing ${accountNumber}`);
    await page.goto(KE_IFRAME_URL, { waitUntil: "domcontentloaded" });

    // Fill account number
    await page.fill("#txtAccNo", accountNumber);

    // Captcha
    const captchaText = (await page.textContent("#lblCaptcha")).trim();
    await page.fill("#txtimgcode", captchaText);

    // View bill (retry if fails)
    let success = false;
    for (let retry = 0; retry < 3; retry++) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle" }),
        page.click("#btnViewBill"),
      ]);

      if (await page.$('input[value="Download"]')) {
        success = true;
        break;
      }
      console.log(`⚠️ Retry captcha for ${accountNumber}`);
      await sleep(1000);
    }

    if (!success) {
      console.log(`❌ Failed captcha for ${accountNumber}`);
      return;
    }

    // Wait download buttons
    await page.waitForSelector('input[value="Download"]');

    const accountDir = path.join(DOWNLOADS_DIR, accountNumber);
    fs.mkdirSync(accountDir, { recursive: true });

    const buttons = await page.$$('input[value="Download"]');
    console.log(`🧾 ${accountNumber} → ${buttons.length} bills`);

    for (let i = 0; i < buttons.length; i++) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        buttons[i].click(),
      ]);

      const filePath = path.join(accountDir, `bill_${i + 1}.pdf`);
      await download.saveAs(filePath);
      console.log(`✅ ${accountNumber} bill ${i + 1}`);
      await randomDelay();
    }

    console.log(`🎉 Done: ${accountNumber}`);
  } catch (err) {
    console.error(`❌ Error ${accountNumber}:`, err.message);
  } finally {
    await page.close();
  }
}

// Determine Chrome/Chromium executable path based on platform
function getChromePath() {
  const platform = process.platform;
  if (platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else if (platform === "win32") {
    // Common Chrome install paths on Windows
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return undefined; // Let Playwright use its bundled browser
  }
  return undefined; // Let Playwright use its bundled browser on Linux
}

(async () => {
  // Check if a specific account number was passed as argument
  const singleAccount = process.argv[2];

  // Launch Chromium
  const chromePath = getChromePath();
  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  };
  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    acceptDownloads: true,
    downloadsPath: DOWNLOADS_DIR,
  });

  // 🚀 Block useless resources (BIG SPEED BOOST)
  await context.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "font", "stylesheet"].includes(type)) route.abort();
    else route.continue();
  });

  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

  if (singleAccount) {
    // Process a single account (called from the app)
    const accountDir = path.join(DOWNLOADS_DIR, singleAccount);
    if (fs.existsSync(accountDir)) {
      const existingFiles = fs.readdirSync(accountDir).filter(f => f.endsWith('.pdf'));
      if (existingFiles.length > 0) {
        console.log(`ℹ️ Bills already exist for account ${singleAccount} in ${accountDir}. Skipping scraping.`);
        process.exit(0);
      }
    }

    console.log(`🔄 Processing single account: ${singleAccount}`);
    await processAccount(context, singleAccount);
  } else {
    // Process all accounts from CSV (batch mode)
    const accounts = await readAccounts();

    // Run in parallel batches
    for (let i = 0; i < accounts.length; i += CONCURRENCY) {
      const batch = accounts.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map((acc) => processAccount(context, acc)));
    }
  }

  console.log("\n✅ ALL ACCOUNTS COMPLETED");
  await browser.close();
})();
