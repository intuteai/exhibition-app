// Logic/Extraction.js

const REGEX = {
  PHONE: /(?:\+91[\s-]?)?\d{10}/g,
  EMAIL: /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
  WEBSITE: /(https?:\/\/)?(www\.)?([a-zA-Z0-9._-]+\.[a-zA-Z]{2,6})/gi,

  DESIGNATION: /\b(CEO|CTO|CFO|COO|CMO|Director|Manager|Engineer|Developer|Founder|Co-Founder|Owner|Partner|Consultant|President|VP|Lead|Head)\b/i,

  COMPANY_SUFFIXES: /\b(Pvt\.?\s*Ltd\.?|Private Limited|Limited|Ltd\.?|LLP|Technologies|Solutions|Services|Systems|Group|India)\b/i,
};

// 🔹 Safe Indian surname list (used only for scoring)
const INDIAN_SURNAME_SET = new Set([
  'kumar','singh','sharma','gupta','verma','patel','reddy','rao','nair',
  'iyer','das','jain','agarwal','mehta','shah','yadav','choudhary',
  'banerjee','ghosh','mishra','pandey','tiwari','kaur','devi',
  'malhotra','khanna','kapoor','bansal','mittal','goyal','sethi',
  'bhatt','joshi','pandit','desai','trivedi','parikh','modi',
  'menon','pillai','varma','chatterjee','mukherjee','sengupta'
]);

const INDIA_ADDRESS_TOKENS = [
  'road','rd','street','st','nagar','sector','phase','block','area',
  'mumbai','delhi','pune','bangalore','bengaluru','chennai','kolkata',
  'near','opp','opposite','floor','building','complex'
];

// --------------------
// Helpers
// --------------------

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  return null;
}

function getCompanyFromDomain(input) {
  if (!input) return null;

  let domain = input.includes('@') ? input.split('@')[1] : input;
  domain = domain
    .toLowerCase()
    .replace(/^(www|mail|info|sales|support)\./, '')
    .replace(/\.(com|in|co\.in|org|net)$/i, '')
    .replace(/(pvt|private|ltd|limited|llp|india|solutions|services|tech|systems)$/gi, '')
    .replace(/[-_]/g, ' ')
    .trim();

  if (domain.length < 3) return null;

  return domain
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function isAddressLine(line) {
  const lower = line.toLowerCase();
  return INDIA_ADDRESS_TOKENS.some(t => lower.includes(t));
}

// 🔹 Indian-name confidence helper
function looksLikeIndianName(line) {
  const words = line.toLowerCase().split(/\s+/);

  if (words.length < 2 || words.length > 4) return false;
  if (words.some(w => w.length < 2)) return false;

  return words.some(w => INDIAN_SURNAME_SET.has(w));
}

// --------------------
// Main Extraction
// --------------------

function extractCardFields(rawText) {
  const result = {
    name: null,
    designation: null,
    company_name: null,
    phone_primary: null,
    phone_secondary: null,
    email_primary: null,
    email_secondary: null,
    company_website: null,
    personal_website: null,
    raw_ocr: rawText,
  };

  if (!rawText) return result;

  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  const emails = rawText.match(REGEX.EMAIL) || [];
  const phones = rawText.match(REGEX.PHONE) || [];
  const websites = rawText.match(REGEX.WEBSITE) || [];

  // Emails
  result.email_primary = emails[0] || null;
  result.email_secondary = emails[1] || null;

  // Phones
  result.phone_primary = normalizePhone(phones[0]);
  result.phone_secondary = normalizePhone(phones[1]);

  // Website
  result.company_website = websites[0] || null;

  // Designation
  for (const line of lines) {
    if (REGEX.DESIGNATION.test(line)) {
      result.designation = line;
      break;
    }
  }

  // 🔥 Company name priority: EMAIL → WEBSITE → OCR
  result.company_name =
    getCompanyFromDomain(result.email_primary) ||
    getCompanyFromDomain(result.company_website);

  if (!result.company_name) {
    let bestScore = -Infinity;
    let bestLine = null;

    for (const line of lines) {
      let score = 0;

      if (REGEX.COMPANY_SUFFIXES.test(line)) score += 40;
      if (line === line.toUpperCase()) score += 20;
      if (line.length >= 5 && line.length <= 50) score += 10;
      if (isAddressLine(line)) score -= 60;
      if (REGEX.EMAIL.test(line) || REGEX.PHONE.test(line)) score -= 80;

      if (score > bestScore) {
        bestScore = score;
        bestLine = line;
      }
    }

    result.company_name = bestLine;
  }

  // --------------------
  // ✅ NAME EXTRACTION (INDIA-OPTIMIZED)
  // --------------------
  let bestName = null;
  let bestScore = -Infinity;

  for (const line of lines.slice(0, 8)) {
    let score = 0;
    const words = line.split(/\s+/);

    if (words.length >= 2 && words.length <= 4) score += 20;
    if (looksLikeIndianName(line)) score += 40;

    if (REGEX.DESIGNATION.test(line)) score -= 80;
    if (REGEX.COMPANY_SUFFIXES.test(line)) score -= 80;
    if (isAddressLine(line)) score -= 60;
    if (REGEX.EMAIL.test(line) || REGEX.PHONE.test(line)) score -= 100;
    if (/\d/.test(line)) score -= 40;

    if (score > bestScore) {
      bestScore = score;
      bestName = line;
    }
  }

  if (bestScore > 30) {
    result.name = bestName;
  }

  return result;
}

module.exports = {
  extractCardFields,
};