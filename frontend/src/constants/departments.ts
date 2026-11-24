export interface DepartmentDef {
  id: string;
  code: string;
  am: string;
  en: string;
  iconName?: string;
  descriptionAm?: string;
  descriptionEn?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export const STANDARD_DEPARTMENT_PRESETS: DepartmentDef[] = [
  {
    id: 'chief-executive',
    code: 'ceo',
    am: 'ዋና ስራ አስፈፃሚ ጽ/ቤት',
    en: 'Chief Executive Office',
    descriptionAm: 'የክፍለ ከተማው ዋና ስራ አስፈፃሚ አመራር እና ውሳኔዎች',
    descriptionEn: 'Chief Executive leadership, administration and executive decisions',
    isCustom: false,
  },
  {
    id: 'public-service-hr',
    code: 'hr',
    am: 'ለፐብሊክ ሰርቪስ እና የሰው ኃ/ል/ጽ/ቤት',
    en: 'Public Service & Human Resource Development Office',
    descriptionAm: 'የመንግስት ሰራተኞች ቅጥር፣ የደረጃ እድገት እና የሰው ኃይል ልማት አስተዳደር',
    descriptionEn: 'Civil service recruitment, staff promotion, and HR governance',
    isCustom: false,
  },
  {
    id: 'design-construction',
    code: 'design',
    am: 'ለዲዛይን እና ግንባታ ስራዎች ጽ/ቤት',
    en: 'Design & Construction Works Office',
    descriptionAm: 'የመንግስት ህንፃዎችና መሰረተ-ልማት ዲዛይን እና የግንባታ ስራዎች ክትትል',
    descriptionEn: 'Public infrastructure design, architectural oversight, and civil works',
    isCustom: false,
  },
  {
    id: 'job-skills-training',
    code: 'skills',
    am: 'ለስራ ክፍሎት ስልጠና ጽ/ቤት',
    en: 'Job Skills & Vocational Training Office',
    descriptionAm: 'የስራ እድል ፈጠራ፣ የሙያና ክህሎት ስልጠናዎች እና የስራ ፈጠራ ድጋፍ',
    descriptionEn: 'Job creation, vocational technical training, and skill development',
    isCustom: false,
  },
  {
    id: 'women-children-social',
    code: 'social',
    am: 'ለሴ/ህጻናት እና ማህበራዊ ጉዳይ ጽ/ቤት',
    en: 'Women, Children & Social Affairs Office',
    descriptionAm: 'የሴቶች፣ ህጻናት መብት ጥበቃ እና የማህበራዊ ደህንነት አገልግሎት',
    descriptionEn: 'Women and children rights protection, gender and social welfare services',
    isCustom: false,
  },
  {
    id: 'youth-sports',
    code: 'sports',
    am: 'ለወጣቶችና ሰፖርት ጽ/ቤት',
    en: 'Youth & Sports Office',
    descriptionAm: 'የወጣቶች ስብዕና ግንባታ፣ የወጣቶች ማዕከላት እና የስፖርት ውድድሮች',
    descriptionEn: 'Youth engagement, community recreation centers, and sports affairs',
    isCustom: false,
  },
  {
    id: 'environmental-protection',
    code: 'env',
    am: 'ለአካባቢ ጥበቃ ጽ/ቤት',
    en: 'Environmental Protection Office',
    descriptionAm: 'የአካባቢ ብክለት ቁጥጥር፣ የአየር ንብረት ጥበቃ እና የተፈጥሮ ሀብት እንክብካቤ',
    descriptionEn: 'Environmental pollution control, climate action, and resource conservation',
    isCustom: false,
  },
  {
    id: 'communication',
    code: 'comm',
    am: 'ለኮሚኒኬሽን ጽ/ቤት',
    en: 'Government Communication Affairs Office',
    descriptionAm: 'የመንግስት ኮሚኒኬሽን፣ የህዝብ ግንኙነት እና የመረጃ ተደራሽነት',
    descriptionEn: 'Government communications, press releases, and public information',
    isCustom: false,
  },
  {
    id: 'health',
    code: 'health',
    am: 'ለጤና ጽ/ቤት',
    en: 'Health Office',
    descriptionAm: 'የሕዝብ ጤና አገልግሎት፣ ጤና ጣቢያዎች እና የመድኃኒት አቅርቦት ቁጥጥር',
    descriptionEn: 'Public healthcare management, health centers oversight, and clinical services',
    isCustom: false,
  },
  {
    id: 'city-beautification',
    code: 'beauty',
    am: 'ለከተማ ውበትና አረንጓዴ ልማት ጽ/ቤት',
    en: 'City Beautification & Green Development Office',
    descriptionAm: 'የፓርኮች፣ የመንገድ አካፋዮች እና አረንጓዴ ስፍራዎች ልማትና ውበት',
    descriptionEn: 'Urban green spaces, parks administration, and landscape beautification',
    isCustom: false,
  },
  {
    id: 'peace-security',
    code: 'security',
    am: 'ለሰላምና ፀጥታ ድ/ቤት',
    en: 'Peace & Security Administration Office',
    descriptionAm: 'የህዝብ ሰላምና ፀጥታ ጥበቃ፣ የወንጀል መከላከል እና የደህንነት ማስተባበሪያ',
    descriptionEn: 'Public peace, crime prevention, and community security coordination',
    isCustom: false,
  },
  {
    id: 'trade',
    code: 'trade',
    am: 'ለንግድ ጽ/ቤት',
    en: 'Trade Office',
    descriptionAm: 'የንግድ ምዝገባ፣ የፈቃድ ዕድሳት እና የንግድ ውድድር ቁጥጥር',
    descriptionEn: 'Business registration, trade licenses, renewals, and consumer protection',
    isCustom: false,
  },
  {
    id: 'justice',
    code: 'justice',
    am: 'ለፍትህ ጽ/ቤት',
    en: 'Justice Office',
    descriptionAm: 'የህግ ድጋፍ፣ የወንጀል ክስ አቀራረብ እና የፍትህ አገልግሎት ቁጥጥር',
    descriptionEn: 'Legal advisory, prosecution services, and civil justice administration',
    isCustom: false,
  },
  {
    id: 'planning-commission',
    code: 'plan',
    am: 'ለፕላን ኮምሽን ጽ/ቤት',
    en: 'Plan Commission Office',
    descriptionAm: 'የክፍለ ከተማው የልማት ፕላን፣ የኢኮኖሚ ስትራቴጂ እና የስታቲስቲክስ መረጃዎች',
    descriptionEn: 'Urban socioeconomic planning, development strategies, and data analytics',
    isCustom: false,
  },
  {
    id: 'general-manager',
    code: 'manager',
    am: 'ለስራ አስኪያጅ ጽ/ቤት',
    en: 'General Manager Office',
    descriptionAm: 'የማዘጋጃ ቤታዊ አገልግሎቶች አስተባባሪ እና አጠቃላይ ስራ አመራር',
    descriptionEn: 'Municipal services operations, infrastructure, and general management',
    isCustom: false,
  },
  {
    id: 'code-enforcement',
    code: 'enforcement',
    am: 'ለደንብ ማስከበር ጽ/ቤት',
    en: 'Code Enforcement Office',
    descriptionAm: 'የከተማ ደንብ ማስከበር፣ የህገወጥ ንግድ ቁጥጥር እና የህዝብ ስርዓት ጥበቃ',
    descriptionEn: 'Municipal ordinance enforcement, informal zoning control, and public order',
    isCustom: false,
  },
  {
    id: 'education',
    code: 'edu',
    am: 'ለትምህርት ጽ/ቤት',
    en: 'Education Office',
    descriptionAm: 'የመንግስትና የግል ትምህርት ቤቶች ቁጥጥር፣ የስርዓተ ትምህርት ጥራት እና ፈተናዎች',
    descriptionEn: 'Primary and secondary school administration, curriculum quality, and exams',
    isCustom: false,
  },
  {
    id: 'civil-registration',
    code: 'civil-id',
    am: 'ለሲቪል ምዘናና ነዋሪነት አገልግሎት ጽ/ቤት',
    en: 'Civil Registration & Residency Service Office',
    descriptionAm: 'የነዋሪነት መታወቂያ፣ የልደት፣ የጋብቻ እና የሞት ምዝገባ ማረጋገጫዎች',
    descriptionEn: 'Vital events certification (birth/marriage/death) and resident digital ID issuance',
    isCustom: false,
  },
  {
    id: 'housing-admin',
    code: 'housing',
    am: 'ቤቶች አስተዳደር ጽ/ቤት',
    en: 'Housing Administration Office',
    descriptionAm: 'የጋራ መኖሪያ ቤቶች (ኮንዶሚኒየም) እና የቀበሌ ቤቶች አስተዳደር',
    descriptionEn: 'Public condominium administration, lottery allocations, and municipal housing',
    isCustom: false,
  },
  {
    id: 'food-drug-control',
    code: 'fda',
    am: 'ለምግብና መድሀኒት ቁጥጥር ጽ/ቤት',
    en: 'Food & Drug Control Office',
    descriptionAm: 'የምግብ ንፅህና፣ የመድኃኒት ጥራት ፍተሻ እና የጤና ተቋማት ደረጃ ቁጥጥር',
    descriptionEn: 'Food hygiene, pharmaceutical safety inspections, and health standards regulation',
    isCustom: false,
  },
  {
    id: 'design-construction-pool',
    code: 'pool',
    am: 'ለዲዛይን እና ግንባታ ስራዎች ፑል አስተባባሪ ጽ/ቤት',
    en: 'Design & Construction Works Pool Coordinator Office',
    descriptionAm: 'የኢንጂነሪንግና ኮንስትራክሽን ባለሙያዎች ፑል ማስተባበሪያ ጽ/ቤት',
    descriptionEn: 'Engineering and construction human resource pool coordination',
    isCustom: false,
  },
  {
    id: 'cooperatives',
    code: 'coop',
    am: 'ለህብረት ስራ ማህበራት ጽ/ቤት',
    en: 'Cooperatives Development Office',
    descriptionAm: 'የሸማቾችና አምራቾች ህብረት ስራ ማህበራት ምዝገባ፣ ኦዲት እና ቁጥጥር',
    descriptionEn: 'Consumer and producer cooperative societies registration, audit, and supervision',
    isCustom: false,
  },
  {
    id: 'finance',
    code: 'finance',
    am: 'ለፋይናንስ ጽ/ቤት',
    en: 'Finance Office',
    descriptionAm: 'የመንግስት ግዢ ጨረታዎች፣ የክፍያ ማረጋገጫ እና የበጀት አስተዳደር',
    descriptionEn: 'Public finance management, municipal budgeting, and procurement accounting',
    isCustom: false,
  },
  {
    id: 'government-property',
    code: 'property',
    am: 'ለመንግስት ንብረት አስተዳደር ጽ/ቤት',
    en: 'Government Property Administration Office',
    descriptionAm: 'የመንግስት ቋሚና አላቂ ንብረቶች ምዝገባ፣ ስርጭት እና ቁጥጥር',
    descriptionEn: 'Public asset inventory, fixed assets registry, and government property oversight',
    isCustom: false,
  },
  {
    id: 'land-admin',
    code: 'land',
    am: 'ለመሬት ልማትና አስተዳር ጽ/ቤት',
    en: 'Land Development & Administration Office',
    descriptionAm: 'የይዞታ ማረጋገጫ፣ የካርታ አሰጣጥ እና የመሬት ግብይት ክትትል',
    descriptionEn: 'Land tenure certification, spatial mapping, and title deed transfers',
    isCustom: false,
  },
  {
    id: 'city-council',
    code: 'council',
    am: 'ለምክር ቤት ጽ/ቤት',
    en: 'Sub-City Council Office',
    descriptionAm: 'የክፍለ ከተማው ምክር ቤት ውሳኔዎች፣ አዋጆች እና የህዝብ ጥያቄዎች ማስተባበሪያ',
    descriptionEn: 'Sub-city council administration, legislative resolutions, and civic petitions',
    isCustom: false,
  },
  {
    id: 'culture-tourism',
    code: 'culture',
    am: 'የባህል፣ ኪነ-ጥበብ እና ቱሪዝም ጽ/ቤት',
    en: 'Culture, Arts & Tourism Office',
    descriptionAm: 'የባህል ቅርስ ጥበቃ፣ የኪነ-ጥበብ ማዕከላት እና የቱሪዝም መስህቦች ልማት',
    descriptionEn: 'Cultural heritage preservation, performing arts centers, and tourism development',
    isCustom: false,
  },
  {
    id: 'sanitation-cleaning',
    code: 'clean',
    am: 'ጽዳት አስተዳደር ጽ/ቤት',
    en: 'Sanitation & Cleaning Administration Office',
    descriptionAm: 'የደረቅ ቆሻሻ አወጋገድ፣ የከተማ ፅዳት እና የፅዳት ሰራተኞች አስተዳደር',
    descriptionEn: 'Solid waste management, municipal cleaning, and waste disposal administration',
    isCustom: false,
  },
  {
    id: 'industry-development',
    code: 'industry',
    am: 'ኢንዱስትሪ ልማት ጽ/ቤት',
    en: 'Industry Development Office',
    descriptionAm: 'የአምራች ኢንዱስትሪዎች ድጋፍ፣ የማኑፋክቸሪንግ ዘርፍ ክትትል እና የኢንዱስትሪ መንደሮች',
    descriptionEn: 'Manufacturing sector support, industrial zones, and SME factory facilitation',
    isCustom: false,
  },
  {
    id: 'urban-agriculture',
    code: 'agri',
    am: 'ለአርሶ አደርና ከተማ ግብርና ጽ/ቤት',
    en: 'Farmers & Urban Agriculture Office',
    descriptionAm: 'የከተማ ግብርና፣ የእንስሳትና አትክልት ልማት እንዲሁም የአርሶ አደሮች ጉዳይ',
    descriptionEn: 'Urban agriculture, livestock farming, horticulture, and peri-urban farmers support',
    isCustom: false,
  },
  {
    id: 'community-volunteerism',
    code: 'volunteer',
    am: 'ህብረተሰብ ተሳትፎና በጎ ፈቃድ ጽ/ቤት',
    en: 'Community Participation & Volunteerism Office',
    descriptionAm: 'የህብረተሰብ አቀፍ ተሳትፎ፣ የበጎ ፈቃድ አገልግሎቶች እና የማህበረሰብ ልማት ድጋፍ',
    descriptionEn: 'Community mobilization, public volunteering initiatives, and civic engagement',
    isCustom: false,
  },
  {
    id: 'workspace-administration',
    code: 'workplace',
    am: 'መስሪያ ቦታ አስ/ጽ/ቤት',
    en: 'Enterprise Workspace Administration Office',
    descriptionAm: 'የጥቃቅንና አነስተኛ ኢንተርፕራይዞች መስሪያ ቦታዎች፣ ሼዶችና ሱቆች አስተዳደር',
    descriptionEn: 'SME workspace sheds, commercial enterprise stall allocations, and administration',
    isCustom: false,
  },
  {
    id: 'construction-permits',
    code: 'construction',
    am: 'ግንባታ ፈቃድና ቁጥጥር ጽ/ቤት',
    en: 'Construction Permit & Inspection Office',
    descriptionAm: 'የግንባታ ፈቃድ፣ የይዞታ ፍተሻ እና ህገወጥ ግንባታዎች መቆጣጠሪያ',
    descriptionEn: 'Architectural compliance, building site inspections, and structural safety',
    isCustom: false,
  },
];

// Alias for backwards compatibility
export const COMMON_DEPARTMENTS: DepartmentDef[] = STANDARD_DEPARTMENT_PRESETS;

export const DEPARTMENTS_STORAGE_KEY = 'nsl_custom_departments';

// In-memory cache to avoid repeated disk reads and JSON parsing
let inMemoryCachedDepts: DepartmentDef[] | null = null;

/**
 * Retrieve active departments created / chosen by admin from memory / local storage
 */
export function getCustomDepartments(): DepartmentDef[] {
  if (inMemoryCachedDepts !== null) {
    return inMemoryCachedDepts;
  }
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    inMemoryCachedDepts = raw ? JSON.parse(raw) : [];
    return inMemoryCachedDepts!;
  } catch {
    inMemoryCachedDepts = [];
    return [];
  }
}

