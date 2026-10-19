export function formatISTDateTime(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';
}

export function formatISTDateOnly(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function generateVerificationHash(centreCode: string, mobile: string): string {
  const base = `${centreCode}-${mobile}-${Date.now().toString(36)}`;
  return 'UPSSSC-PET26-MOCK-' + base.toUpperCase().slice(-10);
}

/**
 * Creates a watermarked sample test capture image with GPS & timestamp overlay
 * when the user taps "Generate Sample Verification Photo" on desktop/mobile
 */
export function generateMockInspectionPhoto(
  title: string,
  centreCode: string,
  lat = 26.8467,
  lng = 80.9462
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient resembling educational campus / room interior
  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.5, '#334155');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Geometric blueprint/interior lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 800; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 600);
    ctx.stroke();
  }
  for (let j = 0; j < 600; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(800, j);
    ctx.stroke();
  }

  // Focal badge
  ctx.fillStyle = 'rgba(30, 58, 138, 0.85)';
  ctx.fillRect(80, 140, 640, 260);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 140, 640, 260);

  // Text title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UPSSSC PET 2026 - MOCK DAY INSPECTION', 400, 210);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
  ctx.fillText(title.toUpperCase(), 400, 260);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`EXAM CENTRE CODE: ${centreCode} | VERIFIED ON-SITE`, 400, 310);

  // Bottom Geotag Watermark banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
  ctx.fillRect(0, 480, 800, 120);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 15px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('● GEOTAG VERIFIED | UPSSSC COMMAND TELEMETRY', 24, 515);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '14px JetBrains Mono, monospace';
  ctx.fillText(`COORDINATES: LAT ${lat.toFixed(6)}° N, LONG ${lng.toFixed(6)}° E (±4.2m)`, 24, 545);
  ctx.fillText(`TIMESTAMP: ${formatISTDateTime()}`, 24, 575);

  // Return data URL
  return canvas.toDataURL('image/jpeg', 0.88);
}
