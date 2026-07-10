/**
 * Faker-based Test Data Generator — Malaysia Style
 *
 * Uses @faker-js/faker to generate realistic Malaysian/Asian test data
 * for the CRM Securemetric test suite.
 */

import { faker } from '@faker-js/faker';

// ─── Configuration ───────────────────────────────────────────────────────────

// Malaysian phone number formats
const MALAYSIAN_MOBILE_PREFIXES = ['010', '011', '012', '013', '014', '016', '017', '018', '019'];

// Malaysian company suffixes
const COMPANY_SUFFIXES = ['Sdn Bhd', 'Berhad', 'Enterprise', 'Solutions', 'Technologies', 'Services'];

// Malaysian cities and states
const MALAYSIAN_CITIES = [
  'Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Cyberjaya',
  'Putrajaya', 'George Town', 'Ipoh', 'Johor Bahru', 'Kota Kinabalu',
  'Kuching', 'Malacca City', 'Seremban', 'Kuantan', 'Kuala Terengganu',
  'Alor Setar', 'Kangar', 'Kota Bharu'
];

const MALAYSIAN_STATES = [
  'Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak', 'Sabah', 'Sarawak',
  'Negeri Sembilan', 'Malacca', 'Pahang', 'Terengganu', 'Kelantan', 'Kedah',
  'Perlis', 'Putrajaya', 'Labuan'
];

// Street name prefixes common in Malaysia
const STREET_PREFIXES = ['Jalan', 'Lorong', 'Persiaran', 'Lebuh', 'Jalan Bukit', 'Jalan Tun'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate a unique suffix to ensure data uniqueness
 */
function uniqueSuffix(): string {
  return faker.string.alphanumeric(6).toUpperCase();
}

/**
 * Generate Malaysian mobile number
 */
export function generateMalaysianMobile(): string {
  const prefix = faker.helpers.arrayElement(MALAYSIAN_MOBILE_PREFIXES);
  const number = faker.string.numeric(7);
  return `${prefix}-${number}`;
}

/**
 * Generate Malaysian landline number
 */
export function generateMalaysianLandline(): string {
  const areaCode = faker.helpers.arrayElement(['03', '04', '05', '06', '07', '08', '09']);
  const number = faker.string.numeric(7);
  return `${areaCode}-${number}`;
}

/**
 * Generate Malaysian-style address
 */
export function generateMalaysianAddress(): string {
  const streetPrefix = faker.helpers.arrayElement(STREET_PREFIXES);
  const streetName = faker.location.street();
  const buildingNumber = faker.number.int({ min: 1, max: 999 });
  const city = faker.helpers.arrayElement(MALAYSIAN_CITIES);
  const state = faker.helpers.arrayElement(MALAYSIAN_STATES);
  const postcode = faker.string.numeric(5);

  return `No. ${buildingNumber}, ${streetPrefix} ${streetName}, ${postcode} ${city}, ${state}`;
}

/**
 * Generate Malaysian company name
 */
export function generateMalaysianCompanyName(): string {
  const companyName = faker.company.name();
  const suffix = faker.helpers.arrayElement(COMPANY_SUFFIXES);
  return `${companyName} ${suffix}`;
}

/**
 * Generate Malaysian email (company style)
 */
export function generateMalaysianEmail(companyName?: string): string {
  const firstName = faker.person.firstName().toLowerCase();
  const lastName = faker.person.lastName().toLowerCase();
  const domain = companyName
    ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '')
    : faker.internet.domainWord();

  const patterns = [
    `${firstName}.${lastName}@${domain}.com`,
    `${firstName}@${domain}.com.my`,
    `${firstName}${lastName}@${domain}.com`,
    `${firstName}_${lastName}@${domain}.net.my`
  ];

  return faker.helpers.arrayElement(patterns);
}

/**
 * Generate Malaysia SSM registration code
 */
export function generateMalaysianRegistrationCode(): string {
  const year = faker.number.int({ min: 2010, max: 2024 });
  const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
  const day = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
  const random = faker.string.numeric(6);
  const suffix = uniqueSuffix().substring(0, 4);

  return `${year}${month}${day}${random}-${suffix}`;
}

// ─── Product Data Generator ──────────────────────────────────────────────────

// Currency configuration with realistic amount ranges
export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  minCost: number;
  maxCost: number;
  exchangeRateToUSD: number; // Approximate rate for reference
}

