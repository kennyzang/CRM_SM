/**
 * Mock 数据 - 马来西亚相关英文数据
 *
 * 用于 Securemetric CRM 测试数据生成
 */

export interface MalaysiaCompany {
  name: string;
  industry: string;
  city: string;
}

export interface HardwareProduct {
  name: string;
  category: string;
  brand: string;
  model: string;
  priceRange: string;
}

import type { RowData } from '../core/DetailTableBuilder';

export interface PrincipalAllocation extends RowData {
  fd_Principal_name: string;
  fd_product_type: string;
  fd_product_list: string;
  fd_prodcut_amt: number;
  fd_sm_s_price: number;
  fd_product_quantity: number;
  fd_service_period: string;
}

export interface MalaysiaLeadData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  remark: string;
  products: HardwareProduct[];
}

// 马来西亚公司名称
const malaysiaCompanies = [
  'Tech Solutions Malaysia Sdn Bhd',
  'Kuala Lumpur Hardware Supplies',
  'Penang Electronics Components',
  'Selangor IT Equipment Co.',
  'Johor Bahru Systems Integration',
  'Cyberjaya Technology Park Corp',
  'Malacca Digital Solutions',
  'Sabah Network Solutions',
  'Sarawak Tech Industries',
  'Petaling Jaya Computer Systems',
  'Shah Alam Electronics',
  'Putrajaya Smart Systems',
  'Ipoh Hardware Distributors',
  'Kota Kinabalu IT Services',
  'Kuching Tech Supplies'
];

// 马来西亚城市
const malaysiaCities = [
  'Kuala Lumpur',
  'Petaling Jaya',
  'Shah Alam',
  'Johor Bahru',
  'Penang',
  'Cyberjaya',
  'Malacca',
  'Ipoh',
  'Kota Kinabalu',
  'Kuching'
];

// 马来西亚州
const malaysiaStates = [
  'Selangor',
  'Kuala Lumpur',
  'Johor',
  'Penang',
  'Sabah',
  'Sarawak',
  'Melaka',
  'Perak',
  'Putrajaya'
];

// 马来西亚常见联系人姓名
const firstNames = [
  'Ahmad', 'Mohd', 'Fatimah', 'Aisyah', 'Lim', 'Tan', 'Lee', 'Ng', 'Chong',
  'Wei', 'Chen', 'Wang', 'Kumar', 'Singh', 'Ali', 'Abu', 'Siti', 'Nur', 'Yusof'
];

const lastNames = [
  'Bin Ahmad', 'Bin Osman', 'Binti Hassan', 'Binti Rahman',
  'Lim', 'Tan', 'Lee', 'Chew', 'Ng', 'Ong', 'Chan', 'Wong',
  'Singh', 'Kaur', 'Sharma', 'Patel'
];

// 硬件产品类别
const hardwareCategories = [
  'Laptops', 'Desktops', 'Servers', 'Networking Equipment', 'Storage Devices',
  'Printers', 'Monitors', 'Peripherals', 'Components', 'Accessories',
  'Tablets', 'Workstations', 'POS Systems', 'Barcode Scanners', 'KVM Switches'
];

// 硬件品牌
const hardwareBrands = [
  'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'Microsoft',
  'Cisco', 'TP-Link', 'D-Link', 'Netgear', 'Synology', 'QNAP',
  'Epson', 'Canon', 'Brother', 'Samsung', 'LG', 'ViewSonic', 'Logitech'
];

// 硬件型号前缀
const modelPrefixes = [
  'Pro', 'Elite', 'Think', 'Opti', 'Precision', 'Inspiron', 'Vostro',
  'Pavilion', 'Envy', 'Surface', 'iMac', 'MacBook', 'ROG', 'ZenBook'
];

