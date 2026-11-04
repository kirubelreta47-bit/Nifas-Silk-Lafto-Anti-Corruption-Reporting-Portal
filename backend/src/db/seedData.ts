import { Report, AdminUser } from '../types/index.js';

const SAMPLE_RECEIPT_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="20" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230b1f3a">የክፍያ ደረሰኝ ቅጂ / Payment Receipt Proof</text><line x1="20" y1="55" x2="380" y2="55" stroke="%23cbd5e1" stroke-width="2"/><text x="20" y="85" font-family="sans-serif" font-size="14" fill="%23334155">Official Fee: 250 ETB</text><text x="20" y="115" font-family="sans-serif" font-size="14" fill="%23dc2626" font-weight="bold">Unrecorded Cash Demanded: 15,000 ETB</text><text x="20" y="145" font-family="sans-serif" font-size="12" fill="%2364748b">Location: Woreda 03 Service Desk</text><rect x="20" y="170" width="160" height="70" fill="%23e2e8f0" rx="4"/><text x="30" y="210" font-family="sans-serif" font-size="12" fill="%23475569">[Official Stamp Seal]</text></svg>';

const SAMPLE_DOCUMENT_PDF =
  'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY5IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxODMKJSVFT0YK';

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

export const DEMO_ADMIN_USER: AdminUser = {
  id: 1,
  email: 'admin@nsl.gov.et',
  name: 'Alemayehu Tadesse',
  role: 'admin',
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
    status: 'new',
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
    status: 'under_review',
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
    status: 'under_review',
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

