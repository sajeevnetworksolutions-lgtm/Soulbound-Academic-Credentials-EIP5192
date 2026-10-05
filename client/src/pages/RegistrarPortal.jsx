import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { computeSha256, formatAddress } from '../services/hashUtil';
import { generateCertificatePDF } from '../services/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  Award,
  Building2,
  FileCheck2,
  Send,
  Upload,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  KeyRound,
  FileText,
  UserCheck,
} from 'lucide-react';
import DiplomaCertificate from '../components/DiplomaCertificate';

export default function RegistrarPortal({ setActiveTab }) {
  const {
    activeAddress,
    issueDegree,
    issueBatchDegrees,
    proposeDegreeIssuance,
    pinataJwt,
    setPinataJwt,
  } = useWeb3();

  const [mode, setMode] = useState('single'); // 'single' | 'batch'
  const [issuanceType, setIssuanceType] = useState('direct'); // 'direct' | 'multisig'
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    studentName: 'Elena Rostova',
    studentIdNumber: 'MTECH-AI-2026-099',
    degreeName: 'Master of Technology (M.Tech)',
    majorSpecialization: 'Artificial Intelligence & Machine Learning',
    cgpa: '9.75 / 10.0 (Gold Medalist)',
    graduationDate: 1775174400,
    institutionName: 'National Institute of Advanced Technologies',
  });

  // Batch CSV/JSON input state
  const [batchJson, setBatchJson] = useState(
    JSON.stringify(
      [
        {
          studentWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
          studentName: 'Priya Sharma',
          studentIdNumber: 'MTECH-2026-101',
          degreeName: 'Master of Technology',
          majorSpecialization: 'Computer Vision & Robotics',
          cgpa: '9.65 / 10.0',
          graduationDate: 1775174400,
          institutionName: 'National Institute of Advanced Technologies',
        },
        {
          studentWallet: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
          studentName: 'Daniel Kim',
          studentIdNumber: 'MTECH-2026-102',
          degreeName: 'Master of Technology',
          majorSpecialization: 'Natural Language Processing',
          cgpa: '9.50 / 10.0',
          graduationDate: 1775174400,
          institutionName: 'National Institute of Advanced Technologies',
        },
      ],
      null,
      2
    )
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessResult(null);

    try {
      // 1. Generate PDF and calculate cryptographic hash
      const { hash: certHash } = await generateCertificatePDF({
        ...formData,
        tokenId: 'PREVIEW',
        issuedByRegistrar: activeAddress,
      });

      const payload = {
        ...formData,
        certificateHash: certHash,
      };

      if (issuanceType === 'direct') {
        const result = await issueDegree(payload);
        setSuccessResult({
          type: 'issued',
          tokenId: result.tokenId,
          credential: result.credential,
          latencyMs: result.latencyMs,
          gasUsed: result.gasUsed,
        });

        // Trigger celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Multi-sig Proposal
        const result = await proposeDegreeIssuance(payload);
        setSuccessResult({
          type: 'proposal_created',
          proposalId: result.proposalId,
          data: payload,
        });
      }
    } catch (err) {
      console.error('Issuance error:', err);
      alert('Issuance failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async () => {
    setLoading(true);
    setSuccessResult(null);

    try {
      const parsed = JSON.parse(batchJson);
      const batchWithHashes = [];

      for (const item of parsed) {
        const { hash } = await generateCertificatePDF({
          ...item,
          tokenId: 'BATCH',
          issuedByRegistrar: activeAddress,
        });
        batchWithHashes.push({
          ...item,
          certificateHash: hash,
        });
      }

      const res = await issueBatchDegrees(batchWithHashes);
      setSuccessResult({
        type: 'batch_issued',
        count: res.count,
        latencyMs: res.latencyMs,
        gasUsed: res.gasUsed,
      });

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (err) {
      alert('Invalid batch JSON or issuance error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              University Registrar Administration Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mint EIP-5192 Soulbound Academic Credentials permanently bound to verified graduate soul wallets.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'single'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Single Graduate Issuance
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'batch'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Batch Cohort Issuance
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successResult && (
        <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-emerald-300">
                {successResult.type === 'issued' && '🎉 Soulbound Degree Successfully Minted & Locked!'}
                {successResult.type === 'proposal_created' && '📝 Multi-Sig Issuance Proposal Created!'}
                {successResult.type === 'batch_issued' && '🎓 Batch Cohort Successfully Minted!'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {successResult.type === 'issued' &&
                  `Token #${successResult.tokenId} is permanently soulbound (EIP-5192) to ${successResult.credential.studentWallet}. Verification Latency: ${successResult.latencyMs}ms | Gas: ~${successResult.gasUsed} units.`}
                {successResult.type === 'proposal_created' &&
                  `Proposal ID #${successResult.proposalId} is waiting for Dean of Academic Affairs co-signature in the Dean Multi-Sig Portal.`}
                {successResult.type === 'batch_issued' &&
                  `Successfully minted ${successResult.count} credentials in batch. Average latency: ${(successResult.latencyMs / successResult.count).toFixed(1)}ms per degree.`}
              </p>

              {successResult.type === 'issued' && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setActiveTab('student')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg font-semibold text-white"
                  >
                    View in Student Soul Wallet
                  </button>
                  <button
                    onClick={() => setActiveTab('employer')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-semibold text-slate-200 border border-slate-700"
                  >
                    Verify as Employer
                  </button>
                </div>
              )}

              {successResult.type === 'proposal_created' && (
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('dean')}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg font-semibold text-white"
                  >
                    Open Dean Multi-Sig Portal →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Issuance Form */}
      {mode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Columns */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span>Candidate Academic Records</span>
              </h2>

              {/* Issuance Mode Toggle */}
              <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setIssuanceType('direct')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    issuanceType === 'direct'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Direct Mint
                </button>
                <button
                  type="button"
                  onClick={() => setIssuanceType('multisig')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    issuanceType === 'multisig'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dual Multi-Sig
                </button>
              </div>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Student Soulbound Ethereum Wallet Address *
                </label>
                <input
                  type="text"
                  name="studentWallet"
                  required
                  value={formData.studentWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">
                  Token will be permanently locked (EIP-5192) to this address.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll / Student ID *</label>
                  <input
                    type="text"
                    name="studentIdNumber"
                    required
                    value={formData.studentIdNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Degree Program *</label>
                  <input
                    type="text"
                    name="degreeName"
                    required
                    value={formData.degreeName}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Major / Specialization *</label>
                  <input
                    type="text"
                    name="majorSpecialization"
                    required
                    value={formData.majorSpecialization}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CGPA / Grade *</label>
                  <input
                    type="text"
                    name="cgpa"
                    required
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issuing University *</label>
                  <input
                    type="text"
                    name="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* IPFS Pinata Key (Optional) */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-400 text-[11px] mb-1">
                  Decentralized Storage Engine: Built-in Local IPFS (or paste Pinata JWT below)
                </label>
                <input
                  type="password"
                  value={pinataJwt}
                  onChange={(e) => setPinataJwt(e.target.value)}
                  placeholder="Optional Pinata JWT Token..."
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center space-x-2 transition-all ${
                  issuanceType === 'direct'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Processing Cryptographic Issuance & IPFS Pinning...</span>
                  </span>
                ) : issuanceType === 'direct' ? (
                  <span className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Mint & Lock Soulbound Degree (EIP-5192)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Create Multi-Sig Proposal for Dean Co-Signature</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Real-Time Live Diploma Preview */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Live Diploma Preview Canvas</span>
              <span className="text-emerald-400 font-mono">Dynamic Real-time Render</span>
            </div>
            <div className="transform scale-[0.85] origin-top-left sm:scale-100">
              <DiplomaCertificate
                credential={{
                  tokenId: 'NEW',
                  studentWallet: formData.studentWallet,
                  studentName: formData.studentName,
                  studentIdNumber: formData.studentIdNumber,
                  degreeName: formData.degreeName,
                  majorSpecialization: formData.majorSpecialization,
                  cgpa: formData.cgpa,
                  graduationDate: formData.graduationDate,
                  institutionName: formData.institutionName,
                  certificateHash: '0x' + 'f'.repeat(64),
                  ipfsCID: 'ipfs://QmPendingIssuanceCID',
                  issuedByRegistrar: activeAddress,
                  isRevoked: false,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Batch Issuance View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              <span>Batch Cohort Issuance Engine</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">JSON / CSV graduating payload</span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Mint multiple soulbound degrees simultaneously in a single optimized batch transaction to minimize administrative overhead and gas fees.
          </p>

          <textarea
            rows={12}
            value={batchJson}
            onChange={(e) => setBatchJson(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBatchSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Issuing Batch Cohort...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Execute Batch Issuance On-Chain</span>
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