/**
 * Save an active department created or selected by the admin
 */
export function saveCustomDepartment(dept: DepartmentDef): DepartmentDef {
  const current = getCustomDepartments();
  const existingIdx = current.findIndex((d) => d.id === dept.id);
  let updated: DepartmentDef[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...dept, isCustom: true };
  } else {
    updated = [
      ...current,
      { ...dept, isCustom: true, createdAt: dept.createdAt || new Date().toISOString() },
    ];
  }
  inMemoryCachedDepts = updated;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nsl_departments_updated', { detail: updated }));
  }
  return dept;
}

/**
 * Batch save multiple departments without repeated disk writes or event storms
 */
export function saveDepartmentsBatch(depts: DepartmentDef[]): DepartmentDef[] {
  if (!depts || depts.length === 0) return getCustomDepartments();
  const current = getCustomDepartments();
  const map = new Map<string, DepartmentDef>();
  current.forEach((d) => map.set(d.id, d));
  depts.forEach((d) => {
    map.set(d.id, {
      ...d,
      isCustom: true,
      createdAt: d.createdAt || new Date().toISOString(),
    });
  });
  const updated = Array.from(map.values());
  inMemoryCachedDepts = updated;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nsl_departments_updated', { detail: updated }));
  }
  return updated;
}

/**
 * Delete a department from the active list
 */