// 硬件产品
const hardwareProducts: HardwareProduct[] = [
  { name: 'Dell Latitude 5540 Laptop', category: 'Laptops', brand: 'Dell', model: 'Latitude 5540', priceRange: '5000-8000' },
  { name: 'HP ProBook 450 G10', category: 'Laptops', brand: 'HP', model: 'ProBook 450 G10', priceRange: '4500-7000' },
  { name: 'Lenovo ThinkPad T14s', category: 'Laptops', brand: 'Lenovo', model: 'ThinkPad T14s', priceRange: '6000-9000' },
  { name: 'Dell OptiPlex 7010 Tower', category: 'Desktops', brand: 'Dell', model: 'OptiPlex 7010', priceRange: '4000-7000' },
  { name: 'HP EliteDesk 800 G9', category: 'Desktops', brand: 'HP', model: 'EliteDesk 800 G9', priceRange: '5000-8000' },
  { name: 'Cisco Catalyst 9200 Switch', category: 'Networking Equipment', brand: 'Cisco', model: 'Catalyst 9200', priceRange: '15000-30000' },
  { name: 'Synology DS923+ NAS', category: 'Storage Devices', brand: 'Synology', model: 'DS923+', priceRange: '4000-6000' },
  { name: 'HP LaserJet Pro MFP', category: 'Printers', brand: 'HP', model: 'LaserJet Pro MFP', priceRange: '2000-4000' },
  { name: 'Dell UltraSharp U2723QE', category: 'Monitors', brand: 'Dell', model: 'U2723QE', priceRange: '3000-5000' },
  { name: 'Logitech MX Keys Keyboard', category: 'Peripherals', brand: 'Logitech', model: 'MX Keys', priceRange: '500-1000' },
  { name: 'Intel Core i9-13900K', category: 'Components', brand: 'Intel', model: 'Core i9-13900K', priceRange: '3000-4000' },
  { name: 'Samsung 970 EVO Plus SSD', category: 'Storage Devices', brand: 'Samsung', model: '970 EVO Plus', priceRange: '500-1500' },
  { name: 'Apple iPad Pro 12.9', category: 'Tablets', brand: 'Apple', model: 'iPad Pro 12.9', priceRange: '6000-10000' },
  { name: 'Dell Precision 7680 Workstation', category: 'Workstations', brand: 'Dell', model: 'Precision 7680', priceRange: '15000-25000' },
  { name: 'Zebra DS4608 Barcode Scanner', category: 'Barcode Scanners', brand: 'Zebra', model: 'DS4608', priceRange: '800-1500' }
];

/**
 * 生成随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择一个元素
 */
function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * 从数组中随机选择多个元素
 */
function randomPicks<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 生成马来西亚公司名称
 */
export function generateMalaysiaCompanyName(): string {
  return randomPick(malaysiaCompanies);
}

// ════════════════════════════════════
// 🆕 组合式公司名生成（高唯一性 + 自愈能力）
// ════════════════════════════════════

const companyPrefixes = [
  'Advanced', 'Global', 'Prime', 'Elite', 'Apex',
  'Dynamic', 'Innovative', 'Strategic', 'Premier', 'Unified'
];

const industryKeywords = [
  'Technology', 'Digital', 'Cyber', 'Smart', 'Enterprise',
  'Network', 'Security', 'Cloud', 'Data', 'Systems'
];

const businessTypes = [
  'Solutions', 'Consulting', 'Services', 'Industries', 'Holdings',
  'Ventures', 'Group', 'Enterprises', 'Corporation', 'International'
];

const companySuffixes = [
  'Sdn Bhd', 'Bhd', 'Sendirian Berhad', '(M) Sdn Bhd'
];

let generatedNames = new Set<string>();
let generatedRegCodes = new Set<string>();

export function generateUniqueCompanyName(attempt: number = 0): string {
  const prefix = randomPick(companyPrefixes);
  const industry = randomPick(industryKeywords);
  const business = randomPick(businessTypes);
  const city = randomPick(malaysiaCities);
  const suffix = randomPick(companySuffixes);

  let name: string;

  if (attempt === 0) {
    name = `${prefix} ${industry} ${business} ${suffix}`;
  } else if (attempt <= 3) {
    name = `${prefix} ${industry} ${business} (${city}) ${suffix}`;
  } else {
    // 多次碰撞：换一个城市限定词再试，仍不加时间戳
    const city2 = randomPick(malaysiaCities);
    const serial = randomInt(10, 99);
    name = `${prefix} ${industry} ${business} ${city2} ${serial} ${suffix}`;
  }

  if (generatedNames.has(name)) {
    console.warn(`[MalaysiaMockData] ⚠️ Company name conflict (in-run): "${name}", retrying (attempt ${attempt + 1})...`);
    if (attempt < 8) {
      return generateUniqueCompanyName(attempt + 1);
    }
    // 超过8次仍碰撞：说明跨运行与CRM数据库冲突，由上层spec捕获重复错误并本地重试
    console.warn(`[MalaysiaMockData] ⚠️ Max in-run retries reached for "${name}", returning as-is (let spec retry handle CRM duplicate)`);
  }

  generatedNames.add(name);
  return name;
}

