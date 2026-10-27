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

  const presets = [
    {
      studentWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      studentName: 'Elena Rostova',
      studentIdNumber: 'MTECH-AI-2026-099',
      degreeName: 'Master of Technology (M.Tech)',
      majorSpecialization: 'Artificial Intelligence & Machine Learning',
      cgpa: '9.75 / 10.0 (Gold Medalist)',
      graduationDate: 1775174400,
      institutionName: 'National Institute of Advanced Technologies',
    },
    {
      studentWallet: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      studentName: 'Aarav Patel',
      studentIdNumber: 'MTECH-CS-2026-042',
      degreeName: 'Master of Technology (M.Tech)',
      majorSpecialization: 'Distributed Systems & Blockchain Architecture',
      cgpa: '9.60 / 10.0',
      graduationDate: 1775174400,
      institutionName: 'National Institute of Advanced Technologies',
    },
    {
      studentWallet: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
      studentName: 'Sophia Chen',
      studentIdNumber: 'MTECH-CYBER-2026-081',
      degreeName: 'Master of Technology (M.Tech)',
      majorSpecialization: 'Applied Cryptography & Zero-Knowledge Proofs',
      cgpa: '9.82 / 10.0 (Summa Cum Laude)',
      graduationDate: 1775174400,
      institutionName: 'National Institute of Advanced Technologies',
    },
  ];

  const applyPreset = (preset) => {
    setFormData(preset);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                University Registrar Administration Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Mint EIP-5192 Soulbound Academic Credentials permanently locked to verified graduate soul wallets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 relative z-10">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'single'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Graduate
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'batch'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Cohort (CSV/JSON)
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successResult && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-slate-800 animate-in fade-in zoom-in-95 duration-200 shadow-md">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-emerald-900">
                {successResult.type === 'issued' && '🎉 Soulbound Degree Successfully Minted & Locked!'}
                {successResult.type === 'proposal_created' && '📝 Multi-Sig Issuance Proposal Created!'}
                {successResult.type === 'batch_issued' && '🎓 Batch Cohort Successfully Minted!'}
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {successResult.type === 'issued' &&
                  `Token #${successResult.tokenId} is permanently soulbound (EIP-5192) to ${successResult.credential.studentWallet}. Verification Latency: ${successResult.latencyMs}ms | Gas: ~${successResult.gasUsed} units.`}
                {successResult.type === 'proposal_created' &&
                  `Proposal ID #${successResult.proposalId} is awaiting Dean of Academic Affairs co-signature in the Dean Multi-Sig Portal.`}
                {successResult.type === 'batch_issued' &&
                  `Successfully minted ${successResult.count} credentials in batch. Average latency: ${(successResult.latencyMs / successResult.count).toFixed(1)}ms per degree.`}
              </p>

              {successResult.type === 'issued' && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('student')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl font-bold text-white shadow-sm transition-all"
                  >
                    View in Student Soul Wallet →
                  </button>
                  <button
                    onClick={() => setActiveTab('employer')}
                    className="text-xs bg-white hover:bg-slate-50 px-4 py-2 rounded-xl font-semibold text-slate-700 border border-slate-300 transition-all shadow-sm"
                  >
                    Verify as Employer
                  </button>
                </div>
              )}

              {successResult.type === 'proposal_created' && (
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('dean')}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl font-bold text-white shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Open Dean Multi-Sig Portal to Co-Sign →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Issuance Form */}
      {mode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Columns */}
          <div className="lg:col-span-6 glass-panel p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  <span>Candidate Academic Records</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct issuance or Senate dual-signature proposal
                </p>
              </div>

              {/* Issuance Mode Toggle */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setIssuanceType('direct')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                    issuanceType === 'direct'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Direct Mint
                </button>
                <button
                  type="button"
                  onClick={() => setIssuanceType('multisig')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                    issuanceType === 'multisig'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dual Multi-Sig
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Presets */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 text-[11px] font-medium flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Fill sample candidate:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 font-medium hover:text-slate-900 transition-colors"
                  >
                    {p.studentName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Student Soulbound Ethereum Wallet Address <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  name="studentWallet"
                  required
                  value={formData.studentWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Token will be permanently locked (EIP-5192) to this address. Transfers strictly revert.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Student Full Name <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Roll / Student ID Number <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentIdNumber"
                    required
                    value={formData.studentIdNumber}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Degree Program <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="degreeName"
                    required
                    value={formData.degreeName}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Major / Specialization <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="majorSpecialization"
                    required
                    value={formData.majorSpecialization}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Cumulative CGPA / Grade <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="cgpa"
                    required
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Awarding University <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* IPFS Pinata Key (Optional) */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-600 text-[11px] font-medium">
                    Decentralized Storage: Local IPFS Simulator (or custom Pinata JWT)
                  </label>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">CID v1 Enabled</span>
                </div>
                <input
                  type="password"
                  value={pinataJwt}
                  onChange={(e) => setPinataJwt(e.target.value)}
                  placeholder="Paste optional Pinata JWT Token..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-[11px] text-slate-800 font-mono focus:border-emerald-500 focus:outline-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] ${
                  issuanceType === 'direct'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20'
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
                    <span>Submit Multi-Sig Proposal for Dean Co-Signature</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Real-Time Live Diploma Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time SVG/PDF Diploma Renderer</span>
              </span>
              <span className="text-[11px] text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                Live Preview
              </span>
            </div>

            <div className="glass-panel p-3 sm:p-5 rounded-2xl relative shadow-md">
              <div className="transform scale-[0.8] origin-top sm:scale-100">
                <DiplomaCertificate
                  credential={{
                    tokenId: 'PREVIEW',
                    studentWallet: formData.studentWallet,
                    studentName: formData.studentName,
                    studentIdNumber: formData.studentIdNumber,
                    degreeName: formData.degreeName,
                    majorSpecialization: formData.majorSpecialization,
                    cgpa: formData.cgpa,
                    graduationDate: formData.graduationDate,
                    institutionName: formData.institutionName,
                    certificateHash: '0x' + 'e'.repeat(64),
                    ipfsCID: 'ipfs://QmPendingIssuanceCID',
                    issuedByRegistrar: activeAddress,
                    isRevoked: false,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Batch Issuance View */
        <div className="glass-panel p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="h-5 w-5 text-emerald-600" />
              <span>Batch Cohort Issuance Engine</span>
            </h2>
            <span className="text-xs text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-semibold">
              JSON graduating payload
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Mint multiple soulbound degrees simultaneously in a single atomic batch transaction. Reduces average administrative gas fees by ~42% compared to sequential single mints.
          </p>

          <textarea
            rows={12}
            value={batchJson}
            onChange={(e) => setBatchJson(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-4 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none shadow-sm"
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleBatchSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all"
            >
              {loading ? (
                <span className="flex items-center space-x-2 text-white">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Issuing Batch Cohort...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2 text-white">
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