export function deleteCustomDepartment(id: string): boolean {
  const current = getCustomDepartments();
  const filtered = current.filter((d) => d.id !== id);
  if (filtered.length !== current.length) {
    inMemoryCachedDepts = filtered;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('nsl_departments_updated', { detail: filtered }));
    }
    return true;
  }
  return false;
}

/**
 * Return ONLY active departments that have been explicitly chosen or created by the admin.
 * Standard departments do NOT appear automatically unless chosen by the admin.
 */
export function getAllDepartments(): DepartmentDef[] {
  return getCustomDepartments();
}

/**
 * Return ALL departments: standard presets + custom/newly created ones.
 * Deduplicates by id, so any custom override of a standard preset is respected.
 * Used for QR Code generator, public reporting options, etc. so admin and citizens
 * can choose from both standard/old departments and newly created departments.
 */
export function getAllDepartmentsWithPresets(): DepartmentDef[] {
  const custom = getAllDepartments();
  const customMap = new Map(custom.map((d) => [d.id.toLowerCase(), d]));

  // Standard presets (with any custom override applied)
  const standards = STANDARD_DEPARTMENT_PRESETS.map((preset) => {
    return customMap.get(preset.id.toLowerCase()) || preset;
  });

  // Any custom departments that are not among the standard preset IDs
  const standardIds = new Set(STANDARD_DEPARTMENT_PRESETS.map((p) => p.id.toLowerCase()));
  const extraCustom = custom.filter((c) => !standardIds.has(c.id.toLowerCase()));

  return [...standards, ...extraCustom];
}

