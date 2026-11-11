import jsPDFPkg from 'jspdf';
import QRCode from 'qrcode';
import { computeSha256 } from './hashUtil.js';

const JsPDFConstructor = jsPDFPkg?.jsPDF || jsPDFPkg?.default || jsPDFPkg;

/**
 * Renders QR Code deterministically using pure vector rectangles (bit-for-bit identical across Node.js & Browsers).
 */
function drawDeterministicQR(doc, text, x, y, sizeMm) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const count = qr.modules.size;
  const paddingModules = 1;
  const totalModules = count + paddingModules * 2;
  const cellSize = sizeMm / totalModules;

  // White backing plate
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, sizeMm, sizeMm, 'F');

  // Dark Slate modules
  doc.setFillColor(15, 23, 42);
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules.get(row, col)) {
        doc.rect(
          x + (col + paddingModules) * cellSize,
          y + (row + paddingModules) * cellSize,
          cellSize + 0.02,
          cellSize + 0.02,
          'F'
        );
      }
    }
  }
}

/**
 * Computes deterministic pre-hash Academic Anchor so the generated PDF and QR payload
 * remain bit-for-bit invariant when computing H_cert = SHA-256(B) (Paper Eq. 1).
 */
export function computeDeterministicAnchor(cred) {
  const canonical = JSON.stringify({
    tokenId: String(cred.tokenId ?? '1'),
    studentWallet: String(cred.studentWallet || '').toLowerCase(),
    studentName: String(cred.studentName || ''),
    studentIdNumber: String(cred.studentIdNumber || ''),
    degreeName: String(cred.degreeName || ''),
    majorSpecialization: String(cred.majorSpecialization || ''),
    cgpa: String(cred.cgpa || ''),
    graduationDate: Number(cred.graduationDate) || 1775174400,
    institutionName:
      cred.institutionName || 'Sri Siddhartha Institute of Technology (SSAHE), Tumakuru',
    issuedByRegistrar: String(
      cred.issuedByRegistrar || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    ).toLowerCase(),
  });
  return computeSha256(canonical);
}

/**
 * Builds deterministic jsPDF instance from credential metadata.
 * Sets fixed CreationDate and deterministic FileID to guarantee exact SHA-256(B) reproducibility.
 */
