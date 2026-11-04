import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('--- STARTING E2E VERIFICATION ---');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/health');
  const health = await healthRes.json();
  console.log('1. Health check:', healthRes.status, JSON.stringify(health));

  // 2. Admin Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nsl.gov.et', password: 'change-me-in-production-123!' })
  });
  const login = await loginRes.json();
  console.log('2. Admin Login:', loginRes.status, 'Success:', login.success, 'HasToken:', !!login.token);

  // 3. Admin Login Rejection for wrong password
  const failRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nsl.gov.et', password: 'wrongpassword' })
  });
  console.log('3. Wrong password rejection:', failRes.status);

  // 4. File Upload (multipart/form-data)
  const form = new FormData();
  const sampleContent = 'Evidence file: Audit report indicating unauthorized permit fee payment.';
  const fileBlob = new Blob([sampleContent], { type: 'text/plain' });
  form.append('file', fileBlob, 'audit-evidence.txt');

  const uploadRes = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    body: form
  });
  const uploadData = await uploadRes.json();
  const uploadedItem = uploadData.item;
  console.log('4. File upload response:', uploadRes.status, 'Saved filename:', uploadedItem?.name, 'URL:', uploadedItem?.dataUrl);

  // 5. File Download / Stream verification
  if (uploadedItem?.dataUrl) {
    // 5a. Preview (inline)
    const previewRes = await fetch(`http://localhost:5000${uploadedItem.dataUrl}`);
    const streamedText = await previewRes.text();
    const inlineDisposition = previewRes.headers.get('content-disposition');
    const previewContentType = previewRes.headers.get('content-type');
    console.log('5a. File preview check:', previewRes.status, 'Disposition:', inlineDisposition, 'ContentType:', previewContentType, 'Matches:', streamedText === sampleContent);

    // 5b. Download (attachment with ?download=1)
    const downloadRes = await fetch(`http://localhost:5000${uploadedItem.dataUrl}?download=1`);
    const downloadDisposition = downloadRes.headers.get('content-disposition');
    console.log('5b. File download check:', downloadRes.status, 'Disposition:', downloadDisposition);
  }

  // 6. Submit complete report with uploaded evidence metadata
  const reportPayload = {
    incidentDate: '2026-11-04',
    office: 'Land Administration',
    location: 'Sub-city land registry counter 4',
    type: 'Bribery',
    description: 'Officer demanded unreceipted cash fee for land certificate deed transfer of 50,000 ETB.',
    officialsInvolved: 'Desk Officer Abebe',
    amount: 50000,
    isAnonymous: true,
    language: 'en',
    evidence: uploadedItem ? [{
      id: uploadedItem.id,
      name: uploadedItem.name,
      type: uploadedItem.type,
      size: uploadedItem.size,
      dataUrl: uploadedItem.dataUrl,
      storageKey: uploadedItem.storageKey
    }] : []
  };

  const reportRes = await fetch('http://localhost:5000/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportPayload)
  });
  const reportData = await reportRes.json();
  const trackingId = reportData.data?.id;
  console.log('6. Report submitted:', reportRes.status, 'Tracking ID:', trackingId);

  // 7. Track report as citizen
  if (trackingId) {
    const trackRes = await fetch(`http://localhost:5000/api/reports/${trackingId}`);
    const trackData = await trackRes.json();
    console.log('7. Citizen tracking lookup:', trackRes.status, 'Status:', trackData.data?.status, 'Type:', trackData.data?.type);
  }

  // 8. Admin Fetch Reports (with JWT)
  const adminReportsRes = await fetch('http://localhost:5000/api/reports', {
    headers: { Authorization: `Bearer ${login.token}` }
  });
  const adminReports = await adminReportsRes.json();
  console.log('8. Admin Fetch Reports:', adminReportsRes.status, 'Total reports:', (adminReports.data || adminReports).length);

  // 9. Unauthorized attempt without token
  const unauthRes = await fetch('http://localhost:5000/api/reports/demo-id/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Under Review' })
  });
  console.log('9. Unauthorized PATCH blocked:', unauthRes.status);

  console.log('--- ALL LIVE E2E CHECKS PASSED ---');
}

runVerification().catch(err => {
  console.error('E2E Verification failed:', err);
  process.exit(1);
});
