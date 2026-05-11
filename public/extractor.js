const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const fastcsv = require("fast-csv");

const DOWNLOADS_DIR = path.join(__dirname, "downloads");
const OUTPUT_CSV = path.join(__dirname, "data.csv");

// Helper: recursively get all PDFs
function getAllPDFs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) results = results.concat(getAllPDFs(filePath));
    else if (filePath.endsWith(".pdf")) results.push(filePath);
  }
  return results;
}

// Extract info using regex
async function extractDataFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data.text.replace(/\s+/g, " ");

  const accountMatch =
    text.match(/Account\s*(?:No\.?|Number)\s*[:.]?\s*([0-9]{10,14})/i);
  const unitsMatch =
    text.match(/Previous\s*Reading\s*Current\s*Reading\s*Units\s*\(KWh\)\s*(?:\d+\s*){2}(\d+)/i) ||
    text.match(/(\d+)\s*units\s*=/i);
  const priceMatch =
    text.match(/Current\s*Month.*?Rs\.?\s*([\d,]+\.\d{2})/i) ||
    text.match(/Electricity\s*Charges\s*for\s*current\s*month\s*([\d,]+\.\d{2})/i) ||
    text.match(/Your\s*Electricity\s*Charges\s*for\s*the\s*Period\s*([\d,]+\.\d{2})/i) ||
    text.match(/Amount\s*Payable\s*(?:within|after)?\s*Due\s*Date.*?Rs\.?\s*([\d,]+\.\d{2})/i);

  const accountNumber = accountMatch ? accountMatch[1] : "N/A";
  const currentMonthUnits = unitsMatch ? unitsMatch[1] : "N/A";
  const currentMonthPrice = priceMatch ? priceMatch[1] : "N/A";

  return { accountNumber, currentMonthUnits, currentMonthPrice, filePath };
}

// Load already processed data (if data.csv exists)
function loadProcessedAccounts() {
  const processed = new Set();
  if (fs.existsSync(OUTPUT_CSV)) {
    const data = fs.readFileSync(OUTPUT_CSV, "utf8");
    const lines = data.split("\n").slice(1); // skip header
    for (const line of lines) {
      const [accountNumber] = line.split(",");
      if (accountNumber) processed.add(accountNumber.trim());
    }
  }
  return processed;
}

(async () => {
  console.log("🔍 Scanning for PDFs...");
  const pdfFiles = getAllPDFs(DOWNLOADS_DIR);

  if (pdfFiles.length === 0) {
    console.error("❌ No PDF files found in downloads folder!");
    return;
  }

  const processedAccounts = loadProcessedAccounts();
  console.log(`🧾 Already processed ${processedAccounts.size} account(s).`);

  const results = [];

  for (const file of pdfFiles) {
    try {
      const info = await extractDataFromPDF(file);

      // Skip if already processed
      if (processedAccounts.has(info.accountNumber)) {
        console.log(`⏭️ Skipping ${info.accountNumber} (already processed)`);
        continue;
      }

      console.log(
        `✅ ${path.basename(file)} → Account: ${info.accountNumber}, Units: ${info.currentMonthUnits}, Price: ${info.currentMonthPrice}`
      );
      results.push(info);
    } catch (err) {
      console.error(`⚠️ Failed to read ${file}:`, err.message);
    }
  }

  if (results.length === 0) {
    console.log("📂 No new records to add. All accounts already processed.");
    return;
  }

  // Append to CSV if exists, otherwise create new file
  const ws = fs.createWriteStream(OUTPUT_CSV, { flags: fs.existsSync(OUTPUT_CSV) ? "a" : "w" });

  fastcsv
    .write(results, {
      headers: !fs.existsSync(OUTPUT_CSV), // only write headers if file is new
      includeEndRowDelimiter: true,
    })
    .on("finish", () => {
      console.log(`\n📊 Added ${results.length} new records to ${OUTPUT_CSV}`);
    })
    .pipe(ws);
})();