export function generateUniqueRegistrationCode(attempt: number = 0): string {
  // 马来西亚 SSM 格式：纯随机数字，不含时间戳
  const yearPrefixes = ['202001', '202101', '202201', '202301', '202401', '199901', '200001'];
  const letters = ['A', 'D', 'H', 'K', 'M', 'T', 'V', 'W', 'X'];

  let code: string;

  if (Math.random() > 0.5) {
    // 新格式：12 位数字，年份前缀 + 随机6位序列
    const prefix = randomPick(yearPrefixes);
    const serial = String(randomInt(100000, 999999));
    code = `${prefix}${serial}`;
  } else {
    // 旧格式：7位数字 + 字母后缀
    const serial = String(randomInt(1000000, 9999999));
    code = `${serial}-${randomPick(letters)}`;
  }

  if (generatedRegCodes.has(code)) {
    console.warn(`[MalaysiaMockData] ⚠️ Registration code conflict (in-run): "${code}", retrying (attempt ${attempt + 1})...`);
    if (attempt < 5) {
      return generateUniqueRegistrationCode(attempt + 1);
    }
    console.warn(`[MalaysiaMockData] ⚠️ Max in-run retries reached, returning as-is (let spec retry handle CRM duplicate)`);
  }

  generatedRegCodes.add(code);
  return code;
}

export function clearGeneratedCache(): void {
  generatedNames.clear();
  generatedRegCodes.clear();
  console.log('[MalaysiaMockData] ✅ Generated data cache cleared');
}

// ════════════════════════════════════
// 🆕 业务化线索/商机名称生成
// ════════════════════════════════════

const leadScenarios = [
  { prefix: 'PKI Hardware', suffixes: ['Procurement Project', 'Upgrade Initiative', 'Renewal Opportunity'] },
  { prefix: 'Smart Card Solution', suffixes: ['Implementation', 'Pilot Program', 'Expansion Plan'] },
  { prefix: 'HSM Security', suffixes: ['Deployment', 'Assessment Request', 'Compliance Project'] },
  { prefix: 'Digital Identity Platform', suffixes: ['Integration Project', 'Migration Planning'] },
  { prefix: 'Authentication System', suffixes: ['Modernization', 'Replacement Need'] },
  { prefix: 'Security Assessment', suffixes: ['Engagement', 'Audit Request', 'Gap Analysis'] },
  { prefix: 'Compliance Advisory', suffixes: ['PDPA Implementation', 'ISO Certification Support'] }
];

const targetIndustries = [
  'Banking & Finance', 'Government Sector', 'Healthcare',
  'Telecommunications', 'Manufacturing', 'Education'
];

/**
 * 生成有意义的线索名称（英文业务描述，无时间戳）
 * 格式: PKI Hardware Procurement Project - Banking & Finance (Selangor)
 * 重复时由上层 spec 捕获 CRM 错误并本地重试，不在此处处理
 */
export function generateBusinessLeadName(): string {
  const scenario = randomPick(leadScenarios);
  const suffix = randomPick(scenario.suffixes);
  const industry = randomPick(targetIndustries);
  const region = randomPick(malaysiaStates);

  return `${scenario.prefix} ${suffix} - ${industry} (${region})`;
}

/**
 * 生成马来西亚城市
 */
export function generateMalaysiaCity(): string {
  return randomPick(malaysiaCities);
}

/**
 * 生成马来西亚州
 */
export function generateMalaysiaState(): string {
  return randomPick(malaysiaStates);
}