// Southeast Asian currencies with realistic business amount ranges
export const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  'MYR': {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    minCost: 2000,
    maxCost: 15000,
    exchangeRateToUSD: 0.22
  },
  'SGD': {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    minCost: 1000,
    maxCost: 10000,
    exchangeRateToUSD: 0.74
  },
  'THB': {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    minCost: 15000,
    maxCost: 150000,
    exchangeRateToUSD: 0.029
  },
  'IDR': {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    minCost: 5000000,
    maxCost: 50000000,
    exchangeRateToUSD: 0.000064
  },
  'PHP': {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    minCost: 25000,
    maxCost: 250000,
    exchangeRateToUSD: 0.018
  },
  'VND': {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    minCost: 10000000,
    maxCost: 100000000,
    exchangeRateToUSD: 0.000042
  },
  'USD': {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    minCost: 1000,
    maxCost: 10000,
    exchangeRateToUSD: 1.0
  },
  'EUR': {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    minCost: 900,
    maxCost: 9000,
    exchangeRateToUSD: 1.08
  }
};

export interface FakerProductData {
  productDescription: string;
  productCode: string;
  productType: 'Software' | 'Maintenance' | 'Service';
  principalInCharge: string;
  currency: string;
  cost: number;
  listPrice: number;
  targetMargin: number;
  remark: string;
}

const PRODUCT_ADJECTIVES = [
  'Enterprise', 'Advanced', 'Professional', 'Ultimate', 'Premium',
  'Standard', 'Basic', 'Cloud', 'Secure', 'Managed'
];

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  'Software': [
    'Security Management Suite', 'Network Monitor', 'Data Analytics Platform',
    'Endpoint Protection', 'Identity Manager', 'Access Control System',
    'Vulnerability Scanner', 'Compliance Manager', 'Threat Intelligence Platform'
  ],
  'Maintenance': [
    'Annual Support Contract', 'Preventive Maintenance', 'Technical Support Package',
    'System Upgrade Service', 'Patch Management', 'Health Check Service'
  ],
  'Service': [
    'Security Assessment', 'Implementation Service', 'Training Program',
    'Consulting Service', 'Penetration Testing', 'Audit Service',
    'Migration Service', 'Integration Service'
  ]
};

/**
 * Generate realistic product data using Faker
 * Amounts are dynamically generated based on selected currency
 */
export function generateFakerProductData(): FakerProductData {
  const productType = faker.helpers.arrayElement(['Software', 'Maintenance', 'Service'] as const);
  const category = faker.helpers.arrayElement(PRODUCT_CATEGORIES[productType]);
  const adjective = faker.helpers.arrayElement(PRODUCT_ADJECTIVES);

  // Generate product description
  const productDescription = `${adjective} ${category}`;

  // Generate product code with meaningful format
  const prefix = { 'Software': 'SW', 'Maintenance': 'MT', 'Service': 'SV' }[productType];
  const codeSuffix = uniqueSuffix();
  const productCode = `${prefix}-${codeSuffix}`;

  // Select a random currency
  const currencyCodes = Object.keys(CURRENCY_CONFIG);
  const currency = faker.helpers.arrayElement(currencyCodes);
  const currencyConfig = CURRENCY_CONFIG[currency];

  // Generate cost based on currency's realistic business range
  const cost = faker.number.int({
    min: currencyConfig.minCost,
    max: currencyConfig.maxCost
  });

  // Generate target margin (25-60%)
  const targetMargin = faker.number.int({ min: 25, max: 60 });

  // Calculate list price to ensure margin constraint is met
  // Formula: listPrice - cost >= targetMargin
  // So: listPrice >= cost + targetMargin
  const minListPrice = cost + targetMargin;
  const maxListPrice = Math.round(cost * 1.8); // Up to 80% markup
  const listPrice = faker.number.int({ min: minListPrice, max: maxListPrice });

  // Generate remark with currency context
  const remark = faker.helpers.arrayElement([
    `Comprehensive ${productType.toLowerCase()} solution for enterprise security needs. ` +
    `Priced in ${currencyConfig.name} (${currencyConfig.symbol}) for local market.`,
    `Professional ${category.toLowerCase()} with 24/7 support included. ` +
    `Cost: ${currencyConfig.symbol}${cost.toLocaleString()}`,
    `Industry-leading ${adjective.toLowerCase()} solution for Southeast Asian market. ` +
    `Currency: ${currency}`,
    `Trusted by major financial institutions across ${currency === 'MYR' ? 'Malaysia' : 'Southeast Asia'}. ` +
    `Competitive pricing in ${currencyConfig.name}.`,
    `Fully compliant with local regulations and international standards. ` +
    `Target margin: ${targetMargin}% in ${currency}.`
  ]);

  return {
    productDescription,
    productCode,
    productType,
    principalInCharge: '', // Will be selected from modal
    currency,
    cost,
    listPrice,
    targetMargin,
    remark
  };
}

// ─── Lead Data Generator ─────────────────────────────────────────────────────

export interface FakerLeadData {
  leadName: string;
  customerName: string;
  registrationCode: string;
  email: string;
  address: string;
  details: string;
}

const DEAL_TYPES = [
  'PAM Implementation', 'SOC-as-a-Service', 'MDR Solution',
  'Zero-Trust Deployment', 'EDR Rollout', 'IAM Platform',
  'OT Security Assessment', 'CSPM Solution', 'Penetration Testing',
  'Security Training', 'SIEM Migration', 'DLP Implementation',
  'MFA Expansion', 'Vulnerability Management', 'Red Team Exercise'
];

const SALES_SOURCES = [
  'Search Engine', 'LinkedIn', 'Industry Event', 'Partner Referral',
  'Cold Call', 'Website Inquiry', 'Email Campaign', 'Trade Show'
];

const PAIN_POINTS = [
  'Compliance audit preparation', 'Recent security incident', 'Digital transformation initiative',
  'Regulatory requirement', 'Board mandate', 'Insurance requirement',
  'Customer security questionnaire', 'Vendor security assessment'
];

const CHAMPION_ROLES = [
  'CISO', 'IT Director', 'Security Manager', 'Compliance Officer',
  'Infrastructure Manager', 'Risk Manager', 'CTO', 'COO'
];

/**
 * Generate realistic lead data using Faker
 */
export function generateFakerLeadData(): FakerLeadData {
  const company = generateMalaysianCompanyName();
  const dealType = faker.helpers.arrayElement(DEAL_TYPES);
  const suffix = uniqueSuffix();

  const leadName = `${company.split(' ')[0]} ${dealType} (${suffix})`;
  const customerName = company;
  const registrationCode = generateMalaysianRegistrationCode();
  const email = generateMalaysianEmail(company);
  const address = generateMalaysianAddress();

  // Generate realistic sales note
  const source = faker.helpers.arrayElement(SALES_SOURCES);
  const painPoint = faker.helpers.arrayElement(PAIN_POINTS);
  const champion = faker.helpers.arrayElement(CHAMPION_ROLES);
  const budget = faker.helpers.arrayElement(['RM 100K-500K', 'RM 500K-1M', 'RM 1M-3M', 'Above RM 3M']);
  const timeline = faker.helpers.arrayElement(['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025']);

  const details = `Source: ${source}. Pain Point: ${painPoint}. Champion: ${champion}. Budget: ${budget}. Timeline: ${timeline}. Next Steps: Schedule technical demo and POC discussion.`;

  return {
    leadName,
    customerName,
    registrationCode,
    email,
    address,
    details
  };
}

// ─── Contact Data Generator ──────────────────────────────────────────────────

export interface FakerContactData {
  name: string;
  mobile: string;
  email: string;
  department: string;
  jobTitle: string;
  address: string;
  notes: string;
  gender: 'Male' | 'Female';
}

const DEPARTMENTS = [
  'IT Security', 'Information Technology', 'Cybersecurity', 'Risk Management',
  'Compliance', 'Infrastructure', 'Network Operations', 'Digital Transformation'
];

const JOB_TITLES = [
  'Manager', 'Director', 'Head', 'Senior Manager', 'Specialist',
  'Analyst', 'Engineer', 'Consultant', 'Officer', 'Lead'
];

/**
 * Generate realistic contact data using Faker
 */
export function generateFakerContactData(): FakerContactData {
  const gender = faker.helpers.arrayElement(['Male', 'Female'] as const);
  const firstName = faker.person.firstName(gender.toLowerCase() as 'male' | 'female');
  const lastName = faker.person.lastName();

  // Malaysian name format (can include bin/binti for Malay names)
  const nameFormat = faker.helpers.arrayElement([
    `${firstName} ${lastName}`,
    `${firstName} bin ${lastName}`,
    `${firstName} binti ${lastName}`,
    `${firstName} a/l ${lastName}`,
    `${firstName} a/p ${lastName}`
  ]);

  const department = faker.helpers.arrayElement(DEPARTMENTS);
  const jobTitle = `${faker.helpers.arrayElement(JOB_TITLES)} ${department}`;
  const company = generateMalaysianCompanyName();

  const notes = faker.helpers.arrayElement([
    `Key decision maker for ${department.toLowerCase()} initiatives. Previously worked at ${generateMalaysianCompanyName()}.`,
    `Technical evaluator with strong background in cybersecurity. Looking for enterprise-grade solutions.`,
    `Budget holder for Q${faker.number.int({ min: 1, max: 4 })} 2025. Interested in comprehensive security platform.`,
    `Champion for digital transformation project. Needs solution with local support presence.`
  ]);

  return {
    name: nameFormat,
    mobile: generateMalaysianMobile(),
    email: generateMalaysianEmail(company),
    department,
    jobTitle,
    address: generateMalaysianAddress(),
    notes,
    gender
  };
}

// ─── Customer Data Generator ─────────────────────────────────────────────────

export interface FakerCustomerData {
  customerName: string;
  legalRegistrationCode: string;
  customerType: 'End Customer' | 'Partner';
  phone: string;
  email: string;
  scopeOfBusiness: string;
  addresses: [string, string];
}

