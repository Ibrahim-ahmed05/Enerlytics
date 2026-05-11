const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const fastcsv = require("fast-csv");

const DOWNLOADS_DIR = path.join(__dirname, "downloads");
const OUTPUT_CSV = path.join(__dirname, "..", "public", "data.csv");

// Helper: get all PDFs for a specific account
function getPDFsForAccount(accountNumber) {
  const accountDir = path.join(DOWNLOADS_DIR, accountNumber);
  if (!fs.existsSync(accountDir)) {
    return [];
  }

  const files = fs.readdirSync(accountDir);
  return files
    .filter(file => file.endsWith(".pdf"))
    .map(file => path.join(accountDir, file))
    .sort(); // Sort to maintain order
}

// Extract info using regex
async function extractDataFromPDF(filePath, targetAccountNumber = null) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data.text.replace(/\s+/g, " ");

  const accountMatch =
    text.match(/Account\s*(?:No\.?|Number)\s*[:.]?\s*([0-9]{10,14})/i);
  
  // More robust units mapping
  const unitsMatch =
    text.match(/Units\s*\(KWh\)\s*[:.]?\s*(\d+)/i) ||
    text.match(/Units\s*Consumed\s*[:.]?\s*(\d+)/i) ||
    text.match(/Previous\s*Reading\s*Current\s*Reading\s*Units\s*\(KWh\)\s*(?:\d+\s*){2}(\d+)/i) ||
    text.match(/(\d+)\s*units\s*=/i);

  // More robust price matching (Total Amount Due, Amount Payable, etc.)
  const priceMatch =
    text.match(/Amount\s*Payable\s*(?:by|within|after)?\s*Due\s*Date.*?Rs\.?\s*([\d,]+\.\d{2})/i) ||
    text.match(/Total\s*Amount\s*Due.*?Rs\.?\s*([\d,]+\.\d{2})/i) ||
    text.match(/Current\s*Month.*?Rs\.?\s*([\d,]+\.\d{2})/i) ||
    text.match(/Electricity\s*Charges\s*for\s*current\s*month\s*([\d,]+\.\d{2})/i) ||
    text.match(/Total\s*Variable\s*Charges.*?Rs\.?\s*([\d,]+\.\d{2})/i) ||
    text.match(/Amount\s*Payable\s*[:.]?\s*([\d,]+\.\d{2})/i); // Generic fallback

  let extractedAccountNumber = accountMatch ? accountMatch[1] : "N/A";
  const currentMonthUnits = (unitsMatch ? unitsMatch[1] : "0").trim();
  const currentMonthPrice = (priceMatch ? priceMatch[1] : "0").trim();

  // If extraction failed or found a different number, fallback to the target account number
  if (targetAccountNumber && (extractedAccountNumber === "N/A" || !extractedAccountNumber.includes(targetAccountNumber))) {
    extractedAccountNumber = targetAccountNumber;
  }

  return { accountNumber: extractedAccountNumber, currentMonthUnits, currentMonthPrice, filePath };
}

// Extract data for a specific account number
async function extractDataForAccount(accountNumber) {
  console.log(`🔍 Extracting data for account: ${accountNumber}`);

  const pdfFiles = getPDFsForAccount(accountNumber);

  if (pdfFiles.length === 0) {
    console.error(`❌ No PDF files found for account ${accountNumber} in downloads folder!`);
    return [];
  }

  const results = [];

  for (const file of pdfFiles) {
    try {
      const info = await extractDataFromPDF(file, accountNumber);
      console.log(
        `✅ ${path.basename(file)} → Units: ${info.currentMonthUnits}, Price: ${info.currentMonthPrice}`
      );
      results.push(info);
    } catch (err) {
      console.error(`⚠️ Failed to read ${file}:`, err.message);
    }
  }

  // Update CSV file with new data
  if (results.length > 0) {
    await updateCSV(results, accountNumber);
  }

  return results;
}

// Update CSV file with extracted data
async function updateCSV(results, accountNumber) {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(OUTPUT_CSV);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const existingData = [];
    if (fs.existsSync(OUTPUT_CSV)) {
      try {
        const stats = fs.statSync(OUTPUT_CSV);
        if (stats.size > 0) {
          const data = fs.readFileSync(OUTPUT_CSV, "utf8");
          const lines = data.split("\n").filter(l => l.trim().length > 0);
          
          if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
              if (parts.length >= 3 && parts[0]) {
                existingData.push({
                  accountNumber: parts[0],
                  currentMonthUnits: parts[1],
                  currentMonthPrice: parts[2]
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('⚠️ Error reading existing CSV:', err.message);
      }
    }

    const filteredExisting = existingData.filter(d => d.accountNumber !== accountNumber);
    const allData = [...filteredExisting, ...results];

    const ws = fs.createWriteStream(OUTPUT_CSV);

    ws.on("finish", () => {
      console.log(`✅ CSV successfully saved with ${allData.length} total records.`);
      resolve();
    });

    ws.on("error", (err) => {
      console.error("❌ CSV Write error:", err);
      reject(err);
    });

    fastcsv
      .write(allData, { headers: true })
      .on("error", (err) => {
        console.error("❌ CSV Formatter error:", err);
        reject(err);
      })
      .pipe(ws);
  });
}

// Export the function for use in other modules
module.exports = { extractDataForAccount };

// If run directly, use account number from command line argument
if (require.main === module) {
  const accountNumber = process.argv[2];
  if (!accountNumber) {
    console.error("Usage: node extractor.js <accountNumber>");
    process.exit(1);
  }

  extractDataForAccount(accountNumber)
    .then((results) => {
      console.log(`\n✅ Extracted ${results.length} record(s) for account ${accountNumber}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error.message);
      process.exit(1);
    });
}
