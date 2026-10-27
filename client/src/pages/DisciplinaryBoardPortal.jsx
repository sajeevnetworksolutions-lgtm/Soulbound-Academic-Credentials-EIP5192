import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress, formatDate } from '../services/hashUtil';
import {
  AlertOctagon,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

export default function DisciplinaryBoardPortal() {
  const { credentials, revokeDegree, reinstateDegree, activeAddress } = useWeb3();

  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [reason, setReason] = useState(
    'Academic Dishonesty: Plagiarized thesis empirical results discovered in post-publication audit.'
  );
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const revokedCredentials = credentials.filter((c) => c.isRevoked);
  const activeCredentials = credentials.filter((c) => !c.isRevoked);

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!selectedTokenId) {
      alert('Please select or input a valid Token ID to revoke');
      return;
    }

    setLoading(true);
    setActionMessage(null);
    try {
      const res = await revokeDegree(selectedTokenId, reason);
      setActionMessage({
        type: 'revoked',
        text: `Credential #${selectedTokenId} has been formally REVOKED on-chain. Reference Hash: ${res.reasonHash.substring(0, 16)}...`,
      });
      setSelectedTokenId('');
    } catch (err) {
      alert('Revocation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReinstate = async (tokenId) => {
    setLoading(true);
    setActionMessage(null);
    try {
      await reinstateDegree(tokenId, 'Appellate Board exoneration and formal degree reinstatement.');
      setActionMessage({
        type: 'reinstated',
        text: `Credential #${tokenId} has been successfully REINSTATED to active validity.`,
      });
    } catch (err) {
      alert('Reinstatement failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Academic Disciplinary & Ethics Board Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Dynamic on-chain credential suspension, revocation, and appeal reinstatement hooks (Objective 4).
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200 shadow-sm ${
            actionMessage.type === 'revoked'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {actionMessage.type === 'revoked' ? (
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Revocation Trigger Form */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Initiate Credential Revocation Hook</span>
            </h2>
            <span className="text-[11px] text-rose-700 font-mono font-semibold">DISCIPLINARY_BOARD_ROLE</span>
          </div>

          <form onSubmit={handleRevoke} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Select Active Credential to Revoke
              </label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all shadow-sm"
              >
                <option value="">-- Choose Credential --</option>
                {activeCredentials.map((c) => (
                  <option key={c.tokenId} value={c.tokenId}>
                    Token #{c.tokenId} - {c.studentName} ({c.degreeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Disciplinary Board Justification & Inquiry Reference *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for suspension or revocation..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>{loading ? 'Executing Revocation Hook...' : 'Execute On-Chain Revocation'}</span>
            </button>
          </form>
        </div>

        {/* Revoked Credentials & Appeals Reinstatement */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <span>Currently Revoked Credentials ({revokedCredentials.length})</span>
            </h2>
            <span className="text-[11px] text-amber-700 font-mono font-semibold">Appellate Review</span>
          </div>

          {revokedCredentials.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No credentials currently revoked. All issued degrees are in good standing.
            </div>
          ) : (
            <div className="space-y-3">
              {revokedCredentials.map((c) => (
                <div
                  key={c.tokenId}
                  className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 text-xs space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-700">Token #{c.tokenId}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                      Revoked
                    </span>
                  </div>

                  <div className="font-bold text-slate-900">{c.studentName}</div>
                  <div className="text-slate-600 text-[11px]">{c.degreeName}</div>
                  <div className="text-rose-900 text-[11px] bg-white p-2.5 rounded-lg border border-rose-200 leading-relaxed shadow-sm">
                    <strong>Reason: </strong> {c.revocationReason}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleReinstate(c.tokenId)}
                      disabled={loading}
                      className="bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm flex items-center space-x-1.5 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Reinstate Credential (Pass Appeal)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disciplinary Audit Ledger */}
      <div className="glass-panel p-6 sm:p-7 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
          <FileText className="h-4 w-4 text-slate-400" />
          <span>Full Academic Integrity & Revocation Audit Ledger</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Token ID</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Degree</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Reason / Details</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {credentials.map((c) => (
                <tr key={c.tokenId} className="hover:bg-slate-50 text-[11px] transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-600">#{c.tokenId}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{c.studentName}</td>
                  <td className="py-3 px-3 text-slate-700">{c.degreeName}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        c.isRevoked
                          ? 'bg-rose-50 text-rose-700 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      {c.isRevoked ? 'Revoked' : 'Active & Valid'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                    {c.isRevoked ? c.revocationReason : 'In Good Standing'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">
                    {formatDate(c.revocationTimestamp || c.issuanceTimestamp)}
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
