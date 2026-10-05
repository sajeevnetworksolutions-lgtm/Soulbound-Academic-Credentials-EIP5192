import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { generateCertificatePDF } from '../services/pdfGenerator';
import { formatAddress, formatDate } from '../services/hashUtil';
import {
  Download,
  ShieldCheck,
  Lock,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function DiplomaCertificate({ credential, onVerifyClick }) {
  const [qrSrc, setQrSrc] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const verifyUrl = `${window.location.origin}?verifyToken=${credential.tokenId}&hash=${credential.certificateHash}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }).then((url) => setQrSrc(url));
  }, [credential, verifyUrl]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const { pdfDoc } = await generateCertificatePDF(credential);
      pdfDoc.save(
        `Soulbound_Degree_${credential.studentName.replace(/\s+/g, '_')}_${credential.studentIdNumber}.pdf`
      );
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const copyVerifyUrl = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Diploma Parchment Canvas */}
      <div className="w-full max-w-4xl bg-[#fefcf6] text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl relative border-8 border-slate-900 overflow-hidden">
        {/* Ornate Gold & Emerald Inset Border */}
        <div className="absolute inset-2 border-2 border-emerald-600 pointer-events-none" />
        <div className="absolute inset-3.5 border border-amber-500 pointer-events-none" />

        {/* Revocation Watermark Banner if Revoked */}
        {credential.isRevoked && (
          <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
            <div className="transform -rotate-12 border-4 border-red-600 bg-red-900/90 text-white font-mono font-black text-3xl sm:text-5xl px-8 py-3 rounded-xl shadow-2xl tracking-widest uppercase">
              REVOKED CREDENTIAL
            </div>
          </div>
        )}

        {/* Top Header Badge: EIP-5192 Soulbound */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Lock className="h-3.5 w-3.5 text-emerald-700" />
            <span>EIP-5192 Soulbound Token (Non-Transferable)</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-600">
              Token ID: #{credential.tokenId}
            </span>
          </div>
        </div>

        {/* University Header */}
        <div className="text-center relative z-10 mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 text-amber-400 mb-3 shadow-md border-2 border-amber-400">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <h1 className="font-serif-title font-bold text-xl sm:text-3xl tracking-wider text-slate-900 uppercase">
            {credential.institutionName || 'National Institute of Advanced Technologies'}
          </h1>
          <p className="text-xs sm:text-sm font-serif-body italic text-slate-600 mt-1">
            Empowered by Academic Senate & Decentralized Identity Registry
          </p>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-6 relative z-10">
          <span className="text-xs tracking-widest text-emerald-700 uppercase font-semibold">
            Official Degree of Record
          </span>
          <p className="text-xs font-serif-body text-slate-600 mt-1">
            This is to certify that upon recommendation of the faculty and approval of the Senate,
          </p>

          <h2 className="font-serif-title font-bold text-2xl sm:text-4xl text-slate-900 my-3 tracking-wide border-b-2 border-slate-300 pb-2 inline-block px-6">
            {credential.studentName}
          </h2>

          <div className="text-xs font-mono text-slate-600 space-x-3 mt-1">
            <span>Roll No: <strong>{credential.studentIdNumber}</strong></span>
            <span>•</span>
            <span>Soul Wallet: <strong className="font-mono">{formatAddress(credential.studentWallet)}</strong></span>
          </div>

          <p className="text-xs font-serif-body text-slate-600 mt-4">
            has fulfilled all prescribed requirements and is hereby awarded the degree of
          </p>

          <h3 className="font-serif-title font-bold text-xl sm:text-2xl text-slate-800 mt-2">
            {credential.degreeName}
          </h3>

          <p className="font-serif-body italic text-base sm:text-lg text-slate-700 mt-1">
            with Specialization in {credential.majorSpecialization}
          </p>

          <div className="inline-block mt-3 bg-amber-50 border border-amber-300 px-4 py-1 rounded-full text-xs font-bold text-amber-900">
            {credential.cgpa}
          </div>
        </div>

        {/* Footer Cryptographic Signatures & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mt-10 pt-6 border-t border-slate-300 relative z-10">
          {/* Registrar Signature */}
          <div className="text-center sm:text-left">
            <div className="border-b border-slate-400 pb-1 mb-1 font-serif-body font-bold text-sm text-slate-800">
              Office of the Registrar
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Registrar: {formatAddress(credential.issuedByRegistrar)}
            </div>
            <div className="text-[9px] text-emerald-700 font-semibold">
              ✓ Cryptographic ECDSA Verified
            </div>
          </div>

          {/* Central QR Code Seal */}
          <div className="flex flex-col items-center justify-center text-center">
            {qrSrc && (
              <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
                <img src={qrSrc} alt="Verification QR" className="h-20 w-20" />
              </div>
            )}
            <span className="text-[9px] text-slate-500 font-mono mt-1">
              1-Click Instant Verify
            </span>
          </div>

          {/* Dean Signature */}
          <div className="text-center sm:text-right">
            <div className="border-b border-slate-400 pb-1 mb-1 font-serif-body font-bold text-sm text-slate-800">
              Dean of Academic Affairs
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Issued: {formatDate(credential.graduationDate || credential.issuanceTimestamp)}
            </div>
            <div className="text-[9px] text-emerald-700 font-semibold">
              ✓ Multi-Sig Senate Seal
            </div>
          </div>
        </div>

        {/* Cryptographic Hash Bar */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row justify-between gap-2 relative z-10">
          <div className="truncate">
            <span className="font-semibold text-slate-700">SHA-256 Hash: </span>
            <span>{credential.certificateHash}</span>
          </div>
          <div className="truncate">
            <span className="font-semibold text-slate-700">IPFS CID: </span>
            <span>{credential.ipfsCID}</span>
          </div>
        </div>
      </div>

      {/* Action Control Bar */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF Diploma'}</span>
        </button>

        <button
          onClick={copyVerifyUrl}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs py-2.5 px-4 rounded-xl transition-all"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
        </button>

        {onVerifyClick && (
          <button
            onClick={() => onVerifyClick(credential)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Test 1-Click Verification</span>
          </button>
        )}
      </div>
    </div>
  );
}
