import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  Shield,
  Lock,
  Zap,
  CheckCircle2,
  Database,
  FileCheck,
  ArrowRight,
  Award,
  Layers,
  Sparkles,
  KeyRound,
  FileText,
  Clock,
  ShieldCheck,
  BookOpen,
  Scale,
} from 'lucide-react';
import { formatAddress } from '../services/hashUtil';

export default function OverviewPage({ setActiveTab }) {
  const { credentials, proposals, contractAddress, networkName } = useWeb3();

  const totalDegrees = credentials.length;
  const revokedDegrees = credentials.filter((c) => c.isRevoked).length;
  const validDegrees = totalDegrees - revokedDegrees;
  const pendingProposals = proposals.filter((p) => !p.executed).length;

  const shilpaCred = credentials.find((c) => c.tokenId === 7) || credentials[0];

  const objectives = [
    {
      num: '01',
      title: 'EIP-5192 Soulbound Smart Contracts (0xb45a3c0e)',
      desc: 'Programmable override of OpenZeppelin v5.2 _update() and approval functions enforces permanent EVM bytecode non-transferability (locked(id) == true).',
      status: 'Theorem 1 Proven',
    },
    {
      num: '02',
      title: 'Dual Multi-Signature Handshake (Eq. 5)',
      desc: 'OpenZeppelin AccessControl separates REGISTRAR_ROLE and DEAN_ROLE, preventing single-administrator issuance or rogue diploma mill collusion.',
      status: 'Registrar + Dean Co-Sign',
    },
    {
      num: '03',
      title: 'Deterministic SHA-256 & IPFS Merkle-DAG (Eq. 1–2)',
      desc: 'Client-side A4 PDF bitstream digest H_cert = SHA-256(B) is embedded inside JSON CertURI pinned via Base58btc CIDv0 (Qm...) on IPFS.',
      status: '100% Deterministic Hash',
    },
    {
      num: '04',
      title: 'Dynamic Disciplinary Revocation & Appeals',
      desc: 'Independent DISCIPLINARY_BOARD_ROLE executes revokeDegree() and appellate reinstateDegree() with immutable audit reason hashes on-chain.',
      status: 'Ethics Board Hooks Active',
    },
    {
      num: '05',
      title: 'Sub-1.5s Zero-Gas Employer Verification (Eq. 6)',
      desc: '4 verification vectors (Wallet+ID, PDF SHA-256 Drop, TxHash, jsQR Scan) execute via free eth_call static views in ~15–45 ms.',
      status: '0 Gas ($0.00)',
    },
  ];

  const equations = [
    {
      id: 'Eq. (1)',
      label: 'Certificate Bitstream Digest',
      formula: 'H_cert = SHA-256(B),  where B = [b0, b1, ..., b_(L-1)]',
      note: 'Client-side deterministic A4 PDF digest anchored prior to minting',
    },
    {
      id: 'Eq. (2)',
      label: 'IPFS Metadata URI Schema',
      formula: 'CertURI = IPFS_CID(JSON(Degree, CGPA, GradEpoch, H_cert, K_univ))',
      note: 'Content-addressed Base58btc CIDv0 stored in tokenURIs[tokenId]',
    },
    {
      id: 'Eq. (3–4)',
      label: 'EIP-5192 Transfer Invariant',
      formula: '∀ from ≠ 0 ∧ to ≠ 0 ⇒ revert ErrSoulboundNonTransferable()',
      note: 'Overrides _update(), approve(), and setApprovalForAll() unconditionally',
    },
    {
      id: 'Eq. (5)',
      label: 'Multi-Sig Execution Guard',
      formula: 'Exec(P_id) ⇔ (caller ∈ R) ∧ (P_id.deanApproved = true) ∧ (P_id.executed = false)',
      note: 'Eliminates single-key registrar issuance & prevents double-minting',
    },
    {
      id: 'Eq. (6)',
      label: 'Zero-Gas Verification Predicate',
      formula: 'Verify(T_id, S_wallet) = (ownerOf(T_id) == S_wallet) ∧ (¬cred.isRevoked) ∧ locked(T_id)',
      note: 'Evaluated via static EVM eth_call in ~15–45 ms at $0.00 cost',
    },
  ];

  const table1PriorArt = [
    {
      study: 'Centralized Portals (NSC, Digitary) [4]',
      ledger: 'Centralized RDBMS + X.509 PKI',
      lock: 'N/A (Closed Silo)',
      gov: 'Single-Admin DB Write',
      perf: '1–2 Weeks | $20–$100 fee',
      gap: 'Single point of failure; insider tampering risk; fee-heavy delays',
    },
    {
      study: 'Sharples & Domingue (2016) [13]',
      ledger: 'Conceptual Distributed Ledger',
      lock: 'None (No Smart Contracts)',
      gov: 'Conceptual Peer Validation',
      perf: 'Unimplemented | Unknown',
      gap: 'Purely conceptual; lacked smart contract automation & validation',
    },
    {
      study: 'MIT Blockcerts (Schmidt et al., 2016) [6]',
      ledger: 'Bitcoin Blockchain (OP_RETURN)',
      lock: 'None (Anchored Hash Only)',
      gov: 'Single-Key Institutional Wallet',
      perf: '10–60 Mins | Bitcoin Tx Fee',
      gap: 'Lacks EVM programmability; volatile fees; static revocation flaws',
    },
    {
      study: 'EduCTX (Turkanovic et al., 2018) [5]',
      ledger: 'Federated Custom Ark Consortium',
      lock: 'None (Credit Balance)',
      gov: 'Consortium Node Auth',
      perf: '5–15 Secs | Consortium Fee',
      gap: 'Requires dedicated institutional nodes; non-standard wallets',
    },
    {
      study: 'Buterin et al. (2022) SBT Whitepaper [9]',
      ledger: 'Ethereum EVM (Theoretical SBT)',
      lock: 'Conceptual Soul Binding',
      gov: 'Community Recovery Concept',
      perf: 'Theoretical | Gas-dependent',
      gap: 'Lacked institutional registrar multi-sig & dynamic revocation logic',
    },
    {
      study: 'Proposed Framework (SSIT / SSAHE, 2026)',
      ledger: 'EIP-5192 SBT + Dual Multi-Sig + IPFS',
      lock: 'Strict Bytecode Lock (locked=true)',
      gov: 'Dual Handshake (Registrar + Dean)',
      perf: '~15–45 ms | 0 Gas ($0.00)',
      gap: '100% fraud-proof; sub-1.5s zero-gas verification; dynamic revocation',
      highlight: true,
    },
  ];

  const table3Comparison = [
    {
      model: 'Traditional Manual (Clearinghouse / Postal)',
      latency: '7–14 Days',
      verifyCost: '$20–$100',
      issueCost: '$15–$50',
      forgery: '0% (Vulnerable)',
      nonTransfer: 'Non-enforced',
    },
    {
      model: 'MIT Blockcerts (Bitcoin OP_RETURN) [6]',
      latency: '10–60 Mins',
      verifyCost: 'Bitcoin Tx Fee',
      issueCost: '$2.50–$8.00',
      forgery: '100% (Cryptographic)',
      nonTransfer: 'None (Hash only)',
    },
    {
      model: 'EduCTX (Federated Ark Consortium) [5]',
      latency: '5–15 Secs',
      verifyCost: 'Consortium Fee',
      issueCost: '$0.10–$0.50',
      forgery: '100% (Cryptographic)',
      nonTransfer: 'None (Transferable)',
    },
    {
      model: 'Proposed Framework (EIP-5192 + IPFS, Ours)',
      latency: '~15–45 ms',
      verifyCost: '0 Gas ($0.00)',
      issueCost: '~$0.0026 (52,140 Gas)',
      forgery: '100% (SHA-256 + ECDSA)',
      nonTransfer: '100% EVM Reversion',
      highlight: true,
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-indigo-50/50 border-slate-200/80 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Sri Siddhartha Institute of Technology (SSIT), SSAHE Tumakuru • IEEE Research Platform</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Decentralized Academic Credential Verification &amp;{' '}
              <span className="gradient-text">Tamper-Proof Soulbound Registry</span>
            </h1>

            <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-700 space-y-1 shadow-sm">
              <div className="font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                <span>Authors: Shilpa H R (M.Tech, CSE) &amp; Veena N D (Asst. Prof., CSE)</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Department of Computer Science and Engineering, Sri Siddhartha Institute of Technology, Sri Siddhartha Academy of Higher Education, Tumakuru, India • Polygon PoS + EIP-5192 + IPFS
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Combines <strong className="text-slate-900">EIP-5192 Minimal Soulbound Tokens (0xb45a3c0e)</strong>,{' '}
              <strong className="text-slate-900">Dual Multi-Sig Governance</strong> (Registrar + Dean),{' '}
              <strong className="text-slate-900">Deterministic A4 PDF SHA-256 Anchoring</strong> on IPFS Merkle-DAG, and{' '}
              <strong className="text-slate-900">Zero-Gas Sub-45 ms Verification</strong> across N = {totalDegrees} live cohort credentials.
            </p>

            {/* Primary Action CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => setActiveTab('employer')}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Credentials (0 Gas)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab('registrar')}
                className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm px-5 py-3 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <span>Mint Degree (Registrar)</span>
              </button>

              <button
                onClick={() => setActiveTab('dean')}
                className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-sm px-4 py-3 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-amber-700" />
                <span>Dean Multi-Sig ({pendingProposals} Pending)</span>
              </button>
            </div>
          </div>

          {/* Right: Live SSIT Credential Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl p-6 bg-white border-2 border-emerald-500/50 shadow-xl animate-hologram">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-serif-title text-xs font-bold text-slate-900 tracking-wide">
                      SSIT / SSAHE TUMAKURU
                    </div>
                    <div className="text-[9px] text-slate-500">Senate Official SBT Registry (SSITSBT)</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                  LOCKED SBT #{shilpaCred?.tokenId || 7}
                </span>
              </div>

              <div className="py-5 space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Awarded To</span>
                  <div className="text-base font-bold text-slate-900">
                    {shilpaCred?.studentName || 'Shilpa H R'}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700">
                    USN: {shilpaCred?.studentIdNumber || '1SI24MAI01'}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-800">
                    {shilpaCred?.degreeName || 'Master of Technology (M.Tech)'}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {shilpaCred?.majorSpecialization || 'Computer Science and Engineering'}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-mono text-[10px]">
                    {shilpaCred?.cgpa || '9.84 / 10.0'}
                  </span>
                  <span className="text-indigo-800 font-bold text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Dual Multi-Sig Cohort 2
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-[10px] font-mono">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Soulbound Owner:</span>
                  <span className="text-slate-900 font-bold">
                    {formatAddress(shilpaCred?.studentWallet || '0x90F79bf6EB2c4f870365E785982E1f101E93b906')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>EIP-5192 locked(id):</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>true (Non-Transferable)</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Paper Mean Latency:</span>
                  <span className="text-purple-700 font-bold">28.4 ms (p95: 35.6 ms)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-6 glass-card-hover bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Experimental Cohort (Table II)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">{totalDegrees} SBTs</div>
          <div className="mt-1 text-xs text-slate-600 font-mono">
            <span className="text-emerald-700 font-semibold">{validDegrees} Active</span> •{' '}
            <span className="text-rose-700 font-semibold">{revokedDegrees} Revoked</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 glass-card-hover bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification Latency
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-emerald-700 tracking-tight">~15–45 ms</div>
          <div className="mt-1 text-xs text-slate-600 font-mono">Mean 28.4 ms • &lt; 1.5s SLA</div>
        </div>

        <div className="glass-panel rounded-2xl p-6 glass-card-hover bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Employer Gas Cost
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">0 Gas</div>
          <div className="mt-1 text-xs text-slate-600 font-mono">Static eth_call ($0.00 / query)</div>
        </div>

        <div className="glass-panel rounded-2xl p-6 glass-card-hover bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Polygon PoS Issuance
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">$0.0026</div>
          <div className="mt-1 text-xs text-slate-600 font-mono">52,140 gas (46,200 batch)</div>
        </div>
      </div>

      {/* Figure 1 System Architecture Diagram & Formal Cryptographic Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 glass-panel p-6 sm:p-7 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Figure 1: System Architecture Overview
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Polygon PoS + IPFS + EIP-5192</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 overflow-hidden">
            <img
              src="/architecture-diagram.png"
              alt="Figure 1: Decentralized Academic Credential Issuance & Verification Architecture"
              className="w-full h-auto rounded-lg object-contain bg-white"
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Architecture Flow:</strong> University Registrar generates deterministic A4 PDF &amp; SHA-256 digest <code className="bg-slate-100 px-1 rounded">H_cert</code>, pins EIP-721 metadata to IPFS (<code className="bg-slate-100 px-1 rounded">CertURI</code>), and initiates Multi-Sig Handshake co-signed by the Dean before irreversible Soulbound minting to the Graduate Wallet.
          </p>
        </div>

        <div className="lg:col-span-6 glass-panel p-6 sm:p-7 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Formal Mathematical Model (Eq. 1 – Eq. 6)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Section III</span>
          </div>

          <div className="space-y-3">
            {equations.map((eq) => (
              <div key={eq.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700 font-mono">{eq.id}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{eq.label}</span>
                </div>
                <div className="font-mono text-xs text-slate-900 font-semibold break-all bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  {eq.formula}
                </div>
                <div className="text-[11px] text-slate-500">{eq.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table I: Related Works / Prior Art Matrix */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Table I: Qualitative &amp; Architectural Comparison with Related Academic Credentialing Studies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive literature evaluation against Centralized Clearinghouses, Conceptual DLT, MIT Blockcerts, EduCTX, and Theoretical SBTs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-semibold">
                <th className="py-3 px-3">Prior Study &amp; Architecture</th>
                <th className="py-3 px-3">Ledger / Storage Paradigm</th>
                <th className="py-3 px-3">EVM Non-Transferability</th>
                <th className="py-3 px-3">Issuance Governance</th>
                <th className="py-3 px-3">Latency &amp; Cost</th>
                <th className="py-3 px-3">Key Gap / Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table1PriorArt.map((row) => (
                <tr key={row.study} className={row.highlight ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50/70'}>
                  <td className={`py-3 px-3 ${row.highlight ? 'font-bold text-emerald-900' : 'font-semibold text-slate-800'}`}>
                    {row.study}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{row.ledger}</td>
                  <td className="py-3 px-3 text-slate-700 font-mono text-[11px]">{row.lock}</td>
                  <td className="py-3 px-3 text-slate-600">{row.gov}</td>
                  <td className={`py-3 px-3 font-mono text-[11px] ${row.highlight ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                    {row.perf}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{row.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table III: Empirical Comparison Matrix */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 bg-white">
        <h2 className="text-base font-bold text-slate-900">
          Table III: Comparative Credential Verification Performance Across Architectures
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-semibold">
                <th className="py-3.5 px-4">Model &amp; Architecture</th>
                <th className="py-3.5 px-4">Verification Latency</th>
                <th className="py-3.5 px-4">Verification Cost</th>
                <th className="py-3.5 px-4">Issuance Cost / Degree</th>
                <th className="py-3.5 px-4">Forgery Resistance</th>
                <th className="py-3.5 px-4">EVM Non-Transferability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table3Comparison.map((r) => (
                <tr key={r.model} className={r.highlight ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}>
                  <td className={`py-3.5 px-4 font-bold ${r.highlight ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {r.model}
                  </td>
                  <td className={`py-3.5 px-4 font-mono ${r.highlight ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                    {r.latency}
                  </td>
                  <td className={`py-3.5 px-4 font-mono ${r.highlight ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                    {r.verifyCost}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{r.issueCost}</td>
                  <td className={`py-3.5 px-4 font-semibold ${r.highlight ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {r.forgery}
                  </td>
                  <td className={`py-3.5 px-4 font-semibold ${r.highlight ? 'text-indigo-800' : 'text-slate-600'}`}>
                    {r.nonTransfer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Objectives Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Research Engineering Milestones</h2>
            <p className="text-xs text-slate-500">
              Active Registry Address: <span className="font-mono text-slate-700">{formatAddress(contractAddress)}</span> • Network: {networkName}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className="text-xs font-bold text-indigo-700 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Open Tables II, IV &amp; V Benchmarks →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {objectives.map((obj) => (
            <div key={obj.num} className="glass-panel rounded-2xl p-6 space-y-3 bg-white hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-slate-200">{obj.num}</span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {obj.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{obj.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
