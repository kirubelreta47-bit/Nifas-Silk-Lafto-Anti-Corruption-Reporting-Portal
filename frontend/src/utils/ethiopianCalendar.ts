/**
 * Ethiopian Calendar (Ge'ez Calendar) Port of github.com/lgirma/ethiopian-calendar
 * Reference: https://pkg.go.dev/github.com/lgirma/ethiopian-calendar
 *
 * Implements:
 *  - Core conversion: ToEthiopian, ToGregorian, startDayOfEc
 *  - Models & Date structures: Date, DayOfYear, NewDate, NewDay
 *  - Constants: Evangelists, Ethiopian & Gregorian months, Days of Week, Feasts
 *  - Bahire Hasab (Computus): GetEvangelist, GetRabit, GetWenber, GetMeTq, GetMebacha,
 *    GetMebajaHamer, GetNineveh, GetFeast
 *  - i18n lookup: MONTH_NAMES, DAY_NAMES, EVANGELISTS_NAMES
 *  - Web Portal formatters: toEthiopian, formatEthiopianDate, formatEthiopianDateTime
 */

// ==========================================
// 1. MODELS & STRUCTURES
// ==========================================

export interface DateStruct {
  year: number;
  month: number;
  day: number;
}

export interface DayOfYear {
  month: number;
  day: number;
}

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAm: string;
  monthNameEn: string;
}

export function NewDate(year: number, month: number, day: number): DateStruct {
  return { year, month, day };
}

export function NewDay(month: number, day: number): DayOfYear {
  return { month, day };
}

// ==========================================
// 2. CONSTANTS (From models.go)
// ==========================================

// Evangelists
export const EVANGELIST_MATTHEW = 1;
export const EVANGELIST_MARK = 2;
export const EVANGELIST_LUKE = 3;
export const EVANGELIST_JOHN = 4;

// Ethiopian Months
export const MONTH_MESKEREM = 1;
export const MONTH_TIKIMT = 2;
export const MONTH_HIDAR = 3;
export const MONTH_TAHISAS = 4;
export const MONTH_TIR = 5;
export const MONTH_YEKATIT = 6;
export const MONTH_MEGABIT = 7;
export const MONTH_MIYAZIYA = 8;
export const MONTH_GINBOT = 9;
export const MONTH_SENE = 10;
export const MONTH_HAMLE = 11;
export const MONTH_NEHASE = 12;
export const MONTH_PAGUMEN = 13;

// Gregorian Months
export const MONTH_SEP = 1;
export const MONTH_OCT = 2;
export const MONTH_NOV = 3;
export const MONTH_DEC = 4;
export const MONTH_JAN = 5;
export const MONTH_FEB = 6;
export const MONTH_MAR = 7;
export const MONTH_APR = 8;
export const MONTH_MAY = 9;
export const MONTH_JUN = 10;
export const MONTH_JUL = 11;
export const MONTH_AUG = 12;

// Days of the Week (1-indexed starting Monday)
export const DAY_MON = 1;
export const DAY_TUE = 2;
export const DAY_WED = 3;
export const DAY_THU = 4;
export const DAY_FRI = 5;
export const DAY_SAT = 6;
export const DAY_SUN = 7;

// Feasts and Fasts offsets from Nineveh (Nenewe)
export const FEAST_ABIY_TSOM = 14;
export const FEAST_GREAT_LENT = 14;
export const FEAST_DEBREZEIT = 41;
export const FEAST_HOSAENA = 62;
export const FEAST_SIQLET = 67;
export const FEAST_GOOD_FRIDAY = 67;
export const FEAST_TINSAE = 69;
export const FEAST_EASTER = 69;
export const FEAST_RIKBE_KAHINAT = 93;
export const FEAST_ERGET = 108;
export const FEAST_ASCENSION = 108;
export const FEAST_PERAQLITOS = 118;
export const FEAST_PENTECOST = 118;
export const FEAST_TSOME_HAWARIAT = 119;
export const FEAST_APOSTLES_FAST = 119;

// ==========================================
// 3. INTERNATIONALIZATION (From i18n.go)
// ==========================================

/**
 * MONTH_NAMES: 1-indexed lookup of Ethiopian months in Ge'ez / Amharic.
 * Exactly matches github.com/lgirma/ethiopian-calendar/i18n.go
 */
export const MONTH_NAMES: readonly string[] = [
  '',
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጕሜን',
] as const;

/**
 * DAY_NAMES: 1-indexed lookup of days of the week in Amharic (1 = Monday).
 * Matches github.com/lgirma/ethiopian-calendar/i18n.go
 */
export const DAY_NAMES: readonly string[] = [
  '',
  'ሰኞ',
  'ማክሰኞ',
  'ረቡዕ',
  'ኀሙስ',
  'ዐርብ',
  'ቅዳሜ',
  'እሑድ',
] as const;

/**
 * EVANGELISTS_NAMES: 1-indexed lookup of the four evangelists.
 * Matches github.com/lgirma/ethiopian-calendar/i18n.go
 */
