export interface DepartmentDef {
  id: string;
  code: string;
  am: string;
  en: string;
  iconName?: string;
  descriptionAm?: string;
  descriptionEn?: string;
}

export const COMMON_DEPARTMENTS: DepartmentDef[] = [
  {
    id: 'land-admin',
    code: 'land',
    am: 'የመሬት ልማትና አስተዳደር ጽ/ቤት',
    en: 'Land Administration & Management',
  },
  {
    id: 'trade-licensing',
    code: 'trade',
    am: 'የንግድና ገበያ ልማት ጽ/ቤት',
    en: 'Trade & Licensing Bureau',
  },
  {
    id: 'housing-dev',
    code: 'housing',
    am: 'የቤቶች አስተዳደርና ልማት ኤጀንሲ',
    en: 'Housing Development Agency',
  },
  {
    id: 'construction-permits',
    code: 'construction',
    am: 'የኮንስትራክሽን ፈቃድና ቁጥጥር',
    en: 'Construction & Building Permits',
  },
  {
    id: 'vital-events',
    code: 'vital-id',
    am: 'የወሳኝ ኩነትና መታወቂያ አገልግሎት',
    en: 'Vital Events & National ID',
  },
  {
    id: 'traffic-transport',
    code: 'traffic',
    am: 'የትራፊክ ማኔጅመንትና ትራንስፖርት',
    en: 'Traffic Management & Transport',
  },
  {
    id: 'finance-procurement',
    code: 'finance',
    am: 'የፋይናንስና ኢኮኖሚ ልማት (ግዢ)',
    en: 'Finance & Procurement',
  },
  {
    id: 'woreda-enforcement',
    code: 'enforcement',
    am: 'የወረዳ ደንብ ማስከበር',
    en: 'Woreda Code Enforcement',
  },
];

/**
 * Resolves a department query param (slug, code, English name, or Amharic name)
 * to a structured DepartmentDef.
 */
export function resolveDepartment(query: string | null | undefined): DepartmentDef | null {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();

  // 1. Direct ID or Code match
  const byId = COMMON_DEPARTMENTS.find(
    (d) => d.id.toLowerCase() === q || d.code.toLowerCase() === q
  );
  if (byId) return byId;

  // 2. English name match (exact or substring)
  const byEn = COMMON_DEPARTMENTS.find((d) => {
    const enLower = d.en.toLowerCase();
    return enLower === q || enLower.includes(q) || q.includes(enLower);
  });
  if (byEn) return byEn;

  // 3. Amharic name match
  const rawQ = query.trim();
  const byAm = COMMON_DEPARTMENTS.find(
    (d) => d.am === rawQ || d.am.includes(rawQ) || rawQ.includes(d.am)
  );
  if (byAm) return byAm;

  // 4. Custom/Dynamic department desk
  return {
    id: 'custom',
    code: 'custom',
    am: rawQ,
    en: rawQ,
  };
}

/**
 * Match a report's office field to a known department
 */
export function matchReportToDepartment(officeStr: string): DepartmentDef | null {
  if (!officeStr) return null;
  const lower = officeStr.toLowerCase();
  for (const dept of COMMON_DEPARTMENTS) {
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