export function isDepartmentActive(idOrCode: string): boolean {
  if (!idOrCode) return false;
  const active = getAllDepartments();
  const q = idOrCode.toLowerCase();
  return active.some(
    (d) => (d?.id && d.id.toLowerCase() === q) || (d?.code && d.code.toLowerCase() === q)
  );
}

const LEGACY_ID_ALIASES: Record<string, string> = {
  'housing-dev': 'housing-admin',
  'vital-events': 'civil-registration',
  'woreda-enforcement': 'code-enforcement',
  'finance-procurement': 'finance',
  'trade-licensing': 'trade',
  'health-clinics': 'health',
};

const normalizeAmharic = (s?: string) => (s || '').trim().replace(/^[ለየ]/, '').replace(/\s+/g, ' ').trim();

/**
 * Resolves a department query param (slug, code, English name, or Amharic name)
 * to a structured DepartmentDef. Checks active departments first, then standard presets.
 */
export function resolveDepartment(
  query: string | null | undefined,
  list: DepartmentDef[] = getAllDepartments()
): DepartmentDef | null {
  if (!query || !query.trim()) return null;
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  const targetId = LEGACY_ID_ALIASES[q] || q;

  // 1. Direct ID or Code match in active list
  const byId = list.find(
    (d) =>
      (d?.id && (d.id.toLowerCase() === targetId || d.id.toLowerCase() === q)) ||
      (d?.code && d.code.toLowerCase() === q)
  );
  if (byId) return byId;

  // 2. English name match in active list
  const byEn = list.find((d) => {
    if (!d?.en) return false;
    const enLower = d.en.toLowerCase();
    return enLower === q || enLower.includes(q) || q.includes(enLower);
  });
  if (byEn) return byEn;

  // 3. Amharic name match in active list
  const normQ = normalizeAmharic(rawQ);
  const byAm = list.find((d) => {
    if (!d?.am) return false;
    if (d.am === rawQ || d.am.includes(rawQ) || rawQ.includes(d.am)) return true;
    const normDept = normalizeAmharic(d.am);
    return normDept === normQ || normDept.includes(normQ) || normQ.includes(normDept);
  });
  if (byAm) return byAm;

  // 4. Check STANDARD_DEPARTMENT_PRESETS if not found in active list
  const presetMatch = STANDARD_DEPARTMENT_PRESETS.find(
    (p) =>
      (p?.id && (p.id.toLowerCase() === targetId || p.id.toLowerCase() === q)) ||
      (p?.code && p.code.toLowerCase() === q) ||
      (p?.en && (p.en.toLowerCase() === q || p.en.toLowerCase().includes(q) || q.includes(p.en.toLowerCase()))) ||
      (p?.am && (p.am === rawQ || p.am.includes(rawQ) || rawQ.includes(p.am))) ||
      (p?.am && (normalizeAmharic(p.am) === normQ || normalizeAmharic(p.am).includes(normQ) || normQ.includes(normalizeAmharic(p.am))))
  );
  if (presetMatch) return presetMatch;

  // 5. Custom/Dynamic department desk fallback
  return {
    id: 'custom',
    code: 'custom',
    am: rawQ,
    en: rawQ,
    isCustom: true,
  };
}