/**
 * 生成马来西亚联系人姓名（英文）
 */
export function generateMalaysiaContactName(): string {
  const firstName = randomPick(firstNames);
  const lastName = randomPick(lastNames);
  return `${firstName} ${lastName}`;
}

/**
 * 生成马来西亚电话号码
 */
export function generateMalaysiaPhone(): string {
  const prefixes = ['010', '011', '012', '013', '014', '016', '017', '018', '019'];
  const prefix = randomPick(prefixes);
  const number = randomInt(1000000, 9999999);
  return `${prefix}-${number}`;
}

/**
 * 生成马来西亚邮箱
 * 用随机2位数字后缀扩大唯一空间（e.g. ahmad.lim42@gmail.com），看起来自然
 */
export function generateMalaysiaEmail(companyName?: string): string {
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'company.com.my'];
  const name = generateMalaysiaContactName().toLowerCase().replace(/ /g, '.');
  const domain = randomPick(domains);
  // 50% 概率加2位数字后缀，让邮箱更唯一但不奇怪
  const suffix = Math.random() > 0.5 ? String(randomInt(10, 99)) : '';
  return `${name}${suffix}@${domain}`;
}

/**
 * 生成马来西亚地址
 */
export function generateMalaysiaAddress(): string {
  const streetNumber = randomInt(1, 999);
  const streetTypes = ['Jalan', 'Lorong', 'Persiaran', 'Lebuhraya'];
  const streetNames = [
    'Tun Razak', 'Bukit Bintang', 'Ampang', 'Cheras', 'Puchong',
    'Damansara', 'Sri Petaling', 'Old Klang Road', 'Klang', 'Port Klang'
  ];
  const streetType = randomPick(streetTypes);
  const streetName = randomPick(streetNames);
  const city = generateMalaysiaCity();
  const postcode = randomInt(40000, 80000);
  return `${streetNumber}, ${streetType} ${streetName}, ${postcode} ${city}, Malaysia`;
}

/**
 * 生成硬件产品名称
 */
export function generateHardwareProductName(): string {
  return randomPick(hardwareProducts).name;
}

/**
 * 生成硬件产品类别
 */
export function generateHardwareCategory(): string {
  return randomPick(hardwareCategories);
}

/**
 * 生成硬件品牌
 */
export function generateHardwareBrand(): string {
  return randomPick(hardwareBrands);
}

/**
 * 生成硬件型号
 */
export function generateHardwareModel(): string {
  const prefix = randomPick(modelPrefixes);
  const number = randomInt(100, 9999);
  return `${prefix} ${number}`;
}

/**
 * 生成价格范围
 */
export function generatePriceRange(): string {
  const min = randomInt(100, 5000);
  const max = min + randomInt(500, 5000);
  return `MYR ${min.toLocaleString()}-${max.toLocaleString()}`;
}

/**
 * 生成单个硬件产品
 */
export function generateHardwareProduct(): HardwareProduct {
  return randomPick(hardwareProducts);
}

/**
 * 生成多个硬件产品
 */
export function generateHardwareProducts(count: number = 3): HardwareProduct[] {
  return randomPicks(hardwareProducts, count);
}

/**
 * 生成完整的马来西亚 CRM 线索数据
 */
export function generateMalaysiaLeadData(): MalaysiaLeadData {
  const companyName = generateMalaysiaCompanyName();
  const contactPerson = generateMalaysiaContactName();

  const remarks = [
    'Initial contact made via website inquiry',
    'Interested in hardware upgrade project',
    'Referred by existing customer',
    'Attended trade show, expressed interest',
    'Cold call - potential lead',
    'Marketing campaign response',
    'Request for product demonstration',
    'Looking for enterprise solutions'
  ];

  return {
    companyName,
    contactPerson,
    email: generateMalaysiaEmail(companyName),
    phone: generateMalaysiaPhone(),
    address: generateMalaysiaAddress(),
    city: generateMalaysiaCity(),
    state: generateMalaysiaState(),
    remark: randomPick(remarks),
    products: generateHardwareProducts(3)
  };
}