const INDUSTRIES = [
  'Banking & Finance', 'Telecommunications', 'Oil & Gas', 'Government',
  'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Technology',
  'Logistics', 'Property & Construction', 'Media & Entertainment'
];

const SCOPE_OF_BUSINESS = [
  'Cybersecurity products and managed security services',
  'IT infrastructure and network security solutions',
  'Digital transformation and cloud security services',
  'Enterprise security consulting and implementation',
  'Identity and access management solutions',
  'Data protection and privacy compliance services',
  'Security operations center (SOC) services',
  'Threat intelligence and vulnerability management'
];

/**
 * Generate realistic customer data using Faker
 */
export function generateFakerCustomerData(): FakerCustomerData {
  const customerName = generateMalaysianCompanyName();

  return {
    customerName,
    legalRegistrationCode: generateMalaysianRegistrationCode(),
    customerType: faker.helpers.arrayElement(['End Customer', 'Partner'] as const),
    phone: generateMalaysianLandline(),
    email: generateMalaysianEmail(customerName),
    scopeOfBusiness: faker.helpers.arrayElement(SCOPE_OF_BUSINESS),
    addresses: [
      generateMalaysianAddress(),
      generateMalaysianAddress()
    ]
  };
}

// ─── Opportunity Data Generator ──────────────────────────────────────────────

export interface FakerOpportunityProductDetail {
  productDescription: string;
  estimatedAmount: number;
}

export interface FakerOpportunityData {
  opportunityName: string;
  customer: string;
  estimatedCloseDate: string;
  dealCategory: string;
  products: FakerOpportunityProductDetail[];
}

const OPPORTUNITY_NAMES = [
  'Enterprise Security Platform', 'SOC Modernization', 'Zero Trust Implementation',
  'Identity Management Upgrade', 'Endpoint Security Refresh', 'Cloud Security Migration',
  'Threat Intelligence Platform', 'Compliance Automation', 'Security Training Program',
  'Penetration Testing Engagement', 'Vulnerability Management', 'MDR Service Deployment'
];

const DEAL_CATEGORIES = [
  'New Business', 'Expansion', 'Renewal', 'Upsell', 'Cross-sell'
];

const PRODUCT_DESCRIPTIONS = [
  'Enterprise Security Suite', 'Network Monitoring Solution', 'Endpoint Protection',
  'Identity Management Platform', 'Cloud Security Gateway', 'SIEM Solution',
  'Vulnerability Scanner', 'Threat Intelligence Feed', 'Security Training Package',
  'Compliance Management Tool', 'Data Loss Prevention', 'Email Security Gateway'
];

/**
 * Generate realistic opportunity data using Faker
 */
export function generateFakerOpportunityData(): FakerOpportunityData {
  const companyName = faker.helpers.arrayElement([
    'TechCorp', 'SecureBank', 'HealthPlus', 'GovAgency', 'RetailMax',
    'LogiTrans', 'MediaGroup', 'EnergyCore', 'FinServe', 'InsureTech'
  ]);

  const opportunityType = faker.helpers.arrayElement(OPPORTUNITY_NAMES);
  const suffix = uniqueSuffix();

  const opportunityName = `${companyName} ${opportunityType} (${suffix})`;

  const today = new Date();
  const closeDate = new Date(today.getTime() + faker.number.int({ min: 30, max: 180 }) * 24 * 60 * 60 * 1000);
  const estimatedCloseDate = closeDate.toISOString().split('T')[0];

  const dealCategory = faker.helpers.arrayElement(DEAL_CATEGORIES);

  const numProducts = faker.number.int({ min: 2, max: 4 });
  const products: FakerOpportunityProductDetail[] = [];

  for (let i = 0; i < numProducts; i++) {
    const currency = faker.helpers.arrayElement(Object.keys(CURRENCY_CONFIG));
    const currencyConfig = CURRENCY_CONFIG[currency];

    products.push({
      productDescription: faker.helpers.arrayElement(PRODUCT_DESCRIPTIONS),
      estimatedAmount: faker.number.int({
        min: currencyConfig.minCost,
        max: currencyConfig.maxCost
      })
    });
  }

  return {
    opportunityName,
    customer: '',
    estimatedCloseDate,
    dealCategory,
    products
  };
}

// ─── Export All ──────────────────────────────────────────────────────────────

export default {
  generateFakerProductData,
  generateFakerLeadData,
  generateFakerContactData,
  generateFakerCustomerData,
  generateFakerOpportunityData,
  generateMalaysianMobile,
  generateMalaysianLandline,
  generateMalaysianAddress,
  generateMalaysianCompanyName,
  generateMalaysianEmail,
  generateMalaysianRegistrationCode
};
