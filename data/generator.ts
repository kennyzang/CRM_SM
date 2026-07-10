/**
 * Test Data Generator — CRM Securemetric
 *
 * Generates domain-realistic data for a cybersecurity sales CRM operating
 * in the Malaysian enterprise market.  All templates are drawn from real
 * deal patterns: banking, telco, government, O&G, healthcare, education.
 *
 * No third-party library required — the business context is too specific for
 * generic faker output to be convincing.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr].sort(() => Math.random() - 0.5);
  return copy.slice(0, n);
}

function int(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function digits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
}

// Counter for ensuring uniqueness
let uniqueCounter = 0;

// Generate a unique suffix based on timestamp and counter
function uniqueSuffix(): string {
  uniqueCounter++;
  const timestamp = Date.now().toString(36);
  const counter = uniqueCounter.toString(36);
  return `${timestamp}${counter}`;
}

// ─── Prospect Companies (Malaysian enterprise, cybersecurity buyers) ───────────

const COMPANIES: { name: string; sector: string }[] = [
  // Banking & Finance
  { name: 'Maybank Berhad',            sector: 'Banking' },
  { name: 'CIMB Group Holdings',       sector: 'Banking' },
  { name: 'Public Bank Berhad',        sector: 'Banking' },
  { name: 'RHB Banking Group',         sector: 'Banking' },
  { name: 'AmBank Group',              sector: 'Banking' },
  { name: 'Hong Leong Bank',           sector: 'Banking' },
  { name: 'Bank Rakyat',               sector: 'Banking' },
  { name: 'Affin Bank Berhad',         sector: 'Banking' },
  // Telco
  { name: 'Telekom Malaysia Berhad',   sector: 'Telco' },
  { name: 'Maxis Communications',      sector: 'Telco' },
  { name: 'Celcom Axiata Berhad',      sector: 'Telco' },
  { name: 'Digi Telecommunications',  sector: 'Telco' },
  { name: 'U Mobile Sdn Bhd',          sector: 'Telco' },
  // Government & GLC
  { name: 'PETRONAS',                  sector: 'Oil & Gas' },
  { name: 'Tenaga Nasional Berhad',    sector: 'Utilities' },
  { name: 'MIMOS Berhad',              sector: 'Government' },
  { name: 'CyberSecurity Malaysia',    sector: 'Government' },
  { name: 'MAMPU (JPICT)',             sector: 'Government' },
  { name: 'LHDN (IRB Malaysia)',       sector: 'Government' },
  { name: 'Perbadanan Nasional Berhad',sector: 'GLC' },
  // Healthcare
  { name: 'KPJ Healthcare Berhad',     sector: 'Healthcare' },
  { name: 'IHH Healthcare Malaysia',   sector: 'Healthcare' },
  { name: 'Pantai Holdings Sdn Bhd',   sector: 'Healthcare' },
  // Education
  { name: 'Universiti Malaya',         sector: 'Education' },
  { name: 'Multimedia University',     sector: 'Education' },
  { name: 'Asia Pacific University',   sector: 'Education' },
  // Manufacturing & Retail
  { name: 'MISC Berhad',               sector: 'Shipping' },
  { name: 'Sime Darby Berhad',         sector: 'Conglomerate' },
  { name: 'IOI Corporation',           sector: 'Plantation' },
  { name: 'Sunway Group',              sector: 'Conglomerate' },
];

// ─── Deal Types (cybersecurity product/service categories) ────────────────────

const DEAL_TYPES = [
  'PAM (Privileged Access Management) Implementation',
  'SOC-as-a-Service Evaluation',
  'Managed Detection & Response (MDR) RFP',
  'Zero-Trust Network Access Deployment',
  'Endpoint Detection & Response (EDR) Rollout',
  'Identity & Access Management (IAM) Platform Refresh',
  'OT/ICS Security Assessment',
  'Cloud Security Posture Management (CSPM)',
  'Penetration Testing — Annual Engagement',
  'Security Awareness Training Programme',
  'SIEM Platform Migration',
  'Data Loss Prevention (DLP) Implementation',
  'Multi-Factor Authentication (MFA) Expansion',
  'Vulnerability Management Programme',
  'Red Team Exercise — Critical Infrastructure',
];

// ─── Lead Name ────────────────────────────────────────────────────────────────

/**
 * Generates a CRM-style lead name: "Company — Deal Type"
 * e.g. "Maybank Berhad — PAM Implementation" or "PETRONAS — OT/ICS Security Assessment"
 * Adds a unique suffix to ensure no duplicates
 */
