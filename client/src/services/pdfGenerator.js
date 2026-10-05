import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { computeSha256 } from './hashUtil';

/**
 * Generates an official high-resolution Academic Certificate PDF
 * @param {Object} cred Academic Credential object
 * @returns {Promise<{ blob: Blob, dataUrl: string, hash: string, pdfDoc: jsPDF }>}
 */
export async function generateCertificatePDF(cred) {
  // A4 Landscape Dimensions in mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // Generate Verification QR Code containing verifiable URL & SHA-256 hash
  const verifyUrl = `https://verify.academic-credentials.edu/verify?token=${cred.tokenId || '1'}&hash=${cred.certificateHash || ''}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  // Background Gradient / Parchment Fill
  doc.setFillColor(254, 252, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Multi-layered Border
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
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(cred.institutionName || 'NATIONAL INSTITUTE OF ADVANCED TECHNOLOGIES', pageWidth / 2, 32, {
    align: 'center',
  });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Established by Academic Senate & Decentralized Identity Registry • EIP-5192 Compliant', pageWidth / 2, 38, {
    align: 'center',
  });

  // Diploma Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text('SOULBOUND ACADEMIC DIPLOMA & CREDENTIAL', pageWidth / 2, 52, { align: 'center' });

  // Body Text
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('This is to officially certify that having satisfied all curriculum requirements, the Academic Senate hereby confers upon', pageWidth / 2, 63, {
    align: 'center',
  });

  // Student Name
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(cred.studentName || 'Student Name', pageWidth / 2, 78, { align: 'center' });

  // Roll Number & Wallet
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Roll No: ${cred.studentIdNumber || 'N/A'}  •  Bound Soul Wallet: ${cred.studentWallet || '0x...'}`, pageWidth / 2, 85, {
    align: 'center',
  });

  // Degree
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text('the degree of', pageWidth / 2, 95, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(cred.degreeName || 'Master of Technology', pageWidth / 2, 106, { align: 'center' });

  // Specialization & CGPA
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Specialization in ${cred.majorSpecialization || 'Artificial Intelligence & Machine Learning'}`, pageWidth / 2, 115, {
    align: 'center',
  });

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87);
  doc.text(`Cumulative GPA: ${cred.cgpa || '9.6 / 10.0'}`, pageWidth / 2, 123, { align: 'center' });

  // Verification & Security Watermark Footer
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`EIP-5192 Token ID: #${cred.tokenId || '1'} | Non-Transferable Soulbound Asset | Zero-Gas Verifiable`, 20, 142);
  doc.text(`IPFS Metadata CID: ${cred.ipfsCID || 'ipfs://Qm...' }`, 20, 147);
  doc.text(`SHA-256 Hash: ${cred.certificateHash || '0x...'}`, 20, 152);

  // Signatures Section
  const sigY = 175;
  // Registrar Line
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
  doc.text(`Signer: ${cred.issuedByRegistrar ? cred.issuedByRegistrar.substring(0, 14) + '...' : 'Registrar Multi-Sig'}`, 62.5, sigY + 9, { align: 'center' });

  // Seal in center
  doc.addImage(qrDataUrl, 'PNG', pageWidth / 2 - 15, sigY - 20, 30, 30);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan for 1-Click Verification', pageWidth / 2, sigY + 14, { align: 'center' });

  // Dean Line
  doc.line(pageWidth - 95, sigY, pageWidth - 30, sigY);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Dean of Academic Affairs', pageWidth - 62.5, sigY + 5, { align: 'center' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Cryptographic Multi-Sig Verified', pageWidth - 62.5, sigY + 9, { align: 'center' });

  // Output as array buffer & compute SHA-256 hash
  const pdfBuffer = doc.output('arraybuffer');
  const hash = computeSha256(pdfBuffer);
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const dataUrl = URL.createObjectURL(blob);

  return {
    blob,
    dataUrl,
    hash,
    pdfDoc: doc,
  };
}