function buildCertificateDoc(cred, options = {}) {
  const gradEpoch = Number(cred.graduationDate) || 1775174400;
  const tokenIdStr = String(cred.tokenId ?? '1');
  const instName =
    cred.institutionName || 'Sri Siddhartha Institute of Technology (SSAHE), Tumakuru';
  const registrarAddr =
    cred.issuedByRegistrar || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const anchorDigest = computeDeterministicAnchor(cred);

  const doc = new JsPDFConstructor({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Deterministic UTC PDF CreationDate + FileID for cross-timezone byte-level SHA-256(B) invariance
  const dt = new Date(gradEpoch * 1000);
  const pad2 = (n) => String(n).padStart(2, '0');
  const utcDateStr = `D:${dt.getUTCFullYear()}${pad2(dt.getUTCMonth() + 1)}${pad2(
    dt.getUTCDate()
  )}${pad2(dt.getUTCHours())}${pad2(dt.getUTCMinutes())}${pad2(dt.getUTCSeconds())}+00'00'`;
  doc.setCreationDate(utcDateStr);
  doc.setFileId(anchorDigest.replace('0x', '').substring(0, 32));

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // Verification QR URL pointing to token + soul wallet + metadata anchor
  const verifyUrl = `https://verify.ssit-ssahe.edu.in/?verifyToken=${tokenIdStr}&wallet=${encodeURIComponent(
    cred.studentWallet || ''
  )}&anchor=${anchorDigest}`;

  // Background Parchment Fill
  doc.setFillColor(254, 252, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Multi-layered Academic Senate Borders
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(1.8);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.8);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.4);
  doc.rect(14.5, 14.5, pageWidth - 29, pageHeight - 29);

  // University Header
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(instName.toUpperCase(), pageWidth / 2, 31, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Sri Siddhartha Academy of Higher Education, Tumakuru • Academic Senate & EIP-5192 Registry',
    pageWidth / 2,
    37.5,
    { align: 'center' }
  );

  // Diploma Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text('SOULBOUND ACADEMIC DIPLOMA & CREDENTIAL (EIP-5192)', pageWidth / 2, 51, {
    align: 'center',
  });

  // Body Text
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text(
    'This is to officially certify that having fulfilled all prescribed academic requirements, the Senate confers upon',
    pageWidth / 2,
    62,
    { align: 'center' }
  );

  // Student Name
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(cred.studentName || 'Student Name', pageWidth / 2, 77, { align: 'center' });

  // Roll Number & Bound Soul Wallet
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Roll No: ${cred.studentIdNumber || 'N/A'}  •  Bound Soul Wallet: ${cred.studentWallet || '0x...'}`,
    pageWidth / 2,
    84,
    { align: 'center' }
  );

  // Degree
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text('the degree of', pageWidth / 2, 94, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(30, 41, 59);
  doc.text(cred.degreeName || 'Master of Technology (M.Tech)', pageWidth / 2, 105, {
    align: 'center',
  });

  // Specialization & CGPA
  doc.setFont('times', 'italic');
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Specialization in ${cred.majorSpecialization || 'Computer Science and Engineering'}`,
    pageWidth / 2,
    114,
    { align: 'center' }
  );

  const displayedCgpa = options.tamperedCgpa || cred.cgpa || '9.84 / 10.0';
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87);
  doc.text(`Cumulative GPA: ${displayedCgpa}`, pageWidth / 2, 122, { align: 'center' });

  // Cryptographic Proof Watermark Footer
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `EIP-5192 Token ID: #${tokenIdStr} | Non-Transferable Soulbound Asset | Graduation Epoch: ${gradEpoch}`,
    20,
    140
  );
  doc.text(`Registrar Public Authority (K_univ): ${registrarAddr}`, 20, 145);
  doc.text(`Deterministic Academic Record Anchor: ${anchorDigest}`, 20, 150);

  // Signatures & Deterministic Vector QR Seal
  const sigY = 175;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(30, sigY, 95, sigY);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('University Registrar', 62.5, sigY + 5, { align: 'center' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Signer: ${registrarAddr.substring(0, 16)}...`, 62.5, sigY + 9, {
    align: 'center',
  });

  // Central Vector QR Code Seal
  drawDeterministicQR(doc, verifyUrl, pageWidth / 2 - 15, sigY - 21, 30);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan for 1-Click 0-Gas Verification', pageWidth / 2, sigY + 13, {
    align: 'center',
  });

  // Dean Line
  doc.line(pageWidth - 95, sigY, pageWidth - 30, sigY);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Dean of Academic Affairs', pageWidth - 62.5, sigY + 5, { align: 'center' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Dual Multi-Sig Verified', pageWidth - 62.5, sigY + 9, { align: 'center' });

  return doc;
}

/**
 * Generates a deterministic official Academic Certificate PDF and computes H_cert = SHA-256(B) (Paper Eq. 1).
 * @param {Object} cred Academic Credential object
 * @returns {Promise<{ blob: Blob, dataUrl: string, hash: string, pdfDoc: jsPDF }>}
 */
export async function generateCertificatePDF(cred) {
  const doc = buildCertificateDoc(cred);
  const pdfBuffer = doc.output('arraybuffer');
  const hash = computeSha256(pdfBuffer);
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const dataUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(blob) : '';

  return {
    blob,
    dataUrl,
    hash,
    pdfDoc: doc,
  };
}

/**
 * Generates an intentionally tampered/forged copy of a credential PDF (alters CGPA)
 * for demonstrating deterministic SHA-256 forgery rejection on Employer Verification Portal.
 */
export async function generateTamperedCertificatePDF(cred) {
  const doc = buildCertificateDoc(cred, {
    tamperedCgpa: '10.00 / 10.0 (FORGED ALTERATION)',
  });
  const pdfBuffer = doc.output('arraybuffer');
  const hash = computeSha256(pdfBuffer);
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  return { blob, hash, pdfDoc: doc };
}
