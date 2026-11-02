import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for node:test environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Attach to globalThis before importing service
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: storageMock,
    writable: true,
  });
}

import { reportService, INITIAL_SEED_REPORTS } from './reportService';

test('reportService initializes with 12 seed reports', () => {
  localStorage.clear();
  const reports = reportService.getReports();
  assert.equal(reports.length, 12);
  assert.equal(reports[0].id, 'NSL-2026-0012');
});

test('reportService filters by status and corruption type', () => {
  const briberyReports = reportService.getReports({ type: 'bribery' });
  assert.ok(briberyReports.length > 0);
  briberyReports.forEach((r) => assert.equal(r.type, 'bribery'));

  const newReports = reportService.getReports({ status: 'new' });
  assert.ok(newReports.length > 0);
  newReports.forEach((r) => assert.equal(r.status, 'new'));
});

test('reportService search filter finds matching reports', () => {
  const results = reportService.getReports({ search: 'ላፍቶ' });
  assert.ok(results.length > 0);
  results.forEach((r) => {
    const match =
      r.location.includes('ላፍቶ') ||
      r.description.includes('ላፍቶ') ||
      r.office.includes('ላፍቶ');
    assert.ok(match);
  });
});

test('reportService enforces min 30 characters on description and validates honeypot', () => {
  // Test honeypot
  const botResult = reportService.submitReport({
    type: 'bribery',
    office: 'Land Management',
    incidentDate: '2026-10-25',
    location: 'Woreda 03',
    description: 'This is a sufficiently long description for testing purposes.',
    isAnonymous: true,
    evidence: [],
    honeypot: 'i-am-a-bot',
  });
  assert.equal(botResult.success, false);
  assert.equal(botResult.error, 'errorBotDetected');

  // Test short description
  const shortResult = reportService.submitReport({
    type: 'bribery',
    office: 'Land Management',
    incidentDate: '2026-10-25',
    location: 'Woreda 03',
    description: 'Too short',
    isAnonymous: true,
    evidence: [],
  });
  assert.equal(shortResult.success, false);
  assert.equal(shortResult.error, 'errorDescTooShort');
});

test('reportService successfully submits a report and updates stats', () => {
  // Clear rate limit for clean test run
  localStorage.removeItem('nsl_last_submission_time');

  const res = reportService.submitReport({
    type: 'bribery',
    office: 'Woreda 05 Trade Office',
    incidentDate: '2026-10-28',
    location: 'Woreda 05, Tor Hailoch',
    description:
      'Officer asked for 10,000 ETB bribe to process commercial trade license registration renewal.',
    isAnonymous: false,
    reporterName: 'Abebe Kebede',
    reporterPhone: '0911234567',
    evidence: [],
  });

  assert.equal(res.success, true);
  assert.ok(res.report);
  assert.equal(res.report?.status, 'new');
  assert.equal(res.report?.seen, false);

  const stats = reportService.getReportStats();
  assert.ok(stats.total >= 13);
  assert.ok(stats.new >= 2);
});

test('reportService updates status and appends decision log', () => {
  const reports = reportService.getReports();
  const target = reports[0];

  const updated = reportService.updateReportStatus(
    target.id,
    'investigating',
    'Assigned to field investigation team.',
    'admin@nsl.gov.et'
  );

  assert.ok(updated);
  assert.equal(updated?.status, 'investigating');
  assert.equal(updated?.seen, true);
  assert.ok(updated?.log.length > 0);
  assert.equal(updated?.log[0].action, 'status_change');
  assert.equal(updated?.log[0].toStatus, 'investigating');
  assert.equal(updated?.log[0].adminEmail, 'admin@nsl.gov.et');
});
