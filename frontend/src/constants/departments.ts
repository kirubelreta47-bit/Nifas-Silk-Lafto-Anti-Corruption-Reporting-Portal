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

export const COMMON_DEPARTMENTS: DepartmentDef[] = [
  {
    id: 'land-admin',
    code: 'land',
    am: 'የመሬት ልማትና አስተዳደር ጽ/ቤት',
    en: 'Land Administration & Management',
    isCustom: false,
  },
  {
    id: 'trade-licensing',
    code: 'trade',
    am: 'የንግድና ገበያ ልማት ጽ/ቤት',
    en: 'Trade & Licensing Bureau',
    isCustom: false,
  },
  {
    id: 'housing-dev',
    code: 'housing',
    am: 'የቤቶች አስተዳደርና ልማት ኤጀንሲ',
    en: 'Housing Development Agency',
    isCustom: false,
  },
  {
    id: 'construction-permits',
    code: 'construction',
    am: 'የኮንስትራክሽን ፈቃድና ቁጥጥር',
    en: 'Construction & Building Permits',
    isCustom: false,
  },
  {
    id: 'vital-events',
    code: 'vital-id',
    am: 'የወሳኝ ኩነትና መታወቂያ አገልግሎት',
    en: 'Vital Events & National ID',
    isCustom: false,
  },
  {
    id: 'traffic-transport',
    code: 'traffic',
    am: 'የትራፊክ ማኔጅመንትና ትራንስፖርት',
    en: 'Traffic Management & Transport',
    isCustom: false,
  },
  {
    id: 'finance-procurement',
    code: 'finance',
    am: 'የፋይናንስና ኢኮኖሚ ልማት (ግዢ)',
    en: 'Finance & Procurement',
    isCustom: false,
  },
  {
    id: 'woreda-enforcement',
    code: 'enforcement',
    am: 'የወረዳ ደንብ ማስከበር',
    en: 'Woreda Code Enforcement',
    isCustom: false,
  },
];

export const DEPARTMENTS_STORAGE_KEY = 'nsl_custom_departments';

/**
 * Retrieve custom departments created by admin from local storage
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
 * Save a newly created custom department locally
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
 * Delete a custom department
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
 * Return all active departments (both 8 standard bureaus + all admin-created custom bureaus)
 */
export function getAllDepartments(): DepartmentDef[] {
  const custom = getCustomDepartments();
  const nonCollidingCustom = custom.filter((c) => !COMMON_DEPARTMENTS.some((s) => s.id === c.id));
  return [...COMMON_DEPARTMENTS, ...nonCollidingCustom];
}

/**
 * Resolves a department query param (slug, code, English name, or Amharic name)
 * to a structured DepartmentDef.
 */
export function resolveDepartment(
  query: string | null | undefined,
  list: DepartmentDef[] = getAllDepartments()
): DepartmentDef | null {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();

  // 1. Direct ID or Code match
  const byId = list.find(
    (d) => d.id.toLowerCase() === q || d.code.toLowerCase() === q
  );
  if (byId) return byId;

  // 2. English name match (exact or substring)
  const byEn = list.find((d) => {
    const enLower = d.en.toLowerCase();
    return enLower === q || enLower.includes(q) || q.includes(enLower);
  });
  if (byEn) return byEn;

  // 3. Amharic name match
  const rawQ = query.trim();
  const byAm = list.find(
    (d) => d.am === rawQ || d.am.includes(rawQ) || rawQ.includes(d.am)
  );
  if (byAm) return byAm;

  // 4. Custom/Dynamic department desk fallback
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


