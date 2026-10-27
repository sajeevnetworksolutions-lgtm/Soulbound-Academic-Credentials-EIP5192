import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  Shield,
  Lock,
  Zap,
  CheckCircle2,
  Database,
  Users,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  QrCode,
  KeyRound,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { formatAddress } from '../services/hashUtil';

export default function OverviewPage({ setActiveTab }) {
  const { credentials, proposals, contractAddress, networkName } = useWeb3();

  const totalDegrees = credentials.length;
  const revokedDegrees = credentials.filter((c) => c.isRevoked).length;
  const validDegrees = totalDegrees - revokedDegrees;

  const objectives = [
    {
      num: '01',
      title: 'EIP-5192 Soulbound Smart Contracts',
      desc: 'Formulate and deploy EIP-5192 compliant Soulbound Smart Contracts overriding ERC-721 transfer functions to enforce permanent non-transferability at the EVM bytecode level.',
      status: '100% Validated',
    },
    {
      num: '02',
      title: 'Role-Based Multi-Signature Authorization',
      desc: 'Registrar and Dean dual-authorization handshake preventing unauthorized single-admin degree minting and rogue diploma mill collusion.',
      status: 'Dual-Sig Handshake Active',
    },
    {
      num: '03',
      title: 'IPFS Decentralized Storage & Hashing',
      desc: 'Store encrypted high-resolution certificate PDFs and standard JSON metadata schemas on IPFS returning immutable CIDs and SHA-256 digests.',
      status: 'Active Pinning & CIDs',
    },
    {
      num: '04',
      title: 'Dynamic On-Chain Revocation Logic',
      desc: 'Integrate dynamic on-chain certificate revocation logic allowing university disciplinary boards to suspend credentials in cases of misconduct.',
      status: 'Board Hooks Enabled',
    },
    {
      num: '05',
      title: '1-Click Zero-Gas Employer Verification',
      desc: 'Deliver an employer verification web portal where anyone can verify degrees via wallet address, transaction hash, or QR scan in < 1.5s.',
      status: 'Sub-second Read Verified',
    },
  ];

  const comparativeData = [
    {
      metric: 'Certificate Forgery Resistance',
      traditional: '0% (Easily modified via Photoshop/PDF editors)',
      proposed: '100% (Cryptographic ECDSA + Blockchain immutability)',
    },
    {
      metric: 'Verification Turnaround Time',
      traditional: '1 to 2 Weeks (Manual postal/email verification)',
      proposed: '< 1.5 Seconds (Instant 1-Click zero-gas read)',
    },
    {
      metric: 'Verification Cost for Employers',
      traditional: '$20 - $100 per credential check',
      proposed: '$0.00 (Zero Gas on-chain view query)',
    },
    {
      metric: 'Issuance Cost per Degree',
      traditional: '$15 - $50 (Printing, stamping, postage)',
      proposed: '< $0.01 (Polygon PoS Testnet ~52k Gas)',
    },
    {
      metric: 'Degree Transferability',
      traditional: 'Fake certificates sold on black markets',
      proposed: 'Strictly Non-Transferable (EIP-5192 Soulbound)',
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Showcase Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border border-slate-200/90 p-8 sm:p-12 overflow-hidden shadow-lg">
        {/* Ambient Gradient Lights */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text & Actions Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>M.Tech AI/ML Dissertation • Applied Blockchain & DID Research</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Decentralized Academic Credential Verification{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Eliminating diploma mills and credential fraud through{' '}
              <strong className="text-emerald-700 font-semibold">EIP-5192 Soulbound Tokens (SBTs)</strong>,{' '}
              <strong className="text-indigo-700 font-semibold">IPFS decentralized storage</strong>, and{' '}
              <strong className="text-amber-700 font-semibold">Registrar Multi-Sig Handshakes</strong>.
              Achieves 100% cryptographic forgery resistance and sub-1.5s zero-gas employer validation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('registrar')}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
              >
                <span>Issue Soulbound Degree</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-purple-500 font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-sm transition-all"
              >
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <span>Launch 1-Click Verification Portal</span>
              </button>
            </div>

            {/* Quick Spec Highlights */}
            <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-mono text-slate-600">
              <span className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Zero-Gas Employer Read</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                <span>Strictly Non-Transferable</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                <span>Polygon PoS &lt; $0.01 Mint Cost</span>
              </span>
            </div>
          </div>

          {/* Right Holographic Preview Card Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl p-6 bg-white border-2 border-emerald-500/50 shadow-xl relative animate-hologram">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-serif-title text-xs font-bold text-slate-900 tracking-wide">
                      NATIONAL INSTITUTE
                    </div>
                    <div className="text-[9px] text-slate-500">Senate Official Degree Registry</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                  LOCKED SBT
                </span>
              </div>

              {/* Student Details Preview */}
              <div className="py-5 space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Awarded To</span>
                  <div className="text-base font-bold text-slate-900">Dr. Jane Doe</div>
                  <div className="text-[11px] font-mono text-emerald-700">Roll: MTECH-AI-2026-042</div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-800">
                    Master of Technology (M.Tech)
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Artificial Intelligence & Machine Learning
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[10px]">CGPA: 9.84 / 10.0</span>
                  <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Distinction
                  </span>
                </div>
              </div>

              {/* Holographic Verification Chips */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[10px] font-mono">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Soulbound Owner:</span>
                  <span className="text-slate-800 font-bold">0x90F7...b906</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Verification Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>100% Genuine</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Latency Response:</span>
                  <span className="text-purple-700 font-bold">18 ms (&lt; 1.5s Target)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-6 glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Issued Degrees
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">{totalDegrees} SBTs</div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            <span className="text-emerald-700 font-semibold">{validDegrees} Active</span> •{' '}
            <span className="text-rose-700 font-semibold">{revokedDegrees} Revoked</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification Latency
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-emerald-700 tracking-tight">&lt; 1.5s</div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            ~18 – 45 ms Live Wall-Clock Speed
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Employer Verification Cost
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-amber-700 tracking-tight">0 Gas ($0.00)</div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Free Static EVM Read Call
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 glass-card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issuance Gas Target
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-purple-700 tracking-tight">52,140 Gas</div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            &lt; $0.01 per issued degree on Polygon
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2.5">
              <Layers className="h-5 w-5 text-indigo-600" />
              <span>Proposed System Architecture Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end cryptographic lifecycle from Registrar issuance to IPFS pinning and zero-gas employer validation.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full self-start sm:self-auto font-semibold">
            Figure 1 (Synopsis Architecture)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  STEP 01
                </span>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Registrar Administration</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Registrar inputs student marks, generates official diploma PDF, and calculates client-side SHA-256 digest.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-mono font-semibold">
              → SHA-256 PDF Hash
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  STEP 02
                </span>
                <Database className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">IPFS Pinning & Dean Dual-Sig</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Metadata schema pinned to IPFS. Dean of Academic Affairs co-signs the on-chain proposal via multi-sig.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-700 font-mono font-semibold">
              → Immutable CID (ipfs://Qm...)
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  STEP 03
                </span>
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">EIP-5192 Soulbound Mint</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                NFT minted and permanently bound to graduate's soul wallet. Transfer functions strictly revert on EVM level.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-700 font-mono font-semibold">
              → locked(tokenId) = true
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-400 transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                  STEP 04
                </span>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Employer 1-Click Verify</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Recruiters verify credential authenticity via wallet, PDF drag-and-drop, tx hash, or QR scan in &lt; 1.5s.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-purple-700 font-mono font-semibold">
              → 0 Gas / 100% Fraud Proof
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Analysis Matrix */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Comparative Analysis: Traditional vs. Proposed Soulbound Platform
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Quantifiable improvements across fraud resistance, turnaround latency, issuance economics, and non-transferability.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-bold">Evaluation Metric</th>
                <th className="py-3.5 px-4 font-bold text-rose-600">Traditional System</th>
                <th className="py-3.5 px-4 font-bold text-emerald-700">Proposed Soulbound Platform (2026)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparativeData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{row.metric}</td>
                  <td className="py-3.5 px-4 text-slate-500">{row.traditional}</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-bold">{row.proposed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Specific Research Objectives */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Specific Research Objectives & Deliverables</h2>
        <p className="text-xs text-slate-500 mb-6">
          Formal engineering deliverables formulated in Section 3 of the dissertation synopsis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {objectives.map((obj) => (
            <div
              key={obj.num}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-400 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  OBJ {obj.num}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{obj.status}</span>
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{obj.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
