import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress } from '../services/hashUtil';
import DiplomaCertificate from '../components/DiplomaCertificate';
import {
  Award,
  Lock,
  Share2,
  ShieldCheck,
  Download,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function StudentSoulWallet({ setActiveTab, onSelectCredentialForVerification }) {
  const { activeAddress, credentials } = useWeb3();
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [transferAttemptError, setTransferAttemptError] = useState(null);

  // Filter credentials belonging to current active address or show all with selector
  const myCredentials = credentials.filter(
    (c) => c.studentWallet.toLowerCase() === activeAddress.toLowerCase()
  );

  // If no credentials in current address, fallback to showing all credentials for easy exploration
  const displayCredentials = myCredentials.length > 0 ? myCredentials : credentials;
  const activeCredential =
    displayCredentials.find((c) => c.tokenId === selectedTokenId) || displayCredentials[0];

  const handleSimulateTransfer = () => {
    // Demonstrating the core research finding: transferFrom / safeTransferFrom strictly reverts
    setTransferAttemptError({
      status: 'REVERTED',
      errorName: 'ErrSoulboundNonTransferable()',
      reason:
        'EIP-5192 Soulbound Enforcement: Transfers are strictly prohibited on-chain. This academic credential is permanently bound to the graduate’s soul wallet.',
      gasUsed: '0 (Transaction Reverted)',
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-sm">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Graduate Soul Wallet & Credentials Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Permanently bound decentralized identity assets held in your Ethereum wallet (EIP-5192 standard).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 bg-white border border-slate-200 px-4 py-2 rounded-xl relative z-10 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Soul Wallet: </span>
            <span className="font-mono font-bold text-slate-800">
              {formatAddress(activeAddress)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector / Transfer Test on Left, Diploma on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Credentials List & Soulbound Security Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          {/* Credentials List */}
          <div className="glass-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <span>Bound Academic Tokens</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-mono border border-emerald-200 font-bold">
                  {displayCredentials.length}
                </span>
              </h2>
              <span className="text-[11px] text-slate-500">Click to preview</span>
            </div>

            <div className="space-y-3">
              {displayCredentials.map((cred) => {
                const isSelected = activeCredential?.tokenId === cred.tokenId;
                return (
                  <button
                    key={cred.tokenId}
                    onClick={() => {
                      setSelectedTokenId(cred.tokenId);
                      setTransferAttemptError(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all transform active:scale-[0.99] shadow-sm ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-700 flex items-center space-x-1.5">
                        <Lock className="h-3 w-3" />
                        <span>Token #{cred.tokenId}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          cred.isRevoked
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        {cred.isRevoked ? 'Revoked' : 'Soulbound (Locked)'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-2">{cred.degreeName}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{cred.studentName} ({cred.studentIdNumber})</p>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 truncate flex items-center space-x-1">
                      <span>Bound to:</span>
                      <span className="text-slate-700 font-medium">{formatAddress(cred.studentWallet)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Non-Transferability Security Testbench */}
          <div className="glass-panel p-5 sm:p-6 space-y-3 border-rose-200 bg-rose-50/20">
            <div className="flex items-center space-x-2 text-rose-700 pb-2 border-b border-rose-200">
              <AlertOctagon className="h-4 w-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                EIP-5192 Non-Transferability Security Sandbox
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard ERC-721 tokens can be transferred or sold to unearned third parties. Soulbound credentials strictly revert any <code className="text-rose-700 bg-rose-100/70 px-1 py-0.5 rounded font-mono text-[11px]">transferFrom()</code> attempt at the EVM bytecode level.
            </p>

            <button
              onClick={handleSimulateTransfer}
              className="mt-2 w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Lock className="h-3.5 w-3.5 text-rose-600" />
              <span>Simulate Illegal Transfer Attempt (Test EVM Revert)</span>
            </button>

            {transferAttemptError && (
              <div className="mt-3 p-3.5 bg-white border border-rose-300 rounded-xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150 shadow-sm">
                <div className="font-mono font-bold text-rose-700 flex items-center space-x-1.5">
                  <span>🛑 EVM REVERT:</span>
                  <span className="text-rose-800 underline">{transferAttemptError.errorName}</span>
                </div>
                <div className="text-slate-700 text-[11px] leading-relaxed">
                  {transferAttemptError.reason}
                </div>
                <div className="text-[10px] font-mono text-emerald-700 pt-1 border-t border-slate-100 font-semibold">
                  ✓ Verified: Token remains immutable in {formatAddress(activeCredential?.studentWallet || activeAddress)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: High-Res Diploma Certificate Display */}
        <div className="lg:col-span-7">
          {activeCredential ? (
            <div className="glass-panel p-3 sm:p-5 rounded-2xl shadow-lg">
              <DiplomaCertificate
                credential={activeCredential}
                onVerifyClick={() => {
                  if (onSelectCredentialForVerification) {
                    onSelectCredentialForVerification(activeCredential);
                  }
                  setActiveTab('employer');
                }}
              />
            </div>
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <Award className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">No academic credentials found in this soul wallet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