export const EVANGELISTS_NAMES: readonly string[] = [
  '',
  'ማቴዎስ',
  'ማርቆስ',
  'ሉቃስ',
  'ዮሐንስ',
] as const;

export const ETHIOPIAN_MONTHS_EN: readonly string[] = [
  '',
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

export const ETHIOPIAN_MONTHS_AM = MONTH_NAMES.slice(1);

// ==========================================
// 4. CONVERSION ALGORITHM (From conversion.go)
// ==========================================

// gregMonthsStartingSept: Number of days in gregorian months starting with September (index 1)
const gregMonthsStartingSept = [0, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 30];

// gregOrder: Gregorian months ordered according to Ethiopian
const gregOrder = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// gregMonthsStartingJan: Number of days in gregorian months starting with January (index 1)
const gregMonthsStartingJan = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ethMonths: Number of days in ethiopian months starting with January (index 1)
const ethMonths = [0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5, 30, 30, 30, 30];

// ethOrder: Ethiopian months ordered according to Gregorian
const ethOrder = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];

/**
 * Calculates start day of Ethiopian year in Gregorian calendar.
 * Matches startDayOfEc(year) in conversion.go
 */
export function startDayOfEc(year: number): number {
  const newYearDay = Math.floor(year / 100) - Math.floor(year / 400) - 4;
  if ((year - 1) % 4 === 3) {
    return Math.floor(newYearDay) + 1;
  }
  return Math.floor(newYearDay);
}

/**
 * Converts a given date in Ethiopian calendar to Gregorian calendar.
 * Direct implementation of ToGregorian in lgirma/ethiopian-calendar/conversion.go
 */
