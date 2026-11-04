import {
  Report,
  CreateReportInput,
  FilterOptions,
  ReportStatus,
  CorruptionType,
  DecisionLog,
} from '../types';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'nsl_corruption_reports';
const RATE_LIMIT_KEY = 'nsl_last_submission_time';
const RATE_LIMIT_MS = 60 * 1000; // 1 minute

// Sample SVG data URLs for realistic mock evidence files
const SAMPLE_RECEIPT_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230b1f3a">የክፍያ ደረሰኝ ቅጂ / Payment Receipt Proof</text><line x1="20" y1="55" x2="380" y2="55" stroke="%23cbd5e1" stroke-width="2"/><text x="20" y="85" font-family="sans-serif" font-size="14" fill="%23334155">Official Fee: 250 ETB</text><text x="20" y="115" font-family="sans-serif" font-size="14" fill="%23dc2626" font-weight="bold">Unrecorded Cash Demanded: 15,000 ETB</text><text x="20" y="145" font-family="sans-serif" font-size="12" fill="%2364748b">Location: Woreda 03 Service Desk</text><rect x="20" y="170" width="160" height="70" fill="%23e2e8f0" rx="4"/><text x="30" y="210" font-family="sans-serif" font-size="12" fill="%23475569">[Official Stamp Seal]</text></svg>';

const SAMPLE_DOCUMENT_PDF =
  'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY5IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxODMKJSVFT0YK';