export function generateLeadName(): string {
  const company  = pick(COMPANIES).name;
  const dealType = pick(DEAL_TYPES);
  const suffix = uniqueSuffix().substring(0, 8); // Short suffix to keep within 200 chars
  return `${company} — ${dealType} (${suffix})`.slice(0, 200);
}

// ─── Customer Name (company with Malaysian legal suffix) ──────────────────────

const MY_PREFIXES = ['Tech', 'Digital', 'Smart', 'Global', 'Asia', 'Maju', 'Jaya', 'Prima', 'Utama', 'Mara', 'Nexus', 'Apex', 'Elite', 'Crest'];
const MY_CORES    = ['Systems', 'Solutions', 'Software', 'Technologies', 'Innovations', 'Ventures', 'Consulting', 'Networks', 'Dynamics', 'Integrations'];
const MY_SUFFIXES = ['Sdn Bhd', 'Sdn. Bhd.', 'Bhd', 'Enterprise', 'Group'];

export function generateCustomerName(): string {
  const suffix = uniqueSuffix().substring(0, 6);
  return `${pick(MY_PREFIXES)} ${pick(MY_CORES)} ${pick(MY_SUFFIXES)} (${suffix})`;
}

// ─── Registration Code (Malaysia SSM format) ──────────────────────────────────

export function generateRegistrationCode(): string {
  // Use timestamp (mod 1 000 000) + uniqueCounter for a 6-digit numeric unique part.
  // Avoids base-36 characters bleeding into numeric SSM fields.
  uniqueCounter++;
  const tsDigits = (Date.now() % 1_000_000).toString().padStart(6, '0');
  const ctr      = (uniqueCounter % 100).toString().padStart(2, '0');
  if (Math.random() > 0.5) {
    // New SSM / MBR format: YYYY + 8 digits
    return `${int(2010, 2024)}${tsDigits}${ctr}`;
  }
  // Old SSM / ROC format: 6 digits + dash + letter
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  return `${tsDigits}${ctr}-${letter}`;
}

// ─── Malaysian Email ───────────────────────────────────────────────────────────

const MY_FIRST_NAMES = ['ahmad', 'muhammad', 'ali', 'ibrahim', 'hassan', 'siti', 'nurul', 'farah', 'lim', 'tan', 'ng', 'wong', 'raj', 'kumar', 'azman', 'hafiz', 'izzat', 'syafiq', 'nadia', 'amirah'];
const MY_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'my.com', 'mail.com'];

export function generateMalaysianEmail(): string {
  const suffix = uniqueSuffix();
  return `${pick(MY_FIRST_NAMES)}${suffix}@${pick(MY_EMAIL_DOMAINS)}`;
}

// ─── Malaysian Address ────────────────────────────────────────────────────────

const MY_CITIES  = ['Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Cyberjaya', 'Putrajaya', 'Klang', 'Johor Bahru', 'Georgetown', 'Ipoh'];
const MY_STATES  = ['Selangor', 'Wilayah Persekutuan', 'Johor', 'Perak', 'Pulau Pinang'];
const MY_STREETS = ['Jalan Ampang', 'Persiaran Damansara', 'Lorong Bukit Bintang', 'Lebuh Cheras', 'Jalan Kepong', 'Persiaran Semarak', 'Jalan Puchong', 'Jalan Ipoh'];

const POSTCODE_RANGES: Record<string, [number, number]> = {
  'Selangor':            [40000, 68100],
  'Wilayah Persekutuan': [50000, 60000],
  'Johor':               [79000, 86900],
  'Perak':               [30000, 36810],
  'Pulau Pinang':        [10000, 14400],
};

export function generateMalaysianAddress(): string {
  const state    = pick(MY_STATES);
  const city     = pick(MY_CITIES);
  const [lo, hi] = POSTCODE_RANGES[state] ?? [40000, 99999];
  return `No. ${int(1, 50)}, ${pick(MY_STREETS)}, ${int(lo, hi)} ${city}, ${state}, Malaysia`;
}