/**
 * 生成商机名称（硬件类）
 */
export function generateHardwareBusinessOpportunity(): string {
  const prefixes = [
    'IT Infrastructure Upgrade',
    'Network Equipment Procurement',
    'Computer Systems Purchase',
    'Hardware Supply Contract',
    'Technology Equipment Project',
    'Digital Transformation Initiative',
    'Server & Storage Solution',
    'End-User Computing Devices',
    'Print & Scan Solutions',
    'Data Center Equipment'
  ];

  const suffix = [
    'for ' + generateMalaysiaCity() + ' Branch',
    'Project - ' + generateMalaysiaState() + ' Region',
    'Annual Supply Agreement',
    'Phase ' + randomInt(1, 5) + ' Implementation',
    'Corporate Office Setup',
    'Regional Office Deployment',
    'Multi-Location Rollout',
    'Enterprise License & Hardware'
  ];

  return `${randomPick(prefixes)} - ${randomPick(suffix)}`;
}

// Principal 名称
const principalNames = [
  'Microsoft Malaysia',
  'Dell Technologies Malaysia',
  'Hewlett-Packard Malaysia',
  'Lenovo Malaysia',
  'Cisco Systems Malaysia',
  'Oracle Malaysia',
  'SAP Malaysia',
  'IBM Malaysia',
  'Adobe Malaysia',
  'Autodesk Malaysia',
  'VMWARE Malaysia',
  'Symantec Malaysia',
  'Fortinet Malaysia',
  'Palo Alto Networks Malaysia'
];

// Malaysia SSM registration code formats
const ssmPrefixes = ['202001', '202101', '202201', '202301', '202401', '199901', '200001'];
const businessSuffixes = ['1234', '5678', '9012', '3456', '7890', '2345', '6789'];

/**
 * 生成马来西亚公司注册码 (SSM格式)
 * 例如: 202001234567 or 1234567-X
 */
export function generateMalaysiaRegistrationCode(): string {
  const useNewFormat = Math.random() > 0.5;
  if (useNewFormat) {
    // Post-2020 format: 12 digits
    const prefix = randomPick(ssmPrefixes);
    const serial = String(randomInt(100000, 999999));
    return `${prefix}${serial}`;
  } else {
    // Old format: 7 digits + letter suffix
    const letters = ['A', 'D', 'H', 'K', 'M', 'T', 'V', 'W', 'X'];
    const num = String(randomInt(1000000, 9999999));
    return `${num}-${randomPick(letters)}`;
  }
}

export interface MalaysiaCustomerData {
  companyName: string;
  legalId: string;
  email: string;
  notes: string;
  scopeOfBusiness: string;
  addresses: MalaysiaAddressRow[];
}

