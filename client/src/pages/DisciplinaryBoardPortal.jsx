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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Academic Disciplinary & Ethics Board Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Dynamic on-chain credential suspension, revocation, and appeal reinstatement hooks (Objective 4).
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200 ${
            actionMessage.type === 'revoked'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {actionMessage.type === 'revoked' ? (
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revocation Trigger Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Initiate Credential Revocation Hook</span>
          </h2>

          <form onSubmit={handleRevoke} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Select Active Credential to Revoke
              </label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              <label className="block text-slate-300 font-semibold mb-1">
                Disciplinary Board Justification & Inquiry Reference *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for suspension or revocation..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>{loading ? 'Executing Revocation Hook...' : 'Execute On-Chain Revocation'}</span>
            </button>
          </form>
        </div>

        {/* Revoked Credentials & Appeals Reinstatement */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>Currently Revoked Credentials ({revokedCredentials.length})</span>
          </h2>

          {revokedCredentials.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No credentials currently revoked. Academic integrity in good standing.
            </div>
          ) : (
            <div className="space-y-3">
              {revokedCredentials.map((c) => (
                <div
                  key={c.tokenId}
                  className="bg-slate-800/60 border border-rose-500/30 rounded-xl p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-400">Token #{c.tokenId}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold">
                      Revoked
                    </span>
                  </div>

                  <div className="font-bold text-slate-200">{c.studentName}</div>
                  <div className="text-slate-400 text-[11px]">{c.degreeName}</div>
                  <div className="text-rose-300 text-[11px] bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                    <strong>Reason: </strong> {c.revocationReason}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleReinstate(c.tokenId)}
                      disabled={loading}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span>Full Academic Integrity & Revocation Audit Ledger</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Token ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Degree</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reason / Details</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {credentials.map((c) => (
                <tr key={c.tokenId} className="hover:bg-slate-800/30 text-[11px]">
                  <td className="py-2.5 px-3 font-mono text-slate-300">#{c.tokenId}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{c.studentName}</td>
                  <td className="py-2.5 px-3 text-slate-400">{c.degreeName}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                        c.isRevoked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {c.isRevoked ? 'Revoked' : 'Active & Valid'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                    {c.isRevoked ? c.revocationReason : 'In Good Standing'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">
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