// ─── Deal Details (realistic sales note) ─────────────────────────────────────

const CONTACT_CHANNELS = [
  'LinkedIn outreach by account manager',
  'inbound inquiry via Securemetric website',
  'referral from existing customer (CIMB Group)',
  'met at NACSA Cybersecurity Summit 2025',
  'cold-call converted to discovery call',
  'introduced by technology partner (Microsoft Malaysia)',
  'responding to RFP published on ePerolehan portal',
  'followed up from GITEX Asia 2025 business card',
];

const PAIN_POINTS = [
  'excessive privileged accounts with no audit trail',
  'recent internal audit flagged gaps in access control',
  'BNM RMiT compliance deadline approaching (Q3 2025)',
  'recent ransomware incident on a peer bank triggered board-level review',
  'legacy SIEM generating too many false positives',
  'no visibility into OT network lateral movement',
  'MFA not enforced for remote VPN access',
  'inability to detect insider threats in real time',
  'cloud workloads growing faster than security policy can cover',
  'PDPA audit found unencrypted PII in file shares',
];

const ROLES = [
  'CISO', 'Head of IT Security', 'VP Technology', 'IT Security Manager',
  'Group Head of Cyber Risk', 'Chief Risk Officer', 'DGM IT Infrastructure',
];

const MY_NAMES = [
  'Ahmad Rashid bin Yusof', 'Lim Wei Cheng', 'Siti Norzahra binti Kamaluddin',
  'Tan Boon Huat', 'Rajendran a/l Murugan', 'Nurul Ain binti Hassan',
  'Muhammad Hafiz bin Othman', 'Wong Kar Wei', 'Faridah binti Mahmud',
  'Ng Chin Hock',
];

const BUDGETS = [
  'RM 150,000 – 250,000',
  'RM 300,000 – 500,000',
  'RM 500,000 – 1,000,000',
  'RM 1M – 2M (multi-year contract)',
  'USD 80,000 – 150,000',
  'budget TBC, pending board approval',
];

const COMPETITORS = [
  'CyberArk (already demoed)',
  'Palo Alto Cortex XDR shortlisted',
  'Microsoft Sentinel currently in PoC',
  'no incumbent — greenfield deployment',
  'incumbent vendor (IBM QRadar) contract expiring',
  'Broadcom (Symantec) renewal under evaluation',
];

const NEXT_STEPS = [
  'Schedule 2-hour technical deep-dive with security team',
  'Submit formal proposal by end of month',
  'Arrange PoC environment setup — 4-week trial agreed',
  'Pending procurement approval; follow up in 2 weeks',
  'Board presentation scheduled — need executive summary deck',
  'Reference site visit to Maybank deployment requested',
  'RFP response due in 3 weeks; clarification call booked',
];

const QUARTERS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'H1 2026', 'end of FY2025'];

/**
 * Generates a realistic multi-line sales note for the Details field.
 *
 * Output looks like what a sales rep would type after a discovery call:
 *   Source, pain point, champion, budget, competitors, timeline, next step.
 */
export function generateSalesNote(): string {
  const company  = pick(COMPANIES);
  const champion = pick(MY_NAMES);
  const role     = pick(ROLES);
  const [p1, p2] = pickN(PAIN_POINTS, 2);
  const budget   = pick(BUDGETS);
  const comp     = pick(COMPETITORS);
  const next     = pick(NEXT_STEPS);
  const timeline = pick(QUARTERS);
  const channel  = pick(CONTACT_CHANNELS);

  return [
    `Source: ${channel}.`,
    `Sector: ${company.sector}. Prospect has flagged two key pain points: ${p1}; ${p2}.`,
    `Champion: ${champion} (${role}). Responsive and has internal sponsorship from the CISO.`,
    `Indicative budget: ${budget}. Decision timeline: ${timeline}.`,
    `Competitive landscape: ${comp}.`,
    `Next step: ${next}.`,
  ].join('\n');
}

// ─── Malaysian Phone Number ───────────────────────────────────────────────────