// Generates an ISO date offset by days
const getPastDateISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SEED_REPORTS: Report[] = [
  {
    id: 'NSL-2026-0012',
    type: 'bribery',
    office: 'የመሬት ልማትና አስተዳደር ጽ/ቤት (Land Administration)',
    personInvolved: 'አቶ ኃይሌ ወ/ማርያም (የሰነድ ማረጋገጫ ኃላፊ)',
    incidentDate: getPastDateStr(2),
    location: 'ወረዳ 09፣ ላፍቶ ሸጎሌ አደባባይ አካባቢ',
    description:
      'ለይዞታ ማረጋገጫ ካርታ ስም ዝውውር መደበኛውን ክፍያ ከፍዬ ሳበቃ፣ ጉዳዩን ለማስፈጸም ተጨማሪ 50,000 ብር በካሽ ካልተከፈለ ፋይሉ እንደማይጸድቅና እንደሚጓተት ገልጸው አስገደዱኝ።',
    isAnonymous: false,
    reporterName: 'ዮናስ ታደሰ',
    reporterPhone: '0911234567',
    evidence: [
      {
        id: 'ev-1',
        name: 'cash_demand_note.svg',
        type: 'image/svg+xml',
        size: 24500,
        dataUrl: SAMPLE_RECEIPT_IMG,
      },
    ],
    status: 'new',
    urgent: true,
    adminNotes: '',
    seen: false,
    createdAt: getPastDateISO(2),
    log: [
      {
        id: 'log-1',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(2),
        note: 'Report submitted via public portal.',
      },
    ],
  },
  {
    id: 'NSL-2026-0011',
    type: 'illegal_land_housing',
    office: 'የኮንስትራክሽን ፈቃድና ቁጥጥር ቢሮ (Construction & Housing)',
    personInvolved: 'የቁጥጥር ቡድን መሪ',
    incidentDate: getPastDateStr(4),
    location: 'ወረዳ 10፣ ለቡ መብራት ኃይል አካባቢ',
    description:
      'በሕዝብ ይዞታ እና አረንጓዴ ስፍራ ላይ በህገ-ወጥ መንገድ ለግል ባለሀብት የተላለፈ የመሬት ይዞታ ያለ ምንም የግንባታ ፈቃድ ፎቅ እየተገነባበት ይገኛል። የመስክ ተቆጣጣሪዎች አይተው እንዳላዩ ሆነው ያልፋሉ።',
    isAnonymous: true,
    evidence: [
      {
        id: 'ev-2',
        name: 'illegal_construction_photo.svg',
        type: 'image/svg+xml',
        size: 42100,
        dataUrl: SAMPLE_RECEIPT_IMG,
      },
      {
        id: 'ev-3',
        name: 'fake_permit_copy.pdf',
        type: 'application/pdf',
        size: 15400,
        dataUrl: SAMPLE_DOCUMENT_PDF,
      },
    ],
    status: 'under_review',
    urgent: false,
    adminNotes: 'የመስክ ተቆጣጣሪ ቡድን ተመድቦ ቦታውን እንዲያጣራ ትዕዛዝ ተሰጥቷል።',
    seen: true,
    createdAt: getPastDateISO(4),
    log: [
      {
        id: 'log-2',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(4),
      },
      {
        id: 'log-3',
        action: 'marked_seen',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(3),
      },
      {
        id: 'log-4',
        action: 'status_change',
        fromStatus: 'new',
        toStatus: 'under_review',
        note: 'መረጃው የመጀመሪያ ግምገማ እንዲደረግበት ወደ ኮሚቴው ተመርቷል።',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(3),
      },
    ],
  },
  {
    id: 'NSL-2026-0010',
    type: 'fake_documents',
    office: 'የወሳኝ ኩነት ምዝገባና መታወቂያ አገልግሎት (Vital Events & ID)',
    personInvolved: 'የቀበሌ የኮምፒውተር ኦፕሬተር',
    incidentDate: getPastDateStr(15),
    location: 'ወረዳ 01፣ ሳሪስ ቶታል አካባቢ',
    description:
      'በአካባቢው ላልኖሩና መኖሪያቸው እዚህ ላልሆነ ሰዎች በገንዘብ ክፍያ ህገ-ወጥ የነዋሪነት መታወቂያ እና የልደት ምስክር ወረቀት ያለምንም የቤተሰብ ሰነድ ሲታደል ተመልክቻለሁ።',
    isAnonymous: true,
    evidence: [],
    status: 'new', // Still new after 15 days -> Needs attention!
    urgent: true,
    adminNotes: '',
    seen: false,
    createdAt: getPastDateISO(15),
    log: [
      {
        id: 'log-5',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(15),
      },
    ],
  },
  {
    id: 'NSL-2026-0009',
    type: 'embezzlement',
    office: 'የፋይናንስና ኢኮኖሚ ልማት ጽ/ቤት (Procurement & Finance)',
    personInvolved: 'የግዢና ፋይናንስ ቡድን',
    incidentDate: getPastDateStr(8),
    location: 'ወረዳ 02፣ ጎተራ ዋና አስተዳደር ህንፃ',
    description:
      'ለክፍለ ከተማው ጽሕፈት ቤቶች የቢሮ ዕቃዎችና ኮምፒውተሮች ግዢ በሚል የወጣው ጨረታ ከገበያ ዋጋ በሶስት እጥፍ የተጋነነ ዋጋ ላቀረበ የአንድ ኃላፊ ወዳጅ ድርጅት ያለምንም እውነተኛ ውድድር እንዲሰጥ ተደርጓል።',
    isAnonymous: false,
    reporterName: 'ደጀኔ በቀለ',
    reporterPhone: '0922884411',
    evidence: [
      {
        id: 'ev-4',
        name: 'procurement_inflation_audit.pdf',
        type: 'application/pdf',
        size: 45000,
        dataUrl: SAMPLE_DOCUMENT_PDF,
      },
    ],
    status: 'investigating',
    urgent: true,
    adminNotes: 'የግዢ ሰነዶቹ ከፋይናንስ ተጠርተው ኦዲት እየተደረጉ ነው።',
    seen: true,
    createdAt: getPastDateISO(8),
    log: [
      {
        id: 'log-7',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(8),
      },
      {
        id: 'log-8',
        action: 'status_change',
        fromStatus: 'under_review',
        toStatus: 'investigating',
        note: 'የግዢ ሂደቱ እንዲቆም ትዕዛዝ ተላልፏል።',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(7),
      },
    ],
  },
  {
    id: 'NSL-2026-0008',
    type: 'abuse_of_power',
    office: 'የደንብ ማስከበር አገልግሎት ጽ/ቤት (Code Enforcement)',
    personInvolved: 'የደንብ አስከባሪ ተቆጣጣሪ',
    incidentDate: getPastDateStr(10),
    location: 'ወረዳ 06፣ መካኒሳ ጀርመን አደባባይ',
    description:
      'በህጋዊ ንግድ ፈቃድ ሱቅ የከፈቱ ነጋዴዎችን እቃ በመንገድ ላይ አውጥታችኋል በሚል ምክንያት ያለደረሰኝ በየሳምንቱ 2,000 ብር ካልሰጣችሁ እቃችሁን እንወርሳለን እያሉ ማስፈራሪያ ያደርሳሉ።',
    isAnonymous: true,
    evidence: [],
    status: 'resolved',
    urgent: false,
    adminNotes: 'ጥፋተኛው የደንብ አስከባሪ ከስራው ታግዶ በዲስፕሊን ኮሚቴና በፀረ-ሙስና ክስ እንዲመሰረትበት ተደርጓል።',
    seen: true,
    createdAt: getPastDateISO(10),
    log: [
      {
        id: 'log-9',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(10),
      },
      {
        id: 'log-10',
        action: 'status_change',
        fromStatus: 'investigating',
        toStatus: 'resolved',
        note: 'ውሳኔ ተሰጥቶ እርምጃ ተወስዷል።',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(3),
      },
    ],
  },
  {
    id: 'NSL-2026-0007',
    type: 'favoritism',
    office: 'የህዝብ አገልግሎትና የሰው ሀብት ልማት ጽ/ቤት (Civil Service & HR)',
    personInvolved: 'የሰው ኃይል ልማት ዳይሬክተር',
    incidentDate: getPastDateStr(12),
    location: 'ወረዳ 08፣ ጀሞ 1 ኮንዶሚኒየም አስተዳደር',
    description:
      'ለውስጥ የሥራ እድገት የወጣ ፈተና ላይ ከፍተኛ ውጤት ያመጡ ሰራተኞችን ወደ ጎን በመተው፣ ምንም የስራ ልምድ ለሌላቸው የቅርብ ቤተሰብ አባላት የቦታውን ሹመት ሰጥተዋል።',
    isAnonymous: false,
    reporterName: 'ታሪኩ አሰፋ',
    reporterPhone: '0912334455',
    evidence: [
      {
        id: 'ev-5',
        name: 'exam_results_manipulation.pdf',
        type: 'application/pdf',
        size: 19800,
        dataUrl: SAMPLE_DOCUMENT_PDF,
      },
    ],
    status: 'under_review', // Under review for 12 days -> Needs attention!
    urgent: true,
    adminNotes: 'የፈተና ወረቀቶች እና የቅጥር ቃለ-ጉባኤዎች እየተመረመሩ ነው።',
    seen: true,
    createdAt: getPastDateISO(12),
    log: [
      {
        id: 'log-11',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(12),
      },
    ],
  },
  {
    id: 'NSL-2026-0006',
    type: 'bribery',
    office: 'የንግድና ገበያ ልማት ጽ/ቤት (Trade & Licensing)',
    personInvolved: 'የፍተሻ ባለሙያ',
    incidentDate: getPastDateStr(14),
    location: 'ወረዳ 04፣ ቄራ ወሰን አካባቢ',
    description:
      'የንግድ ፈቃድ ለማደስ የመስክ ፍተሻ የሚያደርገው ባለሙያ ያለምንም ምክንያት የንግድ ቦታውን ብቁ አይደለም በማለት 20,000 ብር በግል የባንክ ሂሳቡ እንዲገባ ጠይቆኛል።',
    isAnonymous: false,
    reporterName: 'ሰለሞን ገብሬ',
    reporterPhone: '0933990011',
    evidence: [
      {
        id: 'ev-6',
        name: 'bank_transfer_request.svg',
        type: 'image/svg+xml',
        size: 32000,
        dataUrl: SAMPLE_RECEIPT_IMG,
      },
    ],
    status: 'resolved',
    urgent: false,
    adminNotes: 'የባንክ ዝውውር መረጃው ተጣርቶ ግለሰቡ ለህግ ቀርቧል።',
    seen: true,
    createdAt: getPastDateISO(14),
    log: [
      {
        id: 'log-12',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(14),
      },
      {
        id: 'log-13',
        action: 'status_change',
        fromStatus: 'investigating',
        toStatus: 'resolved',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(2),
      },
    ],
  },
  {
    id: 'NSL-2026-0005',
    type: 'illegal_land_housing',
    office: 'የቤቶች አስተዳደርና ልማት ኤጀንሲ (Housing Agency)',
    personInvolved: 'የኮንዶሚኒየም ማስተላለፍ ኃላፊ',
    incidentDate: getPastDateStr(17),
    location: 'ወረዳ 11፣ ኃይሌ ጋርመንት ኮንዶሚኒየም ሳይት',
    description:
      'በእጣ ስማቸው ላልወጣ እና ምንም ቁጠባ ላልቆጠቡ ሰዎች በህገ-ወጥ መንገድ የ2ኛ እና የ3ኛ ፎቅ ኮንዶሚኒየም ቤቶች ቁልፍ እየተሰጠ እንደተላለፈ ታውቋል።',
    isAnonymous: true,
    evidence: [],
    status: 'investigating',
    urgent: false,
    adminNotes: 'የእጣ አሸናፊዎች ዝርዝር እና የባንክ ቁጠባ ደብተሮች ከባንክ ጋር እየተጣሩ ነው።',
    seen: true,
    createdAt: getPastDateISO(17),
    log: [
      {
        id: 'log-14',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(17),
      },
    ],
  },
  {
    id: 'NSL-2026-0004',
    type: 'other',
    office: 'የትራፊክ ማኔጅመንትና ትራንስፖርት ቢሮ (Traffic Management)',
    personInvolved: 'የትራፊክ ተቆጣጣሪ',
    incidentDate: getPastDateStr(20),
    location: 'ወረዳ 02፣ ጎተራ ኢንተርቼንጅ መውጫ',
    description:
      'የጭነት መኪናዎችን ያለ አግባብ በማስቆም ህጋዊ ሰነድ እያላቸው ሆን ብለው በማጉላላት ገንዘብ እንዲከፈላቸው ያደርጋሉ።',
    isAnonymous: true,
    evidence: [],
    status: 'rejected',
    urgent: false,
    adminNotes: 'በቂ መለያ እና ማስረጃ ባለመኖሩ እና ክሱ ተጨባጭ ባለመሆኑ ውድቅ ተደርጓል።',
    seen: true,
    createdAt: getPastDateISO(20),
    log: [
      {
        id: 'log-15',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(20),
      },
      {
        id: 'log-16',
        action: 'status_change',
        fromStatus: 'new',
        toStatus: 'rejected',
        note: 'ተጨባጭ ማስረጃ አልተገኘም',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(15),
      },
    ],
  },
  {
    id: 'NSL-2026-0003',
    type: 'fake_documents',
    office: 'የግብርና ገቢዎች ቢሮ (Revenues & Tax Office)',
    personInvolved: 'የቀረጥ ገማች ባለሙያ',
    incidentDate: getPastDateStr(23),
    location: 'ወረዳ 05፣ ጦር ኃይሎች አካባቢ',
    description:
      'ለትላልቅ ድርጅቶች ዓመታዊ የግብር መጠንን በሀሰተኛ የሽያጭ ደረሰኞች በማስተካከል መንግስት ማግኘት የሚገባውን በሚሊዮን የሚቆጠር ገቢ አሳጥተዋል።',
    isAnonymous: false,
    reporterName: 'ምስጋናው ወርቁ',
    reporterPhone: '0944112233',
    evidence: [],
    status: 'under_review', // Under review for 23 days -> Needs attention!
    urgent: false,
    adminNotes: 'የግብር ሰነዶቹ ወደ ማዕከላዊ ኦዲት ተልከዋል።',
    seen: true,
    createdAt: getPastDateISO(23),
    log: [
      {
        id: 'log-17',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(23),
      },
    ],
  },
  {
    id: 'NSL-2026-0002',
    type: 'bribery',
    office: 'የጤና ጥበቃ ጽ/ቤት (Health Office)',
    personInvolved: 'የመድኃኒት ክፍል አስተባባሪ',
    incidentDate: getPastDateStr(26),
    location: 'ወረዳ 07፣ ላፍቶ ጤና ጣቢያ',
    description:
      'በነፃ ለህዝብ እንዲታደሉ ከመንግስት የተላኩ አስፈላጊ መድኃኒቶች በስውር ወደ ግል ፋርማሲዎች እንዲሸጡ ተደርጓል።',
    isAnonymous: true,
    evidence: [],
    status: 'resolved',
    urgent: false,
    adminNotes: 'መድኃኒቶቹ በቁጥጥር ስር ውለው ኃላፊው በህግ ጥላ ስር እንዲውል ተደርጓል።',
    seen: true,
    createdAt: getPastDateISO(26),
    log: [
      {
        id: 'log-18',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(26),
      },
      {
        id: 'log-19',
        action: 'status_change',
        fromStatus: 'investigating',
        toStatus: 'resolved',
        adminEmail: 'admin@nsl.gov.et',
        timestamp: getPastDateISO(10),
      },
    ],
  },
  {
    id: 'NSL-2026-0001',
    type: 'abuse_of_power',
    office: 'የወረዳ አስተዳደር ጽ/ቤት (Woreda Administration)',
    personInvolved: 'የወረዳው ዋና አስተዳዳሪ',
    incidentDate: getPastDateStr(28),
    location: 'ወረዳ 12፣ አስተዳደር ህንፃ',
    description:
      'የወረዳውን የመንግስት ተሽከርካሪዎች እና ነዳጅ ለግል የቤተሰብ ንግድ እቃ ማመላለሻነት ያለ ምንም ፍቃድ በማዋል የመንግስት ሀብት ያባክናሉ።',
    isAnonymous: true,
    evidence: [],
    status: 'rejected',
    urgent: false,
    adminNotes: 'ተሽከርካሪዎቹ በይፋዊ የስራ ተልዕኮ ላይ እንደነበሩ በሰነድ ተረጋግጧል።',
    seen: true,
    createdAt: getPastDateISO(28),
    log: [
      {
        id: 'log-20',
        action: 'created',
        adminEmail: 'system',
        timestamp: getPastDateISO(28),
      },
    ],
  },
];