export interface MalaysiaAddressRow {
  addressLine: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

const scopesOfBusiness = [
  'Information Technology Solutions & Hardware Distribution',
  'Cybersecurity Products & Managed Security Services',
  'Network Infrastructure & Systems Integration',
  'Enterprise Software Licensing & Support',
  'Cloud Computing & Data Center Solutions',
  'Digital Authentication & Identity Management',
  'IT Consulting & Professional Services',
  'Hardware Maintenance & After-Sales Support',
];

const customerNotes = [
  'Long-standing partner with strong regional presence across Southeast Asia.',
  'Key account with multi-year support contracts and hardware refresh cycles.',
  'Growing customer with active expansion plans in Klang Valley.',
  'Referred by existing partner; high potential for PKI and security products.',
  'Primary contact is IT Manager; quarterly business reviews scheduled.',
  'Government-linked company with procurement via open tender process.',
  'Finance sector customer with strict compliance and audit requirements.',
  'SME with fast procurement cycles and strong upsell potential.',
];

/**
 * 生成马来西亚客户地址行
 */
function generateAddressRow(): MalaysiaAddressRow {
  const streetNumber = randomInt(1, 999);
  const streetTypes = ['Jalan', 'Lorong', 'Persiaran', 'Lebuhraya'];
  const streetNames = [
    'Tun Razak', 'Bukit Bintang', 'Ampang', 'Cheras', 'Puchong',
    'Damansara', 'Sri Petaling', 'Old Klang Road', 'Klang', 'Port Klang',
    'Duta', 'Imbi', 'Sultan Ismail', 'Raja Chulan', 'Parlimen',
  ];
  return {
    addressLine: `${streetNumber}, ${randomPick(streetTypes)} ${randomPick(streetNames)}`,
    city: generateMalaysiaCity(),
    state: generateMalaysiaState(),
    postcode: String(randomInt(40000, 80000)),
    country: 'Malaysia',
  };
}

/**
 * 生成完整的马来西亚客户数据
 */
export function generateMalaysiaCustomerData(): MalaysiaCustomerData {
  return {
    companyName: generateUniqueCompanyName(),
    legalId: generateUniqueRegistrationCode(),
    email: generateMalaysiaEmail(),
    notes: randomPick(customerNotes),
    scopeOfBusiness: randomPick(scopesOfBusiness),
    addresses: [generateAddressRow(), generateAddressRow()],
  };
}

/**
 * 生成 Principal Allocation 数据
 */
export function generatePrincipalAllocations(count: number = 3): PrincipalAllocation[] {
  const allocations: PrincipalAllocation[] = [];
  const selectedPrincipals = randomPicks(hardwareProducts, count);
  const productTypes = ['Hardware', 'Software', 'Services', 'Maintenance', 'Consulting'];

  for (let i = 0; i < count; i++) {
    const principal = selectedPrincipals[i];
    const estimatedAmount = randomInt(5000, 50000);
    const myrValue = Math.round(estimatedAmount * (0.85 + Math.random() * 0.15) * 100) / 100;
    const weightedAmount = Math.round(myrValue * (0.7 + Math.random() * 0.3) * 100) / 100;
    const price = Math.round(estimatedAmount * (0.9 + Math.random() * 0.2) * 100) / 100;
    const cost = Math.round(price * (0.6 + Math.random() * 0.2) * 100) / 100;

    allocations.push({
      fd_Principal_name: randomPick(principalNames),
      fd_product_type: randomPick(productTypes),
      fd_product_list: `${principal.brand} ${principal.model} - ${principal.category}`,
      fd_prodcut_amt: estimatedAmount,
      fd_sm_s_price: price,
      fd_product_quantity: randomInt(1, 10),
      fd_service_period: `Year ${i + 1}`,
    });
  }

  return allocations;
}

// ════════════════════════════════════════════════
// 🇲🇾 马来西亚联系人专用数据
// ════════════════════════════════════════════════

// 马来西亚常见部门（英文）
const malaysiaDepartments = [
  'Information Technology',
  'IT Infrastructure',
  'Network Operations',
  'Cybersecurity',
  'Software Development',
  'Technical Support',
  'Systems Administration',
  'Database Administration',
  'Enterprise Architecture',
  'Digital Transformation',
  'Procurement & Purchasing',
  'Finance Department',
  'Human Resources',
  'Operations Management',
  'Quality Assurance',
  'Research & Development',
  'Project Management Office (PMO)',
  'Business Development',
  'Sales & Marketing',
  'Customer Service',
];

// 马来西亚常见职务/职位（英文）
const malaysiaJobTitles = [
  'Chief Information Officer (CIO)',
  'IT Director',
  'IT Manager',
  'System Administrator',
  'Network Engineer',
  'Security Analyst',
  'Software Engineer',
  'Database Administrator',
  'Technical Lead',
  'Solutions Architect',
  'DevOps Engineer',
  'Cloud Architect',
  'Business Analyst',
  'Project Manager',
  'Procurement Manager',
  'Finance Director',
  'HR Manager',
  'Operations Manager',
  'QA Manager',
  'Sales Director',
  'Account Manager',
  'Customer Service Manager',
  'Senior Developer',
  'Junior Developer',
  'System Analyst',
  'Helpdesk Technician',
  'Network Administrator',
  'Security Consultant',
  'Data Scientist',
  'Product Owner',
];

// 性别选项（对应 Schema 的 radio 值）
const genderOptions = [
  { label: 'Male', value: '1' },
  { label: 'Female', value: '2' },
];

// 决策角色选项（对应 Schema 的 select 值）
const influenceLevelOptions = [
  { label: 'Approver', value: '4' },
  { label: 'Decision Maker', value: '3' },
  { label: 'Evaluator', value: '2' },
  { label: 'End User', value: '1' },
  { label: 'Unknown', value: '0' },
];

// 关系强度选项（对应 Schema 的 select 值）
const relationshipOptions = [
  { label: 'Coach', value: '5' },
  { label: 'Champion', value: '4' },
  { label: 'Supporter', value: '3' },
  { label: 'Neutral', value: '2' },
  { label: 'Blocker', value: '1' },
];

export interface MalaysiaContactData {
  name: string;
  gender: { label: string; value: string };
  department: string;
  jobTitle: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  customerName?: string;
  recordType: string;
  primaryContact: string;
  introducer?: string;
  remark?: string;
  influenceLevel?: string;
  dateOfBirth?: string;
  relationship?: string;
}

/**
 * 生成马来西亚部门名称
 */
export function generateMalaysiaDepartment(): string {
  return randomPick(malaysiaDepartments);
}

/**
 * 生成马来西亚职务/职位
 */
export function generateMalaysiaJobTitle(): string {
  return randomPick(malaysiaJobTitles);
}

/**
 * 生成随机性别（Male/Female）
 */
export function generateMalaysiaGender(): { label: string; value: string } {
  return randomPick(genderOptions);
}

/**
 * 生成决策角色
 */
export function generateInfluenceLevel(): { label: string; value: string } {
  return randomPick(influenceLevelOptions);
}

/**
 * 生成关系强度
 */
export function generateRelationship(): { label: string; value: string } {
  return randomPick(relationshipOptions);
}

/**
 * 生成完整的马来西亚联系人数据
 *
 * 对应字段映射:
 * - fd_name → name (姓名)
 * - fd_gender → gender (性别)
 * - fd_department → department (部门)
 * - fd_job_title → jobTitle (职务)
 * - fd_tel → phone (办公电话)
 * - fd_mobile → mobile (手机)
 * - fd_email → email (邮件)
 * - fd_add → address (地址)
 * - fd_account_id → customerName (关联客户)
 * - fd_record_type → recordType (业务类型)
 * - fd_primary_contact → primaryContact (关键决策人)
 * - fd_introducer → introducer (介绍人)
 * - fd_remark → remark (备注)
 * - fd_influence_level → influenceLevel (决策描述)
 * - fd_date_of_birth → dateOfBirth (生日)
 * - fd_position → relationship (关系强度)
 */
export function generateMalaysiaContactData(customerName?: string): MalaysiaContactData {
  const contactNotes = [
    'Primary IT decision maker for hardware procurement',
    'Key technical contact for network infrastructure projects',
    'Main point of contact for cybersecurity solutions',
    'Budget holder for annual IT equipment refresh',
    'Technical evaluator for enterprise software licensing',
    'Operations lead for data center upgrade project',
    'Procurement contact for government tender process',
    'Referred by existing customer for PKI solution inquiry',
    'Attended Securemetric product demonstration event',
    'Interested in digital authentication and identity management',
  ];

  const birthDate = new Date(
    randomInt(1965, 2000),
    randomInt(0, 11),
    randomInt(1, 28)
  );

  return {
    name: generateMalaysiaContactName(),
    gender: generateMalaysiaGender(),
    department: generateMalaysiaDepartment(),
    jobTitle: generateMalaysiaJobTitle(),
    phone: generateMalaysiaPhone(),
    mobile: generateMalaysiaPhone(),
    email: generateMalaysiaEmail(customerName),
    address: generateMalaysiaAddress(),
    customerName: customerName || generateMalaysiaCompanyName(),
    recordType: 'Customer Contact',
    primaryContact: Math.random() > 0.5 ? 'Yes' : 'No',
    introducer: Math.random() > 0.7 ? generateMalaysiaContactName() : undefined,
    remark: randomPick(contactNotes),
    influenceLevel: generateInfluenceLevel().label,
    dateOfBirth: birthDate.toISOString().split('T')[0],
    relationship: generateRelationship().label,
  };
}

