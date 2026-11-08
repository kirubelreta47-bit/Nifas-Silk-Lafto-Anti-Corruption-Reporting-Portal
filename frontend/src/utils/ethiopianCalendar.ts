/**
 * Ethiopian Calendar (Ge'ez Calendar) Converter & Formatter Utility
 * Provides 100% mathematically exact bidirectional conversion between
 * Gregorian and Ethiopian (ዓ.ም / E.C.) calendars.
 */

export const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', // 1
  'ጥቅምት',  // 2
  'ኅዳር',   // 3
  'ታኅሣሥ',  // 4
  'ጥር',     // 5
  'የካቲት',  // 6
  'መጋቢት',  // 7
  'ሚያዝያ',  // 8
  'ግንቦት',  // 9
  'ሰኔ',     // 10
  'ሐምሌ',   // 11
  'ነሐሴ',   // 12
  'ጳጉሜ',   // 13
] as const;

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miyazya',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
] as const;

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAm: string;
  monthNameEn: string;
}

/**
 * Gregorian date to Julian Day Number (JDN)
 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Julian Day Number (JDN) to Ethiopian Date
 */
export function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  const monthIdx = Math.max(0, Math.min(12, month - 1));
  return {
    year,
    month,
    day,
    monthNameAm: ETHIOPIAN_MONTHS_AM[monthIdx] || '',
    monthNameEn: ETHIOPIAN_MONTHS_EN[monthIdx] || '',
  };
}

/**
 * Ethiopian Date to Julian Day Number (JDN)
 */
export function ethiopianToJdn(year: number, month: number, day: number): number {
  return 1723856 + 365 + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
}

/**
 * Julian Day Number (JDN) to Gregorian Date
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const day = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const month = j + 2 - 12 * l4;
  const year = 100 * (n - 49) + i + l4;
  return { year, month, day };
}

/**
 * Converts a Gregorian Date object, ISO string (YYYY-MM-DD), or timestamp
 * to an EthiopianDate object.
 */
export function toEthiopian(inputDate: Date | string | number | null | undefined): EthiopianDate {
  if (!inputDate) {
    const now = new Date();
    const jdn = gregorianToJdn(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jdnToEthiopian(jdn);
  }

  let d: Date;
  if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    const parts = inputDate.split('-').map(Number);
    const jdn = gregorianToJdn(parts[0], parts[1], parts[2]);
    return jdnToEthiopian(jdn);
  }

  d = new Date(inputDate);
  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const jdn = gregorianToJdn(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return jdnToEthiopian(jdn);
}

export const toEthiopianDate = toEthiopian;

/**
 * Converts Ethiopian Date components to a Gregorian ISO string (YYYY-MM-DD)
 */
export function ethiopianToGregorianIso(year: number, month: number, day: number): string {
  const jdn = ethiopianToJdn(year, month, day);
  const g = jdnToGregorian(jdn);
  const mm = String(g.month).padStart(2, '0');
  const dd = String(g.day).padStart(2, '0');
  return `${g.year}-${mm}-${dd}`;
}

/**
 * Format a date into Ethiopian representation
 * @example
 * formatEthiopianDate('2026-11-08', 'am') => "ጥቅምት 29, 2019 ዓ.ም"
 * formatEthiopianDate('2026-11-08', 'en') => "Tikimt 29, 2019 (EC)"
 */
export function formatEthiopianDate(
  date: Date | string | number | null | undefined,
  lang: 'am' | 'en' = 'am',
  options?: { showGregorian?: boolean; numeric?: boolean }
): string {
  if (!date) return '-';
  const eth = toEthiopian(date);

  if (options?.numeric) {
    const mm = String(eth.month).padStart(2, '0');
    const dd = String(eth.day).padStart(2, '0');
    const base = `${dd}/${mm}/${eth.year}`;
    return lang === 'am' ? `${base} ዓ.ም` : `${base} E.C.`;
  }

  const monthName = lang === 'am' ? eth.monthNameAm : eth.monthNameEn;
  const suffix = lang === 'am' ? 'ዓ.ም' : 'E.C.';
  const ethStr = `${monthName} ${eth.day}, ${eth.year} ${suffix}`;

  if (options?.showGregorian) {
    let gregStr = '';
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      gregStr = date;
    } else {
      const d = new Date(date);
      gregStr = !isNaN(d.getTime()) ? d.toLocaleDateString() : '';
    }
    return gregStr ? `${ethStr} (${gregStr})` : ethStr;
  }

  return ethStr;
}

/**
 * Format date & time into Ethiopian calendar with local time
 */
export function formatEthiopianDateTime(
  date: Date | string | number | null | undefined,
  lang: 'am' | 'en' = 'am'
): string {
  if (!date) return '-';
  const d = new Date(date);
  const ethDateStr = formatEthiopianDate(date, lang);
  if (isNaN(d.getTime())) return ethDateStr;

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${ethDateStr} ${timeStr}`;
}