// Initialize storage with seed data if empty, and ensure urgent property is defined
export const initializeReportsStorage = (): Report[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REPORTS));
      return INITIAL_SEED_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REPORTS));
      return INITIAL_SEED_REPORTS;
    }
    // Ensure every report has urgent initialized
    let needsResave = false;
    const sanitized = parsed.map((r: any) => {
      if (r.urgent === undefined) {
        needsResave = true;
        const matchingSeed = INITIAL_SEED_REPORTS.find((s) => s.id === r.id);
        return { ...r, urgent: matchingSeed?.urgent || false };
      }
      return r;
    });
    if (needsResave) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return INITIAL_SEED_REPORTS;
  }
};

export const reportService = {
  getReports: (filters?: FilterOptions): Report[] => {
    let reports = initializeReportsStorage();

    if (!filters) {
      return reports.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (filters.status && filters.status !== 'all') {
      reports = reports.filter((r) => r.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      reports = reports.filter((r) => r.type === filters.type);
    }

    if (filters.anonymousOnly) {
      reports = reports.filter((r) => r.isAnonymous);
    }

    if (filters.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      reports = reports.filter((r) => new Date(r.createdAt).getTime() >= fromTime);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      reports = reports.filter((r) => new Date(r.createdAt).getTime() <= toDate.getTime());
    }

    if (filters.search && filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      reports = reports.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.office.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query) ||
          (r.personInvolved && r.personInvolved.toLowerCase().includes(query)) ||
          (r.reporterName && r.reporterName.toLowerCase().includes(query))
      );
    }

    return reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getReportById: (id: string): Report | null => {
    const reports = initializeReportsStorage();
    return reports.find((r) => r.id === id) || null;
  },

  toggleUrgent: (id: string): Report | null => {
    const reports = initializeReportsStorage();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = reports[index];
    const newUrgent = !report.urgent;

    const updatedReport: Report = {
      ...report,
      urgent: newUrgent,
      log: [
        {
          id: `log-${Date.now()}`,
          action: 'status_change',
          adminEmail: 'admin@nsl.gov.et',
          timestamp: new Date().toISOString(),
          note: newUrgent ? 'Marked as urgent priority.' : 'Removed urgent priority flag.',
        },
        ...report.log,
      ],
    };

    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    // Sync urgent toggle to backend API
    apiClient.toggleUrgent(id).catch(() => {});

    return updatedReport;
  },

  submitReport: async (
    input: CreateReportInput
  ): Promise<{ success: boolean; report?: Report; error?: string }> => {
    // 1. Bot Honeypot validation
    if (input.honeypot && input.honeypot.trim() !== '') {
      return { success: false, error: 'errorBotDetected' };
    }

    // 2. Client-side rate limiting (1 minute between submissions)
    const lastSubTime = typeof localStorage !== 'undefined' ? localStorage.getItem(RATE_LIMIT_KEY) : null;
    const now = Date.now();
    if (lastSubTime) {
      const elapsed = now - parseInt(lastSubTime, 10);
      if (elapsed < RATE_LIMIT_MS) {
        return { success: false, error: 'rateLimitWarning' };
      }
    }

    // 3. Validation checks
    if (!input.type || !input.office || !input.office.trim() || !input.incidentDate || !input.location || !input.location.trim()) {
      return { success: false, error: 'errorRequiredField' };
    }
    const selectedDate = new Date(input.incidentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      return { success: false, error: 'errorFutureDate' };
    }
    if (!input.description || input.description.trim().length < 30) {
      return { success: false, error: 'errorDescTooShort' };
    }

    // Validate phone number format if provided
    if (!input.isAnonymous && input.reporterPhone && input.reporterPhone.trim()) {
      const cleanPhone = input.reporterPhone.replace(/[\s-]/g, '');
      const etPhoneRegex = /^(?:\+2519|09|\+2517|07)\d{8}$/;
      if (!etPhoneRegex.test(cleanPhone)) {
        return { success: false, error: 'errorInvalidPhone' };
      }
    }

    // 4. Submit to Backend API (Strict production persistence)
    try {
      const apiResult = await apiClient.submitReport(input);
      if (apiResult.success && apiResult.data) {
        if (typeof localStorage !== 'undefined') {
          const currentReports = initializeReportsStorage();
          localStorage.setItem(STORAGE_KEY, JSON.stringify([apiResult.data, ...currentReports]));
          localStorage.setItem(RATE_LIMIT_KEY, String(now));
        }
        return { success: true, report: apiResult.data };
      }

      if (apiResult.error) {
        return { success: false, error: apiResult.error };
      }
    } catch (err: any) {
      // In local development/test mode ONLY, allow offline mock creation if backend is offline
      const isDev =
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) ||
        (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');
      if (isDev) {
        console.warn('⚠️ [DEV ONLY] Backend unreachable. Generating local development mock report:', err.message);
        const currentReports = initializeReportsStorage();
        const newSeq = currentReports.length + 1;
        const newId = `NSL-2026-${String(newSeq).padStart(4, '0')}`;
        const newReport: Report = {
          id: newId,
          type: input.type,
          office: input.office.trim(),
          personInvolved: input.personInvolved?.trim() || undefined,
          incidentDate: input.incidentDate,
          location: input.location.trim(),
          description: input.description.trim(),
          isAnonymous: input.isAnonymous,
          reporterName: input.isAnonymous ? undefined : input.reporterName?.trim() || undefined,
          reporterPhone: input.isAnonymous ? undefined : input.reporterPhone?.trim() || undefined,
          evidence: input.evidence || [],
          status: 'new',
          urgent: false,
          adminNotes: '',
          seen: false,
          createdAt: new Date().toISOString(),
          log: [
            {
              id: `log-${Date.now()}`,
              action: 'created',
              adminEmail: 'system',
              timestamp: new Date().toISOString(),
              note: 'Report submitted via public portal.',
            },
          ],
        };

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([newReport, ...currentReports]));
          localStorage.setItem(RATE_LIMIT_KEY, String(now));
        }
        return { success: true, report: newReport };
      }

      // In PRODUCTION: NEVER silently fall back! Reject and report server failure!
      return {
        success: false,
        error: `Server communication failed: Could not persist report to backend database. (${err.message})`,
      };
    }

    return { success: false, error: 'Failed to record report on backend.' };
  },

  markAsSeen: (id: string): Report | null => {
    const reports = initializeReportsStorage();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = reports[index];
    if (report.seen) return report;

    const updatedReport: Report = {
      ...report,
      seen: true,
      log: [
        ...report.log,
        {
          id: `log-${Date.now()}`,
          action: 'marked_seen',
          adminEmail: 'admin@nsl.gov.et',
          timestamp: new Date().toISOString(),
          note: 'Report opened and marked as seen.',
        },
      ],
    };

    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    return updatedReport;
  },

  updateReportStatus: (
    id: string,
    newStatus: ReportStatus,
    note: string,
    adminEmail: string
  ): Report | null => {
    const reports = initializeReportsStorage();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = reports[index];
    const prevStatus = report.status;

    const newLogItem: DecisionLog = {
      id: `log-${Date.now()}`,
      action: 'status_change',
      fromStatus: prevStatus,
      toStatus: newStatus,
      note: note.trim() || undefined,
      adminEmail,
      timestamp: new Date().toISOString(),
    };

    const updatedReport: Report = {
      ...report,
      status: newStatus,
      adminNotes: note.trim() ? note.trim() : report.adminNotes,
      seen: true,
      log: [newLogItem, ...report.log],
    };

    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    // Sync status change to backend API
    apiClient.updateStatus(id, newStatus, note, adminEmail).catch(() => {});

    return updatedReport;
  },

  updateReportNotes: (
    id: string,
    notes: string,
    adminEmail: string
  ): Report | null => {
    const reports = initializeReportsStorage();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = reports[index];

    const newLogItem: DecisionLog = {
      id: `log-${Date.now()}`,
      action: 'note_added',
      note: notes.trim(),
      adminEmail,
      timestamp: new Date().toISOString(),
    };

    const updatedReport: Report = {
      ...report,
      adminNotes: notes.trim(),
      seen: true,
      log: [newLogItem, ...report.log],
    };

    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    // Sync notes change to backend API
    apiClient.updateNotes(id, notes, adminEmail).catch(() => {});

    return updatedReport;
  },

  getReportStats: (daysRange: 7 | 30 | 90 = 30) => {
    const reports = initializeReportsStorage();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;

    // Filter reports within the last 7 days for "this week" change calculation
    const thisWeekReports = reports.filter(
      (r) => new Date(r.createdAt).getTime() >= sevenDaysAgo
    );

    const counts = {
      total: reports.length,
      new: reports.filter((r) => r.status === 'new').length,
      underReview: reports.filter((r) => r.status === 'under_review').length,
      investigating: reports.filter((r) => r.status === 'investigating').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
      rejected: reports.filter((r) => r.status === 'rejected').length,
    };

    const thisWeek = {
      total: thisWeekReports.length,
      new: thisWeekReports.filter((r) => r.status === 'new').length,
      underReview: thisWeekReports.filter((r) => r.status === 'under_review').length,
      investigating: thisWeekReports.filter((r) => r.status === 'investigating').length,
      resolved: thisWeekReports.filter((r) => r.status === 'resolved').length,
      rejected: thisWeekReports.filter((r) => r.status === 'rejected').length,
    };

    // By status (Donut Chart)
    const byStatus = [
      { status: 'new', count: counts.new, color: '#F5B700' }, // Gold accent
      { status: 'under_review', count: counts.underReview, color: '#2563eb' }, // Blue
      { status: 'investigating', count: counts.investigating, color: '#0B1F3A' }, // Primary Navy
      { status: 'resolved', count: counts.resolved, color: '#10b981' }, // Emerald
      { status: 'rejected', count: counts.rejected, color: '#f43f5e' }, // Rose
    ].filter((item) => item.count > 0);

    // By corruption type (Bar Chart)
    const allTypes: CorruptionType[] = [
      'bribery',
      'abuse_of_power',
      'fake_documents',
      'embezzlement',
      'favoritism',
      'illegal_land_housing',
      'other',
    ];

    const byType = allTypes.map((type) => ({
      type,
      count: reports.filter((r) => r.type === type).length,
    }));

    // Over time with dynamic daysRange (7, 30, or 90 days)
    const daysMap: Record<string, number> = {};
    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      daysMap[dateKey] = 0;
    }

    reports.forEach((r) => {
      const dateKey = r.createdAt.split('T')[0];
      if (daysMap[dateKey] !== undefined) {
        daysMap[dateKey] += 1;
      }
    });

    const overTime = Object.entries(daysMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Top Reported Offices / Departments
    const officeCounts: Record<string, number> = {};
    reports.forEach((r) => {
      // Clean office label for grouping
      const key = r.office.split('(')[0].trim();
      officeCounts[key] = (officeCounts[key] || 0) + 1;
    });

    const topOffices = Object.entries(officeCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / (reports.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hotspots by Kebele / Woreda
    const kebeleCounts: Record<string, number> = {};
    reports.forEach((r) => {
      let area = 'ወረዳ 09 (Lafto)';
      if (r.location.includes('ወረዳ 01') || r.location.includes('ሳሪስ')) area = 'ወረዳ 01 (Saris)';
      else if (r.location.includes('ወረዳ 02') || r.location.includes('ጎተራ')) area = 'ወረዳ 02 (Gotera)';
      else if (r.location.includes('ወረዳ 04') || r.location.includes('ቄራ')) area = 'ወረዳ 04 (Kera)';
      else if (r.location.includes('ወረዳ 05') || r.location.includes('ጦር ኃይሎች')) area = 'ወረዳ 05 (Tor Hailoch)';
      else if (r.location.includes('ወረዳ 06') || r.location.includes('መካኒሳ')) area = 'ወረዳ 06 (Mekanisa)';
      else if (r.location.includes('ወረዳ 07')) area = 'ወረዳ 07 (Lafto Health)';
      else if (r.location.includes('ወረዳ 08') || r.location.includes('ጀሞ')) area = 'ወረዳ 08 (Jemo 1)';
      else if (r.location.includes('ወረዳ 09') || r.location.includes('ላፍቶ')) area = 'ወረዳ 09 (Lafto Square)';
      else if (r.location.includes('ወረዳ 10') || r.location.includes('ለቡ')) area = 'ወረዳ 10 (Lebu)';
      else if (r.location.includes('ወረዳ 11') || r.location.includes('ኃይሌ ጋርመንት')) area = 'ወረዳ 11 (Haile Garment)';
      else if (r.location.includes('ወረዳ 12')) area = 'ወረዳ 12 (Woreda Center)';
      kebeleCounts[area] = (kebeleCounts[area] || 0) + 1;
    });

    const byKebele = Object.entries(kebeleCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / (reports.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Urgent Reports Pinned
    const urgentReports = reports
      .filter((r) => r.urgent === true)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // "Needs Attention" List: reports still New or Under Review for more than 7 days, oldest first
    const needsAttentionReports = reports
      .filter(
        (r) =>
          (r.status === 'new' || r.status === 'under_review') &&
          now - new Date(r.createdAt).getTime() >= 7 * 86400000
      )
      .map((r) => {
        const daysWaiting = Math.floor((now - new Date(r.createdAt).getTime()) / 86400000);
        return {
          ...r,
          daysWaiting,
        };
      })
      .sort((a, b) => b.daysWaiting - a.daysWaiting); // Oldest first

    return {
      ...counts,
      thisWeek,
      byStatus,
      byType,
      overTime,
      topOffices,
      byKebele,
      urgentReports,
      needsAttentionReports,
    };
  },

  resetToSeedData: (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REPORTS));
  },

  syncWithBackend: async (): Promise<boolean> => {
    try {
      const serverReports = await apiClient.getReports();
      if (serverReports && serverReports.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverReports));
        return true;
      }
    } catch {
      // Backend not running or offline; continuing with local storage
    }
    return false;
  },
};
