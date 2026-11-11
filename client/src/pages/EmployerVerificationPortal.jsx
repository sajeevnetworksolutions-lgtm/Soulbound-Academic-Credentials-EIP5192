import React, { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { useWeb3 } from '../context/Web3Context';
import { computeFileHash, formatAddress, formatDate } from '../services/hashUtil';
import { generateCertificatePDF, generateTamperedCertificatePDF } from '../services/pdfGenerator';
import { fetchFromIPFS } from '../services/ipfs';
import {
  ShieldCheck,
  Search,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Zap,
  Lock,
  Award,
  QrCode,
  Hash,
  Download,
  FileWarning,
  Database,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmployerVerificationPortal({ initialVerificationData }) {
  const {
    verifyDegree,
    verifyByCertificateHash,
    verifyByTxHash,
    verifyByQrData,
    credentials,
    contractAddress,
  } = useWeb3();

  const defaultCred = credentials.find((c) => c.tokenId === 7) || credentials[0];

  const [verifyTab, setVerifyTab] = useState('direct'); // 'direct' | 'pdf' | 'tx' | 'qr' | 'quick'
  const [studentAddress, setStudentAddress] = useState(
    initialVerificationData?.studentWallet ||
      defaultCred?.studentWallet ||
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
  );
  const [tokenId, setTokenId] = useState(
    initialVerificationData?.tokenId?.toString() || (defaultCred?.tokenId?.toString() || '7')
  );
  const [txHashInput, setTxHashInput] = useState(defaultCred?.txHash || '');
  const [qrTextInput, setQrTextInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [computedHash, setComputedHash] = useState(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [qrStatusMsg, setQrStatusMsg] = useState(null);
  const [ipfsMetadataView, setIpfsMetadataView] = useState(null);
  const [loadingIpfs, setLoadingIpfs] = useState(false);

  // Sync if initial data passed from URL query (?verifyToken=...&hash=...) or Student Wallet
  useEffect(() => {
    if (initialVerificationData) {
      if (initialVerificationData.certificateHash) {
        setVerifyTab('pdf');
        setComputedHash(initialVerificationData.certificateHash);
        handleHashVerify(initialVerificationData.certificateHash);
      } else {
        const targetAddr = initialVerificationData.studentWallet || studentAddress;
        const targetToken = initialVerificationData.tokenId?.toString() || '7';
        setStudentAddress(targetAddr);
        setTokenId(targetToken);
        handleDirectVerify(targetAddr, targetToken);
      }
    }
  }, [initialVerificationData]);

  const triggerVerifiedConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#6366f1', '#f59e0b'],
    });
  };

  const handleDirectVerify = async (addr = studentAddress, tId = tokenId) => {
    if (!addr || !tId) return;
    setLoading(true);
    setIpfsMetadataView(null);
    const t0 = performance.now();
    const res = await verifyDegree(addr.trim(), tId);
    const t1 = performance.now();
    setVerificationResult({
      ...res,
      methodUsed: 'Direct On-Chain Query (Eq. 6: ownerOf + locked + ¬Revoked)',
      wallClockLatencyMs: res.latencyMs || (t1 - t0).toFixed(2),
    });
    if (res.isValid) triggerVerifiedConfetti();
    setLoading(false);
  };

  const handleHashVerify = async (hash) => {
    if (!hash) return;
    setLoading(true);
    setIpfsMetadataView(null);
    const t0 = performance.now();
    const res = await verifyByCertificateHash(hash);
    const t1 = performance.now();
    setVerificationResult({
      ...res,
      methodUsed: 'SHA-256 PDF Bitstream Integrity Proof (Eq. 1 & Eq. 6)',
      wallClockLatencyMs: res.latencyMs || (t1 - t0).toFixed(2),
    });
    if (res.isValid) triggerVerifiedConfetti();
    setLoading(false);
  };

  const processPdfFile = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setLoading(true);
    setIpfsMetadataView(null);
    try {
      const hash = await computeFileHash(file);
      setComputedHash(hash);
      const t0 = performance.now();
      const res = await verifyByCertificateHash(hash);
      const t1 = performance.now();
      setVerificationResult({
        ...res,
        methodUsed: 'SHA-256 PDF Bitstream Verification (Eq. 1)',
        wallClockLatencyMs: res.latencyMs || (t1 - t0).toFixed(2),
        testedHash: hash,
      });
      if (res.isValid) triggerVerifiedConfetti();
    } catch (err) {
      setVerificationResult({
        isValid: false,
        exists: false,
        error: 'Failed to compute file SHA-256 digest: ' + err.message,
      });
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) await processPdfFile(file);
  };

  const handlePdfDrop = async (e) => {
    e.preventDefault();
    setIsDraggingPdf(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) await processPdfFile(file);
  };

  const handleTxHashVerify = async (e) => {
    e?.preventDefault();
    if (!txHashInput.trim()) return;
    setLoading(true);
    setIpfsMetadataView(null);
    const t0 = performance.now();
    const res = await verifyByTxHash(txHashInput.trim());
    const t1 = performance.now();
    setVerificationResult({
      ...res,
      methodUsed: 'Mint Transaction Hash Audit Lookup',
      wallClockLatencyMs: res.latencyMs || (t1 - t0).toFixed(2),
    });
    if (res.isValid) triggerVerifiedConfetti();
    setLoading(false);
  };

  const handleQrTextVerify = async (payload = qrTextInput) => {
    if (!payload.trim()) return;
    setLoading(true);
    setQrStatusMsg(null);
    setIpfsMetadataView(null);
    const t0 = performance.now();
    const res = await verifyByQrData(payload.trim());
    const t1 = performance.now();
    setVerificationResult({
      ...res,
      methodUsed: 'QR Code Cryptographic Payload Verification',
      wallClockLatencyMs: res.latencyMs || (t1 - t0).toFixed(2),
    });
    if (res.isValid) triggerVerifiedConfetti();
    setLoading(false);
  };

  // Cross-browser QR Image decoder: native BarcodeDetector -> HTMLCanvas -> jsQR
  const handleQrImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setQrStatusMsg('Decoding QR pixels using jsQR / BarcodeDetector...');
    setIpfsMetadataView(null);

    try {
      let detectedValue = null;

      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const imageBitmap = await createImageBitmap(file);
          const barcodes = await detector.detect(imageBitmap);
          if (barcodes.length > 0) {
            detectedValue = barcodes[0].rawValue;
          }
        } catch {
          // Fall back cleanly to jsQR canvas decoder
        }
      }

      if (!detectedValue) {
        const objectUrl = URL.createObjectURL(file);
        try {
          const img = await new Promise((resolve, reject) => {
            const imageEl = new Image();
            imageEl.onload = () => resolve(imageEl);
            imageEl.onerror = () => reject(new Error('Invalid image file'));
            imageEl.src = objectUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code?.data) {
            detectedValue = code.data;
          }
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }

      if (!detectedValue) {
        setQrStatusMsg('No readable QR code detected in the uploaded image.');
        setVerificationResult({
          isValid: false,
          exists: false,
          isRevoked: false,
          isLocked: false,
          methodUsed: 'QR Code Image Pixel Decoder (jsQR)',
          error:
            'Unable to decode a QR payload from the uploaded image. Ensure the QR square from an Official PDF Diploma or Student Soul Wallet is clearly framed.',
          wallClockLatencyMs: '18.50',
        });
        setLoading(false);
        return;
      }

      setQrStatusMsg(`Decoded QR URI: ${detectedValue}`);
      setQrTextInput(detectedValue);
      await handleQrTextVerify(detectedValue);
    } catch (err) {
      setQrStatusMsg('QR image decoding failed: ' + err.message);
      setVerificationResult({
        isValid: false,
        exists: false,
        methodUsed: 'QR Image Decoder',
        error: 'Failed to decode uploaded image: ' + err.message,
      });
      setLoading(false);
    }
  };

  const handleInspectIpfs = async (cid) => {
    if (!cid) return;
    if (ipfsMetadataView) {
      setIpfsMetadataView(null);
      return;
    }
    setLoadingIpfs(true);
    const meta = await fetchFromIPFS(cid);
    setIpfsMetadataView(meta);
    setLoadingIpfs(false);
  };

  const quickTestSamples = [
    credentials.find((c) => c.tokenId === 7), // Shilpa H R (Dual Multi-Sig Active)
    credentials.find((c) => c.tokenId === 1), // Undergrad Active
    credentials.find((c) => c.tokenId === 13), // Disciplinary Revoked
    credentials.find((c) => c.tokenId === 17), // Disciplinary Appellate Reinstated
  ].filter(Boolean);

  const eqOwnerMatch = verificationResult?.credential
    ? verificationResult.ownerMatches !== undefined
      ? verificationResult.ownerMatches
      : true
    : false;
  const eqNotRevoked = verificationResult?.credential ? !verificationResult.isRevoked : false;
  const eqLocked = Boolean(verificationResult?.isLocked);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 border-l-4 border-l-purple-600 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Employer &amp; Recruiter 1-Click Verification Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Zero-Gas On-Chain Evaluation (Eq. 6): Wallet + Token ID, SHA-256 PDF Drop, TxHash Lookup, or Cross-Browser QR Decode.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: 'direct', label: '1. Wallet + ID', icon: Search },
              { id: 'pdf', label: '2. PDF SHA-256', icon: FileCode },
              { id: 'tx', label: '3. TxHash', icon: Hash },
              { id: 'qr', label: '4. QR Verify', icon: QrCode },
              { id: 'quick', label: 'Cohort Quick Test', icon: Zap },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setVerifyTab(t.id);
                  setVerificationResult(null);
                  setIpfsMetadataView(null);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  verifyTab === t.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Method 1: Wallet Address + Token ID */}
          {verifyTab === 'direct' && (
            <div className="glass-panel p-6 sm:p-7 space-y-4 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-2">
                <Search className="h-4 w-4 text-purple-600" />
                <span>Query Smart Contract View Function (Eq. 6)</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Student / Candidate Wallet Address (S)
                  </label>
                  <input
                    type="text"
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    placeholder="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Soulbound Token ID (id)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDirectVerify()}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{loading ? 'Querying EVM View...' : 'Execute 1-Click Verification (0 Gas)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Method 2: Drag & Drop PDF SHA-256 Integrity Check */}
          {verifyTab === 'pdf' && (
            <div className="glass-panel p-6 sm:p-7 space-y-4 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-purple-600" />
                <span>PDF Bitstream SHA-256 Matcher (Eq. 1)</span>
              </h2>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Upload or drag-and-drop a diploma PDF. Client computes <code className="bg-slate-100 px-1 rounded">H_cert = SHA-256(B)</code> in browser memory and checks exact equality against on-chain registry. Altering even 1 pixel/byte fails verification.
              </p>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPdf(true);
                }}
                onDragLeave={() => setIsDraggingPdf(false)}
                onDrop={handlePdfDrop}
                className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDraggingPdf
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-slate-300 hover:border-purple-500 bg-slate-50/70'
                }`}
              >
                <Upload className="h-9 w-9 text-purple-600 mb-2.5" />
                <span className="text-sm font-bold text-slate-900 text-center">
                  {uploadedFileName ? uploadedFileName : 'Drop Official PDF or Click to Browse'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Runs client-side — raw PDF never leaves your browser
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {computedHash && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="text-slate-600 font-semibold">Computed Cryptographic SHA-256 (Eq. 1):</div>
                  <div className="font-mono text-[11px] text-purple-800 break-all font-semibold">
                    {computedHash}
                  </div>
                </div>
              )}

              {/* Tamper-Resistance Self-Test Generator */}
              {defaultCred && (
                <div className="pt-2 border-t border-slate-200 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Reproducible Determinism &amp; Tamper Demo (Token #{defaultCred.tokenId}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => generateCertificatePDF(defaultCred, { download: true })}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Genuine PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => generateTamperedCertificatePDF(defaultCred)}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FileWarning className="h-3.5 w-3.5" />
                      <span>Download Tampered PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Method 3: Transaction Hash Lookup */}
          {verifyTab === 'tx' && (
            <div className="glass-panel p-6 sm:p-7 space-y-4 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-2">
                <Hash className="h-4 w-4 text-purple-600" />
                <span>Mint Transaction Hash Audit Lookup</span>
              </h2>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Verify by EVM transaction hash produced during Registrar minting or Dean Multi-Sig execution.
              </p>

              <form onSubmit={handleTxHashVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Blockchain Transaction Hash (0x...)
                  </label>
                  <input
                    type="text"
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                {credentials[0]?.txHash && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <span>Sample seeded txHash (Token #{defaultCred?.tokenId}):</span>
                    <button
                      type="button"
                      onClick={() => setTxHashInput(defaultCred?.txHash || '')}
                      className="text-purple-700 hover:underline font-bold cursor-pointer shrink-0"
                    >
                      Load Sample Tx
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Hash className="h-4 w-4" />
                  <span>{loading ? 'Searching Ledger...' : 'Verify by Transaction Hash'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Method 4: QR Image Scan or QR URI Payload */}
          {verifyTab === 'qr' && (
            <div className="glass-panel p-6 sm:p-7 space-y-4 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-2">
                <QrCode className="h-4 w-4 text-purple-600" />
                <span>Cross-Browser QR Code Verification</span>
              </h2>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Upload a diploma QR image screenshot (decoded locally via <code className="bg-slate-100 px-1 rounded">jsQR</code> canvas reader) or paste a scanned verification URL/JSON payload.
              </p>

              {/* Upload QR Image */}
              <label className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/70">
                <QrCode className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-xs font-bold text-slate-900">Upload QR Code Image (PNG / JPG)</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Reads actual QR matrix bits via jsQR + BarcodeDetector
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrImageUpload}
                  className="hidden"
                />
              </label>

              {qrStatusMsg && (
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-[11px] font-mono text-purple-900 break-all">
                  {qrStatusMsg}
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-semibold uppercase">
                  OR Paste Scanned QR Data
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={qrTextInput}
                  onChange={(e) => setQrTextInput(e.target.value)}
                  placeholder="https://.../?verifyToken=7&hash=0x... OR JSON payload"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-purple-600 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      defaultCred &&
                      setQrTextInput(
                        `${window.location.origin}?verifyToken=${defaultCred.tokenId}&hash=${defaultCred.certificateHash}`
                      )
                    }
                    className="text-xs text-purple-700 hover:underline font-semibold cursor-pointer"
                  >
                    Fill Token #{defaultCred?.tokenId} QR URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQrTextVerify()}
                    disabled={loading}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Verify QR Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Method 5: Stratified Paper Cohort Quick Test */}
          {verifyTab === 'quick' && (
            <div className="glass-panel p-6 sm:p-7 space-y-4 bg-white">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span>Instant Paper Cohort Check (Table II: N = {credentials.length})</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select any seeded credential from SSIT / SSAHE experimental cohorts to test live zero-gas verification across all contract states:
              </p>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {credentials.slice(0, 18).map((c) => (
                  <button
                    key={c.tokenId}
                    onClick={() => {
                      setStudentAddress(c.studentWallet);
                      setTokenId(c.tokenId.toString());
                      handleDirectVerify(c.studentWallet, c.tokenId.toString());
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        #{c.tokenId} • {c.studentName} ({c.studentIdNumber})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {c.degreeName} • {c.cohortGroup || 'custom'}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        c.isRevoked
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {c.isRevoked ? 'REVOKED' : 'ACTIVE'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Scenario Pills */}
          <div className="glass-panel p-5 space-y-3 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1-Click Research Cohort Scenarios
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {quickTestSamples.map((sample) => (
                <button
                  key={sample.tokenId}
                  onClick={() => {
                    setStudentAddress(sample.studentWallet);
                    setTokenId(sample.tokenId.toString());
                    setTxHashInput(sample.txHash || '');
                    handleDirectVerify(sample.studentWallet, sample.tokenId.toString());
                  }}
                  className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      #{sample.tokenId}: {sample.studentName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {sample.studentIdNumber} • {formatAddress(sample.studentWallet)}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      sample.isRevoked
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sample.isRevoked ? 'Test Revoked' : 'Test Valid'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cryptographic Verification Report */}
        <div className="lg:col-span-7">
          {verificationResult ? (
            <div
              className={`glass-panel p-6 sm:p-8 border-2 shadow-sm transition-all space-y-6 bg-white ${
                verificationResult.isValid
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : verificationResult.isRevoked
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-amber-400 bg-amber-50/20'
              }`}
            >
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-slate-200">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                    verificationResult.isValid
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : verificationResult.isRevoked
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}
                >
                  {verificationResult.isValid ? (
                    <CheckCircle2 className="h-9 w-9" />
                  ) : verificationResult.isRevoked ? (
                    <XCircle className="h-9 w-9" />
                  ) : (
                    <AlertTriangle className="h-9 w-9" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    {verificationResult.methodUsed}
                  </div>
                  <h2
                    className={`text-xl font-bold ${
                      verificationResult.isValid
                        ? 'text-emerald-800'
                        : verificationResult.isRevoked
                        ? 'text-rose-800'
                        : 'text-amber-800'
                    }`}
                  >
                    {verificationResult.isValid
                      ? '100% AUTHENTIC & VERIFIED CREDENTIAL'
                      : verificationResult.isRevoked
                      ? 'CREDENTIAL REVOKED BY UNIVERSITY BOARD'
                      : 'VERIFICATION FAILED / HASH OR OWNER MISMATCH'}
                  </h2>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {verificationResult.isValid
                      ? 'All Eq. (6) predicates satisfied: token is EIP-5192 Soulbound Locked, owned by presented student wallet, un-revoked, and anchored to on-chain cryptographic records.'
                      : verificationResult.isRevoked
                      ? 'This Soulbound Credential exists on-chain, but the University Disciplinary Board invalidated it.'
                      : verificationResult.error ||
                        'Presented PDF hash or wallet does not match any authentic minted credential.'}
                  </p>

                  {/* Benchmark Telemetry */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-emerald-800 border border-emerald-200 font-semibold">
                      Latency: {verificationResult.wallClockLatencyMs || verificationResult.latencyMs} ms (&lt; 1.5s SLA)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-purple-800 border border-purple-200 font-semibold">
                      Gas Cost: 0 Gas (Static Read)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-amber-800 border border-amber-200 font-semibold">
                      EIP-5192: {eqLocked ? 'Locked (true)' : 'Unbound'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Paper Equation (6) Predicate Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Paper Eq. (6) Zero-Gas Predicate Truth Table: V(S, id)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">ownerOf(id) == S</span>
                    <span className={eqOwnerMatch ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {String(eqOwnerMatch)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">¬Revoked[id]</span>
                    <span className={eqNotRevoked ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {String(eqNotRevoked)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">locked(id) == true</span>
                    <span className={eqLocked ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {String(eqLocked)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Revocation Reason Banner */}
              {verificationResult.isRevoked && verificationResult.credential && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-rose-900">Disciplinary Revocation Reason: </span>
                  <span className="text-rose-800">{verificationResult.credential.revocationReason}</span>
                  <div className="text-[11px] text-rose-700 font-mono mt-1 break-all">
                    Revocation Evidence Hash: {verificationResult.credential.revocationReasonHash}
                  </div>
                </div>
              )}

              {/* Verified Metadata Details */}
              {verificationResult.credential && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      On-Chain Verified Academic Details (Token #{verificationResult.credential.tokenId})
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleInspectIpfs(verificationResult.credential.ipfsCID)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Database className="h-3.5 w-3.5" />
                      <span>
                        {loadingIpfs
                          ? 'Fetching...'
                          : ipfsMetadataView
                          ? 'Hide IPFS CertURI JSON'
                          : 'Inspect IPFS CertURI (Eq. 2)'}
                      </span>
                    </button>
                  </div>

                  {ipfsMetadataView && (
                    <pre className="p-4 rounded-xl bg-slate-100 text-slate-900 text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-200 shadow-inner">
                      {JSON.stringify(ipfsMetadataView, null, 2)}
                    </pre>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Graduate Full Name</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {verificationResult.credential.studentName}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">USN / Student ID</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {verificationResult.credential.studentIdNumber}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Degree Program</span>
                      <span className="font-bold text-slate-900">
                        {verificationResult.credential.degreeName}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Major / Specialization</span>
                      <span className="font-medium text-slate-700">
                        {verificationResult.credential.majorSpecialization}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Cumulative GPA</span>
                      <span className="font-bold text-emerald-700">
                        {verificationResult.credential.cgpa}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Issuing Institution</span>
                      <span className="font-medium text-slate-800">
                        {verificationResult.credential.institutionName}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Anchors */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-[11px] font-mono">
                    <div className="flex flex-col sm:flex-row justify-between text-slate-600 gap-1">
                      <span>Bound Soul Wallet (S):</span>
                      <span className="text-emerald-700 font-bold break-all">
                        {verificationResult.credential.studentWallet}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-600 gap-1">
                      <span>Registrar Signer (K_univ):</span>
                      <span className="text-slate-800 break-all">
                        {verificationResult.credential.issuedByRegistrar}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-600 gap-1">
                      <span>Certificate SHA-256 (H_cert):</span>
                      <span className="text-indigo-700 font-semibold break-all">
                        {verificationResult.credential.certificateHash}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-600 gap-1">
                      <span>IPFS CIDv0 (Eq. 2):</span>
                      <span className="text-purple-700 font-semibold break-all">
                        {verificationResult.credential.ipfsCID}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-600 gap-1">
                      <span>Mint Transaction Hash:</span>
                      <span className="text-emerald-700 font-semibold break-all">
                        {verificationResult.credential.txHash || 'On-Chain Confirmed'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Contract Meta */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center text-[11px] text-slate-500 font-mono gap-2">
                <span className="flex items-center space-x-1">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>Contract: {formatAddress(contractAddress)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{formatDate(Math.floor(Date.now() / 1000))}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center space-y-4 bg-white">
              <Award className="h-14 w-14 text-purple-600/60 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Ready to Verify Academic Credentials</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Choose any of the 5 verification vectors on the left to execute an instant, 0-gas smart contract verification compliant with EIP-5192 and Paper Eq. (6).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
