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
    id: 'land-admin',
    code: 'land',
    am: 'የመሬት ልማትና አስተዳደር ጽ/ቤት',
    en: 'Land Administration & Management',
    descriptionAm: 'የይዞታ ማረጋገጫ፣ የካርታ አሰጣጥ እና የመሬት ግብይት ክትትል',
    descriptionEn: 'Land tenure certification, spatial mapping, and title deed transfers',
    isCustom: false,
  },
  {
    id: 'trade-licensing',
    code: 'trade',
    am: 'የንግድና ገበያ ልማት ጽ/ቤት',
    en: 'Trade & Licensing Bureau',
    descriptionAm: 'የንግድ ምዝገባ፣ የፈቃድ ዕድሳት እና የንግድ ውድድር ቁጥጥር',
    descriptionEn: 'Business registration, commercial permits, renewals, and fair trade oversight',
    isCustom: false,
  },
  {
    id: 'housing-dev',
    code: 'housing',
    am: 'የቤቶች አስተዳደርና ልማት ኤጀንሲ',
    en: 'Housing Development Agency',
    descriptionAm: 'የጋራ መኖሪያ ቤቶች (ኮንዶሚኒየም) ዕጣ እና የቀበሌ ቤቶች አስተዳደር',
    descriptionEn: 'Public condominium lottery allocations and municipal rental housing governance',
    isCustom: false,
  },
  {
    id: 'construction-permits',
    code: 'construction',
    am: 'የኮንስትራክሽን ፈቃድና ቁጥጥር',
    en: 'Construction & Building Permits',
    descriptionAm: 'የግንባታ ፈቃድ፣ የይዞታ ፍተሻ እና ህገወጥ ግንባታዎች መቆጣጠሪያ',
    descriptionEn: 'Architectural compliance, building site inspections, and structural safety',
    isCustom: false,
  },
  {
    id: 'vital-events',
    code: 'vital-id',
    am: 'የወሳኝ ኩነትና መታወቂያ አገልግሎት',
    en: 'Vital Events & National ID',
    descriptionAm: 'የልደት፣ የጋብቻ፣ የሞት ምዝገባ እና የነዋሪነት መታወቂያ አሰጣጥ',
    descriptionEn: 'Birth/marriage certificates, residency verification, and national digital ID issuance',
    isCustom: false,
  },
  {
    id: 'traffic-transport',
    code: 'traffic',
    am: 'የትራፊክ ማኔጅመንትና ትራንስፖርት',
    en: 'Traffic Management & Transport',
    descriptionAm: 'የትራፊክ ቅጣት፣ የተሽከርካሪ ብቃት ማረጋገጫ (ቦሎ) እና የመንጃ ፈቃድ',
    descriptionEn: 'Traffic enforcement citations, vehicle roadworthiness inspection, and transit routing',
    isCustom: false,
  },
  {
    id: 'finance-procurement',
    code: 'finance',
    am: 'የፋይናንስና ኢኮኖሚ ልማት (ግዢ)',
    en: 'Finance & Procurement',
    descriptionAm: 'የመንግስት ግዢ ጨረታዎች፣ የክፍያ ማረጋገጫ እና የበጀት አስተዳደር',
    descriptionEn: 'Public tender evaluations, municipal vendor contracts, and disbursement auditing',
    isCustom: false,
  },
  {
    id: 'woreda-enforcement',
    code: 'enforcement',
    am: 'የወረዳ ደንብ ማስከበር',
    en: 'Woreda Code Enforcement',
    descriptionAm: 'የህገወጥ ንግድ ቁጥጥር፣ የመንገድ ዳር ግርግር እና የከተማ ፅዳት ደንብ',
    descriptionEn: 'Municipal ordinance enforcement, informal vendor zoning, and public order',
    isCustom: false,
  },
  {
    id: 'water-sewerage',
    code: 'water-sewerage',
    am: 'የውሃና ፍሳሽ ኤጀንሲ',
    en: 'Water & Sewerage Agency',
    descriptionAm: 'የውሃ አቅርቦትና ፍሳሽ መስመሮች ጥገና ጽ/ቤት',
    descriptionEn: 'Municipal drinking water and drainage infrastructure',
    isCustom: false,
  },
  {
    id: 'revenues-customs',
    code: 'revenues-customs',
    am: 'የገቢዎችና ጉምሩክ ቅርንጫፍ ጽ/ቤት',
    en: 'Revenues & Customs Branch',
    descriptionAm: 'የግብርና ቀረጥ አሰባሰብ እና የታክስ ቁጥጥር',
    descriptionEn: 'Tax collection, audits, and tariff assessments',
    isCustom: false,
  },
  {
    id: 'health-clinics',
    code: 'health-clinics',
    am: 'የጤና ጣቢያዎችና ክሊኒኮች አስተዳደር',
    en: 'Health Centers & Clinics Bureau',
    descriptionAm: 'የሕዝብ ጤና አገልግሎት እና የመድኃኒት አቅርቦት',
    descriptionEn: 'Public primary healthcare and dispensary oversight',
    isCustom: false,
  },
];