export function generateMalaysianPhone(): string {
  // Malaysian mobile numbers start with 010, 011, 012, 013, 014, 015, 016, 017, 018, 019
  const prefixes = ['010', '011', '012', '013', '014', '015', '016', '017', '018', '019'];
  const prefix = pick(prefixes);
  // Remaining 7 digits
  const suffix = digits(7);
  return `${prefix}${suffix}`;
}

// ─── Contact Name (Malaysian style) ──────────────────────────────────────────

const MALAY_MALE_NAMES = [
  'Ahmad', 'Muhammad', 'Ali', 'Ibrahim', 'Hassan', 'Azman', 'Hafiz', 'Izzat', 'Syafiq', 'Amir',
  'Adam', 'Amin', 'Anas', 'Arif', 'Asyraf', 'Danial', 'Faiz', 'Farhan', 'Firdaus', 'Harris',
  'Iqbal', 'Khairul', 'Luqman', 'Malik', 'Marzuki', 'Mhd', 'Nasir', 'Nazmi', 'Nizar', 'Osman',
  'Rizal', 'Saiful', 'Shamsul', 'Syed', 'Taufik', 'Zamri', 'Zulkifli'
];

const MALAY_FEMALE_NAMES = [
  'Siti', 'Nurul', 'Farah', 'Amirah', 'Nadia', 'Nur', 'Aisyah', 'Atikah', 'Fatin', 'Hanim',
  'Intan', 'Lina', 'Marina', 'Nora', 'Norlina', 'Puan', 'Rina', 'Salmah', 'Shima', 'Siti',
  'Wan', 'Yati', 'Zarina', 'Zatul', 'Azizah', 'Binti', 'Che', 'Dayang', 'Datin', 'Hajjah'
];

const CHINESE_NAMES = [
  'Lim', 'Tan', 'Ng', 'Wong', 'Lee', 'Chan', 'Foo', 'Goh', 'Koh', 'Low',
  'Ong', 'Tay', 'Teo', 'Woo', 'Yap', 'Chin', 'Chong', 'Lau', 'Liew', 'Phang'
];

const INDIAN_NAMES = [
  'Raj', 'Kumar', 'Singh', 'Ravi', 'Vijay', 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Khan',
  'Ali', 'Hassan', 'Iqbal', 'Khalid', 'Mustafa', 'Akhtar', 'Rahman', 'Siddiqui', 'Ansari', 'Malik'
];

export function generateMalaysianContactName(): string {
  const rand = Math.random();
  if (rand < 0.4) {
    // Malay name
    const isMale = Math.random() > 0.5;
    const name = isMale ? pick(MALAY_MALE_NAMES) : pick(MALAY_FEMALE_NAMES);
    const fatherName = pick(MALAY_MALE_NAMES);
    return isMale ? `${name} bin ${fatherName}` : `${name} binti ${fatherName}`;
  } else if (rand < 0.8) {
    // Chinese name
    const surname = pick(CHINESE_NAMES);
    const firstNames = ['Wei', 'Cheng', 'Boon', 'Huat', 'Chin', 'Hock', 'Kar', 'Wei', 'Yee', 'Mei'];
    const firstName = pick(firstNames);
    return `${surname} ${firstName}`;
  } else {
    // Indian name
    const name = pick(INDIAN_NAMES);
    const fatherName = pick(INDIAN_NAMES);
    return `${name} a/l ${fatherName}`;
  }
}

// ─── Department (Malaysian corporate style) ──────────────────────────────────

const DEPARTMENTS = [
  'Information Technology',
  'Cybersecurity',
  'Finance',
  'Human Resources',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Service',
  'Research & Development',
  'Legal',
  'Procurement',
  'Administration',
  'Business Development',
  'Project Management',
  'Quality Assurance'
];

export function generateDepartment(): string {
  return pick(DEPARTMENTS);
}

// ─── Job Title (Malaysian corporate style) ───────────────────────────────────

const JOB_TITLES = [
  'Manager',
  'Director',
  'Executive',
  'Specialist',
  'Officer',
  'Coordinator',
  'Analyst',
  'Engineer',
  'Consultant',
  'Supervisor',
  'Assistant',
  'Associate',
  'Senior Manager',
  'Vice President',
  'Chief Executive Officer'
];