export function ToGregorian(ecDate: DateStruct): DateStruct {
  const gregorianMonths = [...gregMonthsStartingSept];
  const newYearDay = startDayOfEc(ecDate.year);
  let gregorianYear = ecDate.year + 7;

  const nextYear = gregorianYear + 1;
  if ((nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0) {
    gregorianMonths[6] = 29;
  }

  // calculate number of days up to that date
  let until = (ecDate.month - 1) * 30 + ecDate.day;
  if (until <= 37 && ecDate.year <= 1575) {
    until += 28;
    gregorianMonths[0] = 31;
  } else {
    until += newYearDay - 1;
  }

  // calculate month and date incrementally
  let m = 0;
  let gregorianDate = 0;
  for (let i = 0; i < gregorianMonths.length; i++) {
    if (until <= gregorianMonths[i]) {
      m = i;
      gregorianDate = until;
      break;
    } else {
      m = i;
      until -= gregorianMonths[i];
    }
  }

  // if m > 4, we're already on next Gregorian year
  if (m > 4) {
    gregorianYear += 1;
  }

  return {
    day: gregorianDate,
    month: gregOrder[m],
    year: gregorianYear,
  };
}

/**
 * Converts a given date in Gregorian calendar to Ethiopian calendar.
 * Direct implementation of ToEthiopian in lgirma/ethiopian-calendar/conversion.go
 */
export function ToEthiopian(gcDate: DateStruct): DateStruct {
  // dates between 5 and 14 of October 1582 are invalid
  if (gcDate.month === 10 && gcDate.day >= 5 && gcDate.day <= 14 && gcDate.year === 1582) {
    return { year: 0, month: 0, day: 0 };
  }

  const gregorianMonths = [...gregMonthsStartingJan];
  const ethiopianMonths = [...ethMonths];

  if ((gcDate.year % 4 === 0 && gcDate.year % 100 !== 0) || gcDate.year % 400 === 0) {
    gregorianMonths[2] = 29;
  }

  let ethYear = gcDate.year - 8;
  if (ethYear % 4 === 3) {
    ethiopianMonths[10] = 6;
  }

  // Ethiopian new year in Gregorian calendar
  const newYearDay = startDayOfEc(gcDate.year - 8);

  // calculate number of days up to that date
  let until = 0;
  for (let i = 1; i < gcDate.month; i++) {
    until += gregorianMonths[i];
  }
  until += gcDate.day;

  // update Tahissas (December) to match January 1st
  let tahisas = 25;
  if (ethYear % 4 === 0) {
    tahisas = 26;
  }

  // take into account the 1582 change
  if (gcDate.year < 1582) {
    ethiopianMonths[1] = 0;
    ethiopianMonths[2] = tahisas;
  } else if (until <= 277 && gcDate.year === 1582) {
    ethiopianMonths[1] = 0;
    ethiopianMonths[2] = tahisas;
  } else {
    tahisas = newYearDay - 3;
    ethiopianMonths[1] = tahisas;
  }

  // calculate month and date incrementally
  let m = 0;
  let ethDate = 0;

  for (let i = 1; i < ethiopianMonths.length; i++) {
    m = i;
    if (until <= ethiopianMonths[m]) {
      ethDate = until;
      if (m === 1 || ethiopianMonths[m] === 0) {
        ethDate = until + 30 - tahisas;
      }
      break;
    } else {
      until -= ethiopianMonths[m];
    }
  }

  // if m > 10, we're already on next Ethiopian year
  if (m > 10) {
    ethYear += 1;
  }

  return {
    day: ethDate,
    month: ethOrder[m],
    year: ethYear,
  };
}

// ==========================================
// 5. BAHIRE HASAB (From utils.go & feasts.go)
// ==========================================

export function GetEvangelist(year: number): number {
  const aa = 5500 + year;
  const result = aa % 4;
  if (result === 0) {
    return EVANGELIST_JOHN;
  }
  return result;
}

export function GetRabit(year: number): number {
  const aa = 5500 + year;
  return Math.floor(aa / 4);
}

export function GetWenber(year: number): number {
  const aa = 5500 + year;
  if (aa % 19 === 0) {
    return 18;
  }
  return (aa % 19) - 1;
}

export function GetMeTq(year: number): number {
  return (GetWenber(year) * 19) % 30;
}

export function GetMebacha(year: number): number {
  const aa = 5500 + year;
  const rem = (aa + GetRabit(year)) % 7;
  return rem + 1;
}

export function GetMebajaHamer(year: number): DayOfYear {
  const mebacha = GetMebacha(year);
  const meTq = GetMeTq(year);

  let meTqMonth = MONTH_MESKEREM;
  if (meTq >= 2 && meTq <= 14) {
    meTqMonth = MONTH_TIKIMT;
  }

  let meTqDay = ((meTqMonth - 1) * 30 + mebacha + meTq - 1) % 7;
  if (meTqDay === 0) {
    meTqDay = 7;
  }

  const tewsakTable = [0, 6, 5, 4, 3, 2, 8, 7];
  const meTqAndDayTewsak = meTq + tewsakTable[meTqDay];
  let month = meTqMonth;
  if (meTqAndDayTewsak > 30) {
    month += 1;
  }

  return {
    month,
    day: meTqAndDayTewsak % 30,
  };
}

export function GetNineveh(year: number): DayOfYear {
  const mebajaHamer = GetMebajaHamer(year);
  return NewDay(mebajaHamer.month + 4, mebajaHamer.day);
}

export const GetNenewe = GetNineveh;

export function GetFeastFromNineveh(feast: number, nineveh: DayOfYear): DayOfYear {
  const day = nineveh.day + feast;
  const result: DayOfYear = {
    month: nineveh.month,
    day: day % 30,
  };
  if (day % 30 === 0) {
    result.day = 30;
    result.month += Math.floor(day / 30) - 1;
  } else {
    result.month += Math.floor(day / 30);
  }
  return result;
}

export function GetFeast(feast: number, year: number): DayOfYear {
  return GetFeastFromNineveh(feast, GetNineveh(year));
}

// ==========================================
// 6. PORTAL ADAPTERS & FORMATTERS
// ==========================================

/**
 * Converts any Gregorian Date object, ISO string ('YYYY-MM-DD'), or timestamp
 * to a full EthiopianDate object with localized month names.
 */
export function toEthiopian(inputDate: Date | string | number | null | undefined): EthiopianDate {
  let gYear = 0;
  let gMonth = 0;
  let gDay = 0;

  if (!inputDate) {
    const now = new Date();
    gYear = now.getFullYear();
    gMonth = now.getMonth() + 1;
    gDay = now.getDate();
  } else if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    const parts = inputDate.split('-').map(Number);
    gYear = parts[0];
    gMonth = parts[1];
    gDay = parts[2];
  } else {
    const d = new Date(inputDate);
    if (isNaN(d.getTime())) {
      const now = new Date();
      gYear = now.getFullYear();
      gMonth = now.getMonth() + 1;
      gDay = now.getDate();
    } else {
      gYear = d.getFullYear();
      gMonth = d.getMonth() + 1;
      gDay = d.getDate();
    }
  }

  const ec = ToEthiopian({ year: gYear, month: gMonth, day: gDay });
  const monthNameAm = MONTH_NAMES[ec.month] || '';
  const monthNameEn = ETHIOPIAN_MONTHS_EN[ec.month] || '';

  return {
    year: ec.year,
    month: ec.month,
    day: ec.day,
    monthNameAm,
    monthNameEn,
  };
}

export const toEthiopianDate = toEthiopian;

/**
 * Converts an Ethiopian date to Gregorian ISO string 'YYYY-MM-DD'
 */
export function ethiopianToGregorianIso(year: number, month: number, day: number): string {
  const g = ToGregorian({ year, month, day });
  const mm = String(g.month).padStart(2, '0');
  const dd = String(g.day).padStart(2, '0');
  return `${g.year}-${mm}-${dd}`;
}

export const toGregorian = ToGregorian;

/**
 * Format date into Ethiopian calendar representation
 * @example
 * formatEthiopianDate('2026-11-08', 'am') => "ጥቅምት 29, 2019 ዓ.ም"
 * formatEthiopianDate('2026-11-08', 'en') => "Tikimt 29, 2019 E.C."
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
 * Format date and time into Ethiopian representation with local time
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