/**
 * Match a report's office field to a known department
 */
export function matchReportToDepartment(
  officeStr: string,
  list: DepartmentDef[] = getAllDepartments()
): DepartmentDef | null {
  if (!officeStr || typeof officeStr !== 'string') return null;
  const lower = officeStr.toLowerCase();
  const normOffice = normalizeAmharic(officeStr);

  for (const dept of list) {
    if (!dept) continue;
    const id = dept.id ? dept.id.toLowerCase() : '';
    const code = dept.code ? dept.code.toLowerCase() : '';
    const en = dept.en ? dept.en.toLowerCase() : '';
    const am = dept.am || '';
    const normDept = normalizeAmharic(am);

    if (
      (id && lower.includes(id)) ||
      (code && lower.includes(code)) ||
      (en && lower.includes(en)) ||
      (am && officeStr.includes(am)) ||
      (normDept && normOffice.includes(normDept))
    ) {
      return dept;
    }
  }

  // Also check standard presets if not matched in active list
  for (const dept of STANDARD_DEPARTMENT_PRESETS) {
    if (!dept) continue;
    const id = dept.id ? dept.id.toLowerCase() : '';
    const code = dept.code ? dept.code.toLowerCase() : '';
    const en = dept.en ? dept.en.toLowerCase() : '';
    const am = dept.am || '';
    const normDept = normalizeAmharic(am);

    if (
      (id && lower.includes(id)) ||
      (code && lower.includes(code)) ||
      (en && lower.includes(en)) ||
      (am && officeStr.includes(am)) ||
      (normDept && normOffice.includes(normDept))
    ) {
      return dept;
    }
  }

  return null;
}

/**
 * Format department for submission to backend / Neon PostgreSQL
 */
export function formatDepartmentSubmission(dept?: DepartmentDef | null): string {
  if (!dept) return '';
  if (dept.id === 'custom') {
    return dept.en || dept.am || '';
  }
  const en = dept.en || (dept as any).nameEn || '';
  const am = dept.am || (dept as any).nameAm || '';
  if (en && am) return `${en} (${am})`;
  return en || am || dept.id || '';
}


