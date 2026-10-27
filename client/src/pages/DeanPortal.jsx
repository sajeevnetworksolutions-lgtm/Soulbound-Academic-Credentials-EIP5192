import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress, formatDate } from '../services/hashUtil';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DeanPortal({ setActiveTab }) {
  const { proposals, approveProposalByDean, executeProposal, activeAddress } = useWeb3();
  const [loadingId, setLoadingId] = useState(null);

  const pendingApprovalProposals = proposals.filter((p) => !p.deanApproved && !p.executed);
  const approvedReadyToExecute = proposals.filter((p) => p.deanApproved && !p.executed);
  const executedProposals = proposals.filter((p) => p.executed);

  const handleApprove = async (proposalId) => {
    setLoadingId(`approve-${proposalId}`);
    try {
      await approveProposalByDean(proposalId);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleExecute = async (proposalId) => {
    setLoadingId(`exec-${proposalId}`);
    try {
      const res = await executeProposal(proposalId);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      alert(`Degree successfully minted and locked! Token ID #${res.tokenId}`);
    } catch (err) {
      alert('Execution failed: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-sm">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Dean of Academic Affairs Multi-Signature Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Dual-authorization protocol: Verify Registrar degree proposals and co-sign on-chain before soulbound minting.
              </p>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2.5 mt-6 relative z-10">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingApprovalProposals.length} Pending Dean Signature</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs font-semibold flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>{approvedReadyToExecute.length} Ready for Blockchain Execution</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{executedProposals.length} Executed & Minted</span>
          </div>
        </div>
      </div>

      {/* 1. Pending Dean Approvals */}
      <div className="glass-panel p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Proposals Awaiting Dean Co-Signature ({pendingApprovalProposals.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Requires DEAN_ROLE</span>
        </div>

        {pendingApprovalProposals.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No pending proposals requiring Dean authorization at this time. Use the Registrar Portal to propose candidates.
          </div>
        ) : (
          <div className="space-y-3.5">
            {pendingApprovalProposals.map((prop) => (
              <div
                key={prop.proposalId}
                className="bg-white p-5 rounded-2xl flex flex-col lg:flex-row justify-between lg:items-center gap-4 border border-slate-200 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-lg">
                      Proposal #{prop.proposalId}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{prop.studentName}</h3>
                    <span className="text-xs text-slate-500">({prop.studentIdNumber})</span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <strong className="text-slate-900">{prop.degreeName}</strong> • {prop.majorSpecialization}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] flex flex-wrap gap-x-4">
                      <span>Soul Wallet: {formatAddress(prop.studentWallet)}</span>
                      <span>Grade: {prop.cgpa}</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[10px] truncate max-w-xl">
                      Proposed by Registrar: {formatAddress(prop.proposedBy)} • Cert Hash: {prop.certificateHash}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleApprove(prop.proposalId)}
                    disabled={loadingId === `approve-${prop.proposalId}`}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all transform active:scale-[0.98]"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>
                      {loadingId === `approve-${prop.proposalId}`
                        ? 'Co-Signing On-Chain...'
                        : 'Co-Sign & Authorize as Dean'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Ready for On-Chain Execution */}
      {approvedReadyToExecute.length > 0 && (
        <div className="glass-panel p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Authorized by Dean — Ready for On-Chain Mint ({approvedReadyToExecute.length})</span>
            </h2>
            <span className="text-[11px] text-emerald-700 font-mono font-semibold">Consensus Reached</span>
          </div>

          <div className="space-y-3.5">
            {approvedReadyToExecute.map((prop) => (
              <div
                key={prop.proposalId}
                className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm flex flex-col lg:flex-row justify-between lg:items-center gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                      Proposal #{prop.proposalId}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{prop.studentName}</h3>
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Co-Signed by Dean
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5">
                    {prop.degreeName} • {prop.majorSpecialization}
                  </div>
                </div>

                <button
                  onClick={() => handleExecute(prop.proposalId)}
                  disabled={loadingId === `exec-${prop.proposalId}`}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all transform active:scale-[0.98]"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>
                    {loadingId === `exec-${prop.proposalId}`
                      ? 'Executing Mint...'
                      : 'Execute Dual-Sig Minting'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Proposal History Ledger */}
      <div className="glass-panel p-6 sm:p-7 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
          <FileText className="h-4 w-4 text-slate-400" />
          <span>Multi-Signature Ledger Audit Trail</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Proposal ID</th>
                <th className="py-3 px-3">Graduate</th>
                <th className="py-3 px-3">Degree</th>
                <th className="py-3 px-3">Dean Signature</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.map((prop) => (
                <tr key={prop.proposalId} className="hover:bg-slate-50 font-mono text-[11px] transition-colors">
                  <td className="py-3 px-3 text-slate-600">#{prop.proposalId}</td>
                  <td className="py-3 px-3 font-sans font-bold text-slate-900">
                    {prop.studentName}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-700">{prop.degreeName}</td>
                  <td className="py-3 px-3 text-slate-500">
                    {prop.deanApproved ? (
                      <span className="text-emerald-700 font-sans text-xs flex items-center space-x-1 font-semibold">
                        <span>✓ Signed</span>
                        <span className="text-slate-400 font-mono text-[10px]">({formatAddress(prop.approvedByDean)})</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-sans text-xs font-semibold">Pending Co-Signature</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {prop.executed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-sans text-[10px] font-bold">
                        Minted (Token #{prop.mintedTokenId})
                      </span>
                    ) : prop.deanApproved ? (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-300 font-sans text-[10px] font-bold">
                        Authorized
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 font-sans text-[10px] font-bold">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
