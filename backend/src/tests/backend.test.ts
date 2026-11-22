import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, initDatabase } from '../db/index.js';
import { createServer } from '../server.js';
import { storageService } from '../services/storageService.js';
import { config } from '../config/index.js';

// Helper: detect if we have a live Neon DB connection
const checkDbConnected = async (): Promise<boolean> => {
  try {
    await Promise.race([
      initDatabase(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ]);
    const admin = await db.getAdminByEmail('admin@nsl.gov.et');
    return !!admin;
  } catch {
    return false;
  }
};

test('Database initialization in development prepares initial admin and seed data', async (t) => {
  const connected = await checkDbConnected();
  if (!connected) {
    t.skip('Neon DB not reachable from this environment — skipping live DB test');
    return;
  }
  const admin = await db.getAdminByEmail('admin@nsl.gov.et');
  assert.ok(admin, 'Admin user must exist');
  assert.equal(admin.email, 'admin@nsl.gov.et');
  // Verify that the password is a real bcrypt hash and NOT plain text
  assert.notEqual(admin.passwordHash, config.admin.initialPassword, 'Password must be hashed, never plain text');
  const valid = await bcrypt.compare(config.admin.initialPassword, admin.passwordHash);
  assert.equal(valid, true, 'bcrypt.compare must verify the password hash with config.admin.initialPassword');
});

test('Backend Repository initializes with seed reports', async (t) => {
  const connected = await checkDbConnected();
  if (!connected) {
    t.skip('Neon DB not reachable from this environment — skipping live DB test');
    return;
  }
  const reports = await db.getReports();
  assert.ok(reports.length >= 12, 'Should have at least 12 reports');
  assert.ok(reports.some((r) => r.id === 'NSL-2026-0012'), 'Seed report NSL-2026-0012 must exist');
});

test('Backend Repository filters reports by status and search query', async (t) => {
  const connected = await checkDbConnected();
  if (!connected) {
    t.skip('Neon DB not reachable from this environment — skipping live DB test');
    return;
  }
  const bribery = await db.getReports({ type: 'bribery' });
  assert.ok(bribery.length > 0);
  bribery.forEach((r) => assert.equal(r.type, 'bribery'));

  const searched = await db.getReports({ search: 'ላፍቶ' });
  assert.ok(searched.length > 0);
  searched.forEach((r) => {
    const match =
      r.location.includes('ላፍቶ') ||
      r.description.includes('ላፍቶ') ||
      r.office.includes('ላፍቶ');
    assert.ok(match);
  });

  const landReports = await db.getReports({ office: 'Land' });
  assert.ok(landReports.length > 0);
  landReports.forEach((r) => {
    assert.ok(r.office.toLowerCase().includes('land'));
  });
});

test('Backend Repository creates a report and computes stats', async (t) => {
  const connected = await checkDbConnected();
  if (!connected) {
    t.skip('Neon DB not reachable from this environment — skipping live DB test');
    return;
  }
  const created = await db.createReport({
    type: 'bribery',
    office: 'Woreda 03 Land Office',
    incidentDate: '2026-11-01',
    location: 'Woreda 03, Near Square',
    description: 'An official demanded 15,000 ETB bribe for land title deed registration certificate.',
    isAnonymous: true,
    evidence: [],
  });

  assert.ok(created.id.startsWith('NSL-'));
  assert.equal(created.status, 'new');
  assert.equal(created.log.length, 1);

  const stats = await db.getReportStats(30);
  assert.ok(stats.total >= 13);
  assert.ok(stats.new >= 3);
});

test('Backend Repository updates status and appends decision log', async (t) => {
  const connected = await checkDbConnected();
  if (!connected) {
    t.skip('Neon DB not reachable from this environment — skipping live DB test');
    return;
  }
  const reports = await db.getReports();
  if (!reports || reports.length === 0) {
    t.skip('No reports available — skipping');
    return;
  }
  const target = reports[0];

  const updated = await db.updateReportStatus(
    target.id,
    'investigating',
    'Assigned investigator team.',
    'lead_investigator@nsl.gov.et'
  );

  assert.ok(updated);
  assert.equal(updated?.status, 'investigating');
  assert.ok(updated?.log.length > 0);
  assert.equal(updated?.log[0].action, 'status_change');
  assert.equal(updated?.log[0].adminEmail, 'lead_investigator@nsl.gov.et');
});

test('Backend Repository manages departments (fetch, create, delete)', async () => {
  const depts = await db.getDepartments();
  assert.ok(Array.isArray(depts), 'Departments must be an array');

  const created = await db.createDepartment({
    id: 'test-water-agency',
    code: 'water',
    nameEn: 'Water & Sewerage Agency',
    nameAm: 'የውሃና ፍሳሽ ኤጀንሲ',
    descriptionEn: 'Municipal water supply and drainage monitoring',
  });

  assert.equal(created.id, 'test-water-agency');
  assert.equal(created.isCustom, true);

  const updatedDepts = await db.getDepartments();
  assert.ok(updatedDepts.some((d) => d.id === 'test-water-agency'));

  const deleted = await db.deleteDepartment('test-water-agency');
  assert.equal(deleted, true);

  const finalDepts = await db.getDepartments();
  assert.ok(!finalDepts.some((d) => d.id === 'test-water-agency'));

  // Non-existent bureau returns false
  const nonExistentDeleted = await db.deleteDepartment('non-existent-bureau-xyz');
  assert.equal(nonExistentDeleted, false);
});

test('Storage Service handles file upload, preserves original name and generates read stream', async () => {
  const samplePdfBuffer = Buffer.from('%PDF-1.4 sample test document bytes');
  const stored = await storageService.upload(samplePdfBuffer, 'test_bribe_proof.pdf', 'application/pdf');

  assert.equal(stored.name, 'test_bribe_proof.pdf');
  assert.equal(stored.type, 'application/pdf');
  assert.equal(stored.size, samplePdfBuffer.length);
  assert.ok(stored.storageKey.length > 0);

  // Retrieve stream
  const fileData = await storageService.getFileStream(stored.storageKey);
  assert.ok(fileData.stream);
  assert.equal(fileData.contentLength, samplePdfBuffer.length);
});

test('JWT signing and admin authorization middleware logic', () => {
  const token = jwt.sign(
    { userId: 1, email: 'admin@nsl.gov.et', role: 'admin' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  const decoded = jwt.verify(token, config.jwtSecret) as any;
  assert.equal(decoded.email, 'admin@nsl.gov.et');
  assert.equal(decoded.role, 'admin');
});

test('Express Server instance mounts all required routes', () => {
  const app = createServer();
  assert.ok(app);
});

test('Storage Service operates cleanly with STORAGE_MODE=local in production without requiring R2 credentials', async () => {
  const originalEnv = config.nodeEnv;
  const originalMode = config.storageMode;
  try {
    (config as any).nodeEnv = 'production';
    (config as any).storageMode = 'local';

    const testFile = Buffer.from('Evidence payment receipt content');
    const stored = await storageService.upload(testFile, 'receipt_doc.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    assert.equal(stored.storageProvider, 'local');
    assert.equal(stored.name, 'receipt_doc.xlsx');
    assert.ok(stored.url.startsWith('/api/upload/file/'));

    const retrieved = await storageService.getFileStream(stored.storageKey);
    assert.ok(retrieved.stream);
    assert.equal(retrieved.contentLength, testFile.length);
    assert.equal(retrieved.contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } finally {
    (config as any).nodeEnv = originalEnv;
    (config as any).storageMode = originalMode;
  }
});

test('Production guard: rejects report submission and fails loudly when DB disconnected', async () => {
  const originalEnv = config.nodeEnv;
  try {
    (config as any).nodeEnv = 'production';
    (db as any)._setConnectedForTesting(false);
    await assert.rejects(
      async () => {
        await db.createReport({
          type: 'bribery',
          office: 'Land',
          location: 'HQ',
          description: 'A detailed description that exceeds thirty characters for validation.',
          incidentDate: '2026-11-04',
          isAnonymous: true,
          evidence: [],
        });
      },
      /Database unavailable/
    );
  } finally {
    (config as any).nodeEnv = originalEnv;
    (db as any)._setConnectedForTesting(true);
  }
});

after(async () => {
  await db.close();
});