// Alias for backwards compatibility
export const COMMON_DEPARTMENTS: DepartmentDef[] = STANDARD_DEPARTMENT_PRESETS;

export const DEPARTMENTS_STORAGE_KEY = 'nsl_custom_departments';

/**
 * Retrieve active departments created / chosen by admin from local storage
 */
export function getCustomDepartments(): DepartmentDef[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
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
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nsl_departments_updated', { detail: updated }));
  }
  return dept;
}

/**
 * Delete a department from the active list
 */
export function deleteCustomDepartment(id: string): boolean {
  const current = getCustomDepartments();
  const filtered = current.filter((d) => d.id !== id);
  if (filtered.length !== current.length) {
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

export function isDepartmentActive(idOrCode: string): boolean {
  const active = getAllDepartments();
  const q = idOrCode.toLowerCase();
  return active.some((d) => d.id.toLowerCase() === q || d.code.toLowerCase() === q);
}

/**
 * Resolves a department query param (slug, code, English name, or Amharic name)
 * to a structured DepartmentDef. Checks active departments first, then standard presets.
 */
export function resolveDepartment(
  query: string | null | undefined,
  list: DepartmentDef[] = getAllDepartments()
): DepartmentDef | null {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();

  // 1. Direct ID or Code match in active list
  const byId = list.find(
    (d) => d.id.toLowerCase() === q || d.code.toLowerCase() === q
  );
  if (byId) return byId;

  // 2. English name match in active list
  const byEn = list.find((d) => {
    const enLower = d.en.toLowerCase();
    return enLower === q || enLower.includes(q) || q.includes(enLower);
  });
  if (byEn) return byEn;

  // 3. Amharic name match in active list
  const rawQ = query.trim();
  const byAm = list.find(
    (d) => d.am === rawQ || d.am.includes(rawQ) || rawQ.includes(d.am)
  );
  if (byAm) return byAm;

  // 4. Check STANDARD_DEPARTMENT_PRESETS if not found in active list
  const presetMatch = STANDARD_DEPARTMENT_PRESETS.find(
    (p) =>
      p.id.toLowerCase() === q ||
      p.code.toLowerCase() === q ||
      p.en.toLowerCase() === q ||
      p.am === rawQ
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
  if (!officeStr) return null;
  const lower = officeStr.toLowerCase();
  for (const dept of list) {
    if (
      lower.includes(dept.id.toLowerCase()) ||
      lower.includes(dept.code.toLowerCase()) ||
      lower.includes(dept.en.toLowerCase()) ||
      officeStr.includes(dept.am)
    ) {
      return dept;
    }
  }
  return null;
}

/**
 * Format department for submission to backend / Neon PostgreSQL
 */
export function formatDepartmentSubmission(dept: DepartmentDef): string {
  if (dept.id === 'custom') {
    return dept.en;
  }
  return `${dept.en} (${dept.am})`;
}