export function generateJobTitle(): string {
  const title = pick(JOB_TITLES);
  const dept = pick(DEPARTMENTS);
  return `${title} of ${dept}`;
}

// ─── Gender ──────────────────────────────────────────────────────────────────

export function generateGender(): 'Male' | 'Female' {
  return Math.random() > 0.5 ? 'Male' : 'Female';
}

// ─── Contact Test Data ───────────────────────────────────────────────────────

export interface ContactTestData {
  name:         string;
  mobile:       string;
  email:        string;
  department:   string;
  jobTitle:     string;
  address:      string;
  notes:        string;
  gender:       'Male' | 'Female';
}

export function generateContactTestData(): ContactTestData {
  return {
    name:         generateMalaysianContactName(),
    mobile:       generateMalaysianPhone(),
    email:        generateMalaysianEmail(),
    department:   generateDepartment(),
    jobTitle:     generateJobTitle(),
    address:      generateMalaysianAddress(),
    notes:        generateSalesNote(),
    gender:       generateGender(),
  };
}

// ─── Composite interfaces & factory ───────────────────────────────────────────

export interface LeadTestData {
  leadName:         string;
  customerType:     'New Customer' | 'Existing Customer';
  customerName:     string;
  registrationCode: string;
  email:            string;
  address:          string;
  details:          string;
}

export function generateLeadTestData(): LeadTestData {
  return {
    leadName:         generateLeadName(),
    customerType:     'New Customer',
    customerName:     generateCustomerName(),
    registrationCode: generateRegistrationCode(),
    email:            generateMalaysianEmail(),
    address:          generateMalaysianAddress(),
    details:          generateSalesNote(),
  };
}

export function generateBoundaryLeadData(): Partial<LeadTestData> {
  return {
    leadName:         'A'.repeat(200),
    customerType:     'New Customer',
    customerName:     generateCustomerName(),
    registrationCode: generateRegistrationCode(),
    email:            generateMalaysianEmail(),
    address:          generateMalaysianAddress(),
  };
}

// ─── Customer (新增客户) ────────────────────────────────────────────────────────

/**
 * Unique company name for Customer records.
 * Adds a uniqueSuffix to avoid "already exists" validation errors.
 */
export function generateCustomerCompanyName(): string {
  const suffix = uniqueSuffix().substring(0, 6);
  return `${pick(MY_PREFIXES)} ${pick(MY_CORES)} ${pick(MY_SUFFIXES)} (${suffix})`.slice(0, 100);
}

/**
 * Unique Malaysian mobile number.
 * Embeds a timestamp counter in the last 4 digits to guarantee uniqueness.
 */
export function generateUniquePhone(): string {
  const prefixes = ['010', '011', '012', '013', '014', '016', '017', '018', '019'];
  const prefix = pick(prefixes);
  // First 3 random digits + 4-digit counter-based suffix (mod 10000)
  const rand3 = digits(3);
  const counter = (Date.now() % 10000).toString().padStart(4, '0');
  return `${prefix}${rand3}${counter}`;
}

const SCOPES_OF_BUSINESS = [
  'Cybersecurity products and managed security services',
  'Banking software and financial technology solutions',
  'Telecommunications infrastructure and network services',
  'Government digital transformation and e-services',
  'Healthcare IT systems and electronic medical records',
  'Manufacturing automation and industrial IoT',
  'Education technology platforms and e-learning',
  'Oil and gas operational technology and SCADA systems',
  'Retail and e-commerce platform development',
  'Logistics software and supply chain management',
  'Cloud computing and data centre services',
  'Identity and access management solutions',
];

export function generateScopeOfBusiness(): string {
  return pick(SCOPES_OF_BUSINESS);
}

/**
 * Short Malaysian address suitable for table rows (concise format).
 */
export function generateShortMalaysianAddress(): string {
  const state  = pick(MY_STATES);
  const city   = pick(MY_CITIES);
  const [lo, hi] = POSTCODE_RANGES[state] ?? [40000, 99999];
  return `No.${int(1, 99)}, ${pick(MY_STREETS)}, ${int(lo, hi)} ${city}, ${state}`;
}

