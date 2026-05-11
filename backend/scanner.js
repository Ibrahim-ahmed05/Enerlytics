const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "public", "data.csv");
const ACCOUNTS_FILE = path.join(__dirname, "..", "public", "accountnumbers..csv");
const KE_IFRAME_URL = "https://staging.ke.com.pk:24555/ReBrand/DuplicateBill.aspx";

// Helper to read existing account numbers
function getExisitingAccounts() {
    const accounts = new Set();

    // Read from data.csv
    if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, "utf8");
        const lines = content.split("\n");
        for (let i = 1; i < lines.length; i++) {
            const acc = lines[i].split(",")[0];
            if (acc) accounts.add(acc.trim());
        }
    }

    // Read from accountnumbers..csv
    if (fs.existsSync(ACCOUNTS_FILE)) {
        const content = fs.readFileSync(ACCOUNTS_FILE, "utf8");
        const lines = content.split("\n");
        for (let i = 1; i < lines.length; i++) {
            const acc = lines[i].trim();
            if (acc) accounts.add(acc);
        }
    }

    return accounts;
}

// Helper to generate a random 13-digit account number starting with 04000
function generateAccountNumber() {
    // 04000 + 8 random digits
    let num = "04000";
    for (let i = 0; i < 8; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

async function scanAccounts(attempts = 20) {
    console.log(`🚀 Starting account scanner. Target: ${attempts} attempts.`);

    const existing = getExisitingAccounts();
    console.log(`ℹ️ Found ${existing.size} existing accounts to skip.`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let foundCount = 0;

    for (let i = 0; i < attempts; i++) {
        const accountNumber = generateAccountNumber();

        if (existing.has(accountNumber)) {
            console.log(`⏭️ Skipping existing: ${accountNumber}`);
            i--; // Don't count as an attempt
            continue;
        }

        try {
            console.log(`\n🔍 [${i + 1}/${attempts}] Checking: ${accountNumber}`);
            await page.goto(KE_IFRAME_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

            // Fill account number
            await page.fill("#txtAccNo", accountNumber);

            // Get captcha
            const captchaText = (await page.textContent("#lblCaptcha")).trim();
            await page.fill("#txtimgcode", captchaText);

            // Click View Bill and wait for something to happen
            await page.click("#btnViewBill");

            // Check if we hit the download page OR an error message
            // Based on scraper.js, valid accounts show Download buttons
            try {
                // Wait for either download buttons (success) OR an error label
                // We'll use a short timeout to keep it fast
                await Promise.race([
                    page.waitForSelector('input[value="Download"]', { timeout: 10000 }),
                    page.waitForSelector('#lblError', { timeout: 10000 }) // Assuming #lblError exists based on typical ASP.NET
                ]);

                const isSuccess = await page.$('input[value="Download"]');

                if (isSuccess) {
                    console.log(`✅ VALID ACCOUNT FOUND: ${accountNumber}`);
                    existing.add(accountNumber);

                    // Append to file
                    if (!fs.existsSync(ACCOUNTS_FILE)) {
                        fs.writeFileSync(ACCOUNTS_FILE, "accountNumber\n");
                    }
                    fs.appendFileSync(ACCOUNTS_FILE, `${accountNumber}\n`);
                    foundCount++;
                } else {
                    console.log(`❌ Invalid account: ${accountNumber}`);
                }

            } catch (err) {
                console.log(`❌ Timeout or error for ${accountNumber}`);
            }

        } catch (error) {
            console.error(`⚠️ Error during check: ${error.message}`);
        }

        // Small delay between attempts to be nice to the server
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    console.log(`\n🏁 Scan complete. Found ${foundCount} new valid account(s).`);
}

// Run scanner
const targetAttempts = parseInt(process.argv[2]) || 50;
scanAccounts(targetAttempts).catch(console.error);
