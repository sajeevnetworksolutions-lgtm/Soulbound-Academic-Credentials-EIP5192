import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { computeFileHash, formatAddress, formatDate } from '../services/hashUtil';
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
  ExternalLink,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmployerVerificationPortal({ initialVerificationData }) {
  const { verifyDegree, verifyByCertificateHash, credentials, contractAddress } = useWeb3();

  const [verifyTab, setVerifyTab] = useState('direct'); // 'direct' | 'pdf' | 'quick'
  const [studentAddress, setStudentAddress] = useState(
    initialVerificationData?.studentWallet || '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
  );
  const [tokenId, setTokenId] = useState(initialVerificationData?.tokenId?.toString() || '1');
  const [certHashInput, setCertHashInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [computedHash, setComputedHash] = useState(null);

  // Sync if initial data passed
  useEffect(() => {
    if (initialVerificationData) {
      setStudentAddress(initialVerificationData.studentWallet || '');
      setTokenId(initialVerificationData.tokenId?.toString() || '1');
      handleDirectVerify(
        initialVerificationData.studentWallet,
        initialVerificationData.tokenId?.toString() || '1'
      );
    }
  }, [initialVerificationData]);

  const handleDirectVerify = async (addr = studentAddress, id = tokenId) => {
    setLoading(true);
    setVerificationResult(null);

    const startTime = performance.now();
    try {
      const res = await verifyDegree(addr, id);
      const elapsed = performance.now() - startTime;
      res.wallClockLatencyMs = elapsed.toFixed(1);

      setVerificationResult(res);

      if (res.isValid) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      alert('Verification error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setLoading(true);
    setVerificationResult(null);

    const startTime = performance.now();
    try {
      const hash = await computeFileHash(file);
      setComputedHash(hash);

      const res = await verifyByCertificateHash(hash);
      const elapsed = performance.now() - startTime;
      res.wallClockLatencyMs = elapsed.toFixed(1);

      setVerificationResult(res);

      if (res.isValid) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      alert('PDF processing error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Employer & Recruiter 1-Click Verification Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Instant, zero-gas cryptographic validation of Soulbound academic credentials (&lt; 1.5s latency).
                </p>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setVerifyTab('direct');
                setVerificationResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verifyTab === 'direct'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Address + Token ID
            </button>
            <button
              onClick={() => {
                setVerifyTab('pdf');
                setVerificationResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verifyTab === 'pdf'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PDF Drag & Drop Hash Match
            </button>
            <button
              onClick={() => {
                setVerifyTab('quick');
                setVerificationResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verifyTab === 'quick'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sample Credentials Quick-Check
            </button>
          </div>
        </div>
      </div>

      {/* Main Verification Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Verification Query Inputs */}
        <div className="lg:col-span-5 space-y-6">
          {verifyTab === 'direct' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4">
                Verify by Student Wallet & Token ID
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Student Soulbound Wallet Address
                  </label>
                  <input
                    type="text"
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Token ID</label>
                  <input
                    type="number"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleDirectVerify()}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Querying Blockchain State...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Execute 1-Click Zero-Gas Verification</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {verifyTab === 'pdf' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-2">
                Tamper-Proof PDF Cryptographic Verification
              </h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Upload or drag-and-drop a diploma PDF. The platform computes its client-side SHA-256 hash and validates it against the immutable on-chain registry.
              </p>

              <label className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40">
                <Upload className="h-10 w-10 text-purple-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  {uploadedFileName ? uploadedFileName : 'Click or Drag Certificate PDF here'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Accepts .PDF format</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>

              {computedHash && (
                <div className="mt-4 p-3 bg-slate-800/80 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400 font-semibold">Computed Cryptographic SHA-256:</div>
                  <div className="font-mono text-[10px] text-purple-300 break-all">{computedHash}</div>
                </div>
              )}
            </div>
          )}

          {verifyTab === 'quick' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                Quick Test Sample Credentials
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Click any pre-recorded on-chain credential below to run the instant verification audit:
              </p>

              <div className="space-y-3">
                {credentials.map((c) => (
                  <button
                    key={c.tokenId}
                    onClick={() => {
                      setStudentAddress(c.studentWallet);
                      setTokenId(c.tokenId.toString());
                      handleDirectVerify(c.studentWallet, c.tokenId.toString());
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{c.studentName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          c.isRevoked ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {c.isRevoked ? 'REVOKED SAMPLE' : `Token #${c.tokenId}`}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1">{c.degreeName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantitative Performance Benchmark Callout */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-slate-200">Zero-Gas & Sub-Second Latency: </span>
              <span className="text-slate-400">
                All verification operations utilize EVM static read calls (0 Gas) executed in &lt; 1.5 seconds.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Results Badge & Proof */}
        <div className="lg:col-span-7">
          {verificationResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Verdict Header */}
              <div
                className={`p-5 rounded-2xl border flex items-start space-x-4 ${
                  verificationResult.isValid
                    ? 'bg-emerald-950/30 border-emerald-500/50'
                    : verificationResult.isRevoked
                    ? 'bg-rose-950/30 border-rose-500/50'
                    : 'bg-amber-950/30 border-amber-500/50'
                }`}
              >
                {verificationResult.isValid ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 flex-shrink-0 mt-1" />
                ) : verificationResult.isRevoked ? (
                  <XCircle className="h-10 w-10 text-rose-400 flex-shrink-0 mt-1" />
                ) : (
                  <AlertTriangle className="h-10 w-10 text-amber-400 flex-shrink-0 mt-1" />
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2
                      className={`text-lg sm:text-xl font-bold ${
                        verificationResult.isValid
                          ? 'text-emerald-400'
                          : verificationResult.isRevoked
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {verificationResult.isValid && '✓ 100% AUTHENTIC DEGREE VERIFIED'}
                      {verificationResult.isRevoked && '⚠️ CREDENTIAL REVOKED BY DISCIPLINARY BOARD'}
                      {!verificationResult.isValid &&
                        !verificationResult.isRevoked &&
                        '❌ INVALID / UNREGISTERED CREDENTIAL'}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">
                    {verificationResult.isValid &&
                      'Cryptographic signature verified on-chain. Token is permanently locked to candidate soul wallet.'}
                    {verificationResult.isRevoked &&
                      'This credential was formally revoked on-chain. Academic Senate validity is null and void.'}
                    {!verificationResult.isValid &&
                      !verificationResult.isRevoked &&
                      'The specified token ID is either unminted or not owned by the presented wallet address.'}
                  </p>

                  {/* Benchmark Performance Telemetry */}
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      ⚡ Latency: {verificationResult.wallClockLatencyMs || verificationResult.latencyMs} ms (&lt; 1.5s Target)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">
                      ⛽ Gas Cost: 0 Gas (Free Call)
                    </span>
                  </div>
                </div>
              </div>

              {/* Revocation Details Warning if Revoked */}
              {verificationResult.isRevoked && verificationResult.credential && (
                <div className="p-4 bg-rose-900/30 border border-rose-500/40 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-rose-300">Revocation Reason: </span>
                  <span className="text-slate-200">{verificationResult.credential.revocationReason}</span>
                  <div className="text-[10px] text-rose-400 font-mono mt-1">
                    Revocation Reference Hash: {verificationResult.credential.revocationReasonHash}
                  </div>
                </div>
              )}

              {/* Verified Credential Metadata Card */}
              {verificationResult.credential && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    On-Chain Verified Academic Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px]">Graduate Full Name</span>
                      <span className="font-bold text-slate-100 text-sm">
                        {verificationResult.credential.studentName}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px]">Student Roll / ID</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        {verificationResult.credential.studentIdNumber}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px]">Degree Program</span>
                      <span className="font-bold text-slate-100">
                        {verificationResult.credential.degreeName}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px]">Major / Specialization</span>
                      <span className="font-medium text-slate-200">
                        {verificationResult.credential.majorSpecialization}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px]">Cumulative GPA</span>
                      <span className="font-bold text-emerald-400">
                        {verificationResult.credential.cgpa}
                      </span>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px]">Issuing University</span>
                      <span className="font-medium text-slate-200">
                        {verificationResult.credential.institutionName}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Proof Hashes */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px] font-mono">
                    <div className="flex flex-col sm:flex-row justify-between text-slate-400 gap-1">
                      <span>Bound Soul Wallet:</span>
                      <span className="text-emerald-400">{verificationResult.credential.studentWallet}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-400 gap-1">
                      <span>Registrar Signer:</span>
                      <span className="text-slate-200">{verificationResult.credential.issuedByRegistrar}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-400 gap-1">
                      <span>Certificate SHA-256 Hash:</span>
                      <span className="text-indigo-400 truncate max-w-xs">{verificationResult.credential.certificateHash}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-400 gap-1">
                      <span>IPFS Metadata CID:</span>
                      <span className="text-amber-400 truncate max-w-xs">{verificationResult.credential.ipfsCID}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-slate-400 gap-1">
                      <span>Token Standard:</span>
                      <span className="text-purple-400">EIP-5192 Minimal Soulbound NFT</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-900 border border-slate-800 rounded-2xl">
              <ShieldCheck className="h-14 w-14 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Ready to Verify</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Enter student wallet details or upload a diploma PDF on the left to execute cryptographic verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