export interface CustomerTestData {
  customerName:          string;
  legalRegistrationCode: string;
  customerType:          'End Customer' | 'Partner';
  phone:                 string;
  email:                 string;
  scopeOfBusiness:       string;
  addresses:             [string, string];
}

export function generateCustomerTestData(): CustomerTestData {
  return {
    customerName:          generateCustomerCompanyName(),
    legalRegistrationCode: generateRegistrationCode(),
    customerType:          Math.random() > 0.5 ? 'End Customer' : 'Partner',
    phone:                 generateUniquePhone(),
    email:                 generateMalaysianEmail(),
    scopeOfBusiness:       generateScopeOfBusiness(),
    addresses: [
      generateShortMalaysianAddress(),
      generateShortMalaysianAddress(),
    ],
  };
}

// ─── Product (产品) ───────────────────────────────────────────────────────────

// ─── Product Types (actual options from CRM system) ──────────────────────

const PRODUCT_TYPES = [
  'Software',
  'Maintenance',
  'Service'
];

// Note: Principal in Charge dropdown doesn't show fixed options
// It may require search or关联其他数据
// For now, we'll use empty string and let the test handle it
const PRINCIPAL_NAMES = [
  '', // Empty to skip selection
];

/**
 * Generate product type
 */
export function generateProductType(): string {
  return pick(PRODUCT_TYPES);
}

/**
 * Generate principal in charge
 */
export function generatePrincipalInCharge(): string {
  return pick(PRINCIPAL_NAMES);
}

/**
 * Generate product description based on product type
 */
export function generateProductDescription(productType: string): string {
  const suffix = uniqueSuffix().substring(0, 6);
  const descriptions: Record<string, string[]> = {
    'Software': ['Security Management Suite', 'Data Analytics Platform', 'Network Monitoring Tool', 'Backup Solution'],
    'Maintenance': ['Annual Maintenance Contract', 'Preventive Maintenance Service', 'Technical Support Package', 'On-site Maintenance'],
    'Service': ['Security Assessment', 'Implementation Service', 'Training Program', 'Consulting Service']
  };
  
  const typeDescriptions = descriptions[productType] || ['Generic Product'];
  const baseDescription = pick(typeDescriptions);
  return `${baseDescription} (${suffix})`;
}

/**
 * Generate product code based on product type
 */
export function generateProductCode(productType: string): string {
  const suffix = uniqueSuffix().substring(0, 6);
  const typeCodes: Record<string, string> = {
    'Software': 'SW',
    'Maintenance': 'MT',
    'Service': 'SV'
  };
  const codePrefix = typeCodes[productType] || 'PR';
  const randomNum = int(1000, 9999);
  return `${codePrefix}-${suffix}-${randomNum}`;
}

/**
 * Generate cost value
 */
export function generateCost(): number {
  return int(1000, 10000);
}

/**
 * Generate list price value (higher than cost)
 */
export function generateListPrice(cost: number): number {
  // List price should be 30-60% higher than cost
  const markup = 1 + (int(30, 60) / 100);
  return Math.round(cost * markup);
}

/**
 * Generate target margin
 */
export function generateTargetMargin(): number {
  return int(20, 50);
}

/**
 * Generate product remark
 */
export function generateProductRemark(productType: string): string {
  const remarks: Record<string, string[]> = {
    'Software': ['Software test item for automation testing', 'Test software product for CRM system'],
    'Maintenance': ['Maintenance service for automation testing', 'Test maintenance package for CRM system'],
    'Service': ['Service test item for automation testing', 'Test service for CRM system']
  };
  
  const typeRemarks = remarks[productType] || ['Test product'];
  return pick(typeRemarks);
}

export interface ProductTestData {
  productDescription: string;
  productCode: string;
  productType: string;
  principalInCharge: string;
  cost: number;
  listPrice: number;
  targetMargin: number;
  remark: string;
}

export function generateProductTestData(): ProductTestData {
  const productType = generateProductType();
  const cost = generateCost();
  
  return {
    productDescription: generateProductDescription(productType),
    productCode: generateProductCode(productType),
    productType,
    principalInCharge: generatePrincipalInCharge(),
    cost,
    listPrice: generateListPrice(cost),
    targetMargin: generateTargetMargin(),
    remark: generateProductRemark(productType)
  };
}
