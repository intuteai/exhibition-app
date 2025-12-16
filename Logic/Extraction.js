// logic/Extraction.js

const REGEX = {
    PHONE: /(?:Tel|Mobile|Ph|Call|T|M):?\s*(\+?\d{1,4}[-.\s]?[\(\[]?\d{2,4}[\)\]]?[-.\s]?\d{2,4}[-.\s]?\d{4,10})/gi,
    EMAIL: /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
    WEBSITE: /(?:https?:\/\/|www\.)?([a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)/gi, 
    
    DESIGNATION_KEYWORDS: /\b(CEO|CTO|CFO|COO|CMO|CIO|MD|Managing Director|Director|Sr\.|Senior|Manager|Architect|Lead|Engineer|Developer|Designer|Analyst|Founder|Co-Founder|Partner|Consultant|Vice President|VP|President|Head|Chief|Executive|Assistant|Associate|Coordinator|Specialist|Officer|Proprietor|Owner|General Manager|GM|Asst)\b/i,
    COMPANY_SUFFIXES: /\b(Pvt\.?\s*Ltd\.?|Private Limited|Limited|Ltd\.?|LLP|Group|Technologies|Tech|Solutions|Solution|Enterprise|Enterprises|Services|Service|Innovations|Innovation|Corporation|Corp\.?|Industries|Industry|Systems|System|Consulting|Consultancy|Studio|Agency|Labs?|Global|International|India|Ventures?|Co\.?)\b/i,
    
    PRINTER_NOISE: /\b(printer|scan|scanned|copy|xerox|quality|resolution|dpi|toner|cartridge)\b/i,
    SOCIAL_MEDIA: /\b(facebook|twitter|instagram|linkedin|youtube|whatsapp|telegram|follow|connect|join|like)\b/i,
    COMMON_NOISE: /\b(business card|visiting card|card|logo|qr code|scan me|fax|p.o.|pin code|gst|vat|cst|t.o.|o.t.|p.t.|authorised|authorized|prop\.)\b/i,
};

const INDIA_ADDRESS_TOKENS = [
    "nagar", "layout", "colony", "enclave", "sector", "phase", "block", "road", "rd", "street", "st",
    "main", "cross", "circle", "avenue", "marg", "bazar", "market", "chowk", "hno", "house", "plot",
    "bldg", "building", "tower", "flat", "floor", "near", "opp", "opposite", "beside", "gate", "wing",
    "complex", "estate", "park", "villa", "vihar", "area", "mumbai", "delhi", "bangalore", "pune"
];

const INDIAN_NAME_PATTERNS = /\b(kumar|raj|singh|sharma|gupta|reddy|patel|nair|rao|krishna|prasad|das|jain|agarwal|shah|verma|yadav|mehta|kaur|devi)\b/i;

const NOISE_WORDS = new Set([
    'printer', 'scan', 'scanned', 'copy', 'quality', 'card', 'business', 'visiting', 'contact', 'info',
    'website', 'email', 'phone', 'mobile', 'tel', 'fax', 'call', 't', 'm', 'follow', 'connect', 'www',
    'http', 'https', 'address', 'proprietor', 'owner', 'prop', 'authorized', 'authorised', 'pvt', 'ltd'
]);

// ------------------------
// HELPERS
// ------------------------

function cleanNameCandidate(name) {
    if (!name) return '';
    let cleaned = name.trim();
    cleaned = cleaned.replace(REGEX.COMPANY_SUFFIXES, '').trim();

    const words = cleaned.split(/\s+/).filter(word =>
        !NOISE_WORDS.has(word.toLowerCase().replace(/[\.]/g, ''))
    );
    cleaned = words.join(' ');

    const wordCount = words.length;
    if (wordCount < 2 || wordCount > 7) return '';

    const allowed = cleaned.replace(/[^a-zA-Z\s\.\'\-&,]/g, '');
    if (allowed.length / cleaned.length < 0.8) return '';

    if ((cleaned.match(/\d/g) || []).length > 2) return '';

    return cleaned;
}

function scoreNameCandidate(line, existingDesignation) {
    let score = 0;
    const lower = line.toLowerCase();

    if (line.length > 60) score -= 20;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 7) score += 40;
    if (INDIAN_NAME_PATTERNS.test(lower)) score += 20;
    if (/\d/.test(line)) score -= 30;
    if (existingDesignation && lower.includes(existingDesignation.toLowerCase())) score -= 100;
    if (REGEX.COMPANY_SUFFIXES.test(line)) score -= 40;
    if (/\b(Dr|Mr|Ms|Er)\./i.test(line)) score += 15;

    return score;
}

function scoreCompanyCandidate(line, companyBase) {
    let score = 0;
    const lower = line.toLowerCase();

    if (companyBase && lower.includes(companyBase)) score += 100; // Strong boost

    if (REGEX.COMPANY_SUFFIXES.test(line)) score += 50;

    if (line.length >= 8 && line.length <= 80) score += 20;

    const hasAddress = INDIA_ADDRESS_TOKENS.some(t => lower.includes(t));
    if (hasAddress) score -= 80;

    if (REGEX.PHONE.test(line) || REGEX.EMAIL.test(line) || REGEX.WEBSITE.test(line)) score -= 100;

    // Penalize slogans/noise
    if (lower.includes('provide') || lower.includes('solutions') || lower.includes('cutting-edge')) score -= 70;

    return score;
}

function getCompanyBaseFromDomain(input) {
    if (!input) return null;
    let base = input.toLowerCase();

    if (base.includes('@')) base = base.split('@')[1];
    base = base.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0].split('?')[0];

    // Remove TLD and common suffixes more aggressively
    base = base.replace(/\.(com|in|co\.in|org|net|io|co\.uk)$/i, '');
    base = base.replace(/[-](design|pvt|ltd|solutions|tech|systems|group|info)$/g, ''); // remove trailing hyphenated junk
    base = base.replace(/[-]/g, ''); // remove remaining hyphens

    // Remove known suffixes
    base = base.replace(/(ltd|pvt|solution|tech|system|group|corp|info|online|web|india|co)$/g, '');

    base = base.trim();
    return base.length >= 3 ? base : null;
}

// ------------------------
// PHONE & NOISE
// ------------------------

function normalizePhone(raw) {
    if (!raw || typeof raw !== 'string') return null;

    let phone = raw.replace(/\b(Tel|Mobile|Ph|T|M|Call|Phone|Mob)[:\s]*/gi, '').trim();
    phone = phone.replace(/[^\d+]/g, '');

    if (phone.length < 10) return null;

    // Reject obvious placeholders
    if (/^0+$/.test(phone.replace(/\+/g, ''))) return null;

    if (phone.startsWith('91') && phone.length === 12) return '+91' + phone.slice(2);
    if (phone.startsWith('0') && phone.length === 11) return '+91' + phone.slice(1);
    if (phone.startsWith('+91') && phone.length === 13) return phone;
    if (phone.length === 10) return '+91' + phone;
    if (/^\d{11,13}$/.test(phone) && phone.startsWith('0')) return '+91' + phone.slice(1);

    return null;
}

function scorePhoneIndia(phoneStr) {
    const normalized = normalizePhone(phoneStr);
    if (!normalized) return 0;
    return /^\+91\d{10}$/.test(normalized) ? 100 : 80;
}

function isNoiseLine(line) {
    if (!line) return true;
    const lower = line.toLowerCase();
    return REGEX.PRINTER_NOISE.test(lower) ||
           REGEX.SOCIAL_MEDIA.test(lower) ||
           REGEX.COMMON_NOISE.test(lower) ||
           lower.includes('qr') ||
           /^[-_=+*.]+$/.test(line.trim()) ||
           line.length < 3;
}

// ------------------------
// ENTITIES & EXTRACTION
// ------------------------

function extractEntities(rawText) {
    const emails = [...new Set(
        (rawText.match(REGEX.EMAIL) || []).filter(e => e.length > 5 && e.includes('.'))
    )];

    const websites = [...new Set(
        Array.from(rawText.matchAll(REGEX.WEBSITE), m => {
            let site = m[1] || m[0];
            site = site.replace(/^(https?:\/\/)?(www\.)?/i, '');
            return site.split('/')[0].split('?')[0];
        }).filter(s => s.length > 3 && s.includes('.'))
    )];

    return { emails, websites };
}

function extractCardFields(rawText, detectedName = '') {
    const { emails, websites } = extractEntities(rawText);
    const lines = rawText.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2 && !isNoiseLine(l));

    const primaryDomain = websites[0] || (emails[0] ? emails[0].split('@')[1] : null);
    const companyBase = getCompanyBaseFromDomain(primaryDomain);

    const result = {
        name: detectedName || null,
        designation: null,
        company_name: null,
        email_primary: emails[0] || null,
        email_secondary: emails[1] || null,
        company_website: websites[0] || null,
        personal_website: websites[1] || null,
        raw_ocr: rawText,
    };

    let designationLine = null;

    for (const line of lines) {
        if (REGEX.EMAIL.test(line) || REGEX.PHONE.test(line) || REGEX.WEBSITE.test(line)) continue;

        if (REGEX.DESIGNATION_KEYWORDS.test(line)) {
            // Take only first part if pipe-separated
            result.designation = line.split('|')[0].trim();
            designationLine = line;
            continue;
        }
    }

    const nameCandidates = [];
    const companyCandidates = [];

    for (const line of lines) {
        if (line === designationLine) continue;
        if (REGEX.EMAIL.test(line) || REGEX.PHONE.test(line) || REGEX.WEBSITE.test(line)) continue;

        // Likely name if short and has Indian name patterns or title
        if (scoreNameCandidate(line, result.designation) > 30) {
            nameCandidates.push(line);
        }

        const companyScore = scoreCompanyCandidate(line, companyBase);
        if (companyScore > 20) {
            companyCandidates.push({ text: line, score: companyScore });
        }
    }

    // Pick best name
    if (nameCandidates.length > 0) {
        const best = nameCandidates
            .map(c => ({ text: c, score: scoreNameCandidate(c, result.designation) }))
            .sort((a, b) => b.score - a.score)[0];
        const cleaned = cleanNameCandidate(best.text);
        if (cleaned) result.name = cleaned;
    }

    // Pick best company
    if (companyCandidates.length > 0) {
        companyCandidates.sort((a, b) => b.score - a.score);
        result.company_name = companyCandidates[0].text;
    }

    return result;
}

// ------------------------
// EXPORTS
// ------------------------

module.exports = {
    extractCardFields,
    normalizePhone,
    scorePhoneIndia,
    getCompanyBaseFromDomain,
    isNoiseLine,
    cleanNameCandidate,
    scoreNameCandidate,
    scoreCompanyCandidate
};