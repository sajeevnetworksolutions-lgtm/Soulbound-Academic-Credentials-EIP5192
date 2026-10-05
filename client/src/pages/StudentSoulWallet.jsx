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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Graduate Soul Wallet & Credentials Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Permanently bound decentralized identity assets held in your Ethereum wallet (EIP-5192 standard).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl">
          <Lock className="h-4 w-4 text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-400">Soul Wallet: </span>
            <span className="font-mono font-bold text-slate-200">
              {formatAddress(activeAddress)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector / Transfer Test on Left, Diploma on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Credentials List & Soulbound Security Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          {/* Credentials List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
              Bound Academic Tokens ({displayCredentials.length})
            </h2>

            <div className="space-y-3">
              {displayCredentials.map((cred) => (
                <button
                  key={cred.tokenId}
                  onClick={() => {
                    setSelectedTokenId(cred.tokenId);
                    setTransferAttemptError(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeCredential?.tokenId === cred.tokenId
                      ? 'bg-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Token #{cred.tokenId}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        cred.isRevoked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {cred.isRevoked ? 'Revoked' : 'Soulbound (Locked)'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mt-2">{cred.degreeName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cred.studentName} ({cred.studentIdNumber})</p>
                  <div className="text-[11px] text-slate-500 font-mono mt-2 truncate">
                    Bound: {formatAddress(cred.studentWallet)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Non-Transferability Security Testbench */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-rose-400 mb-2">
              <AlertOctagon className="h-4 w-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Non-Transferability Security Verification
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In traditional NFTs, tokens can be transferred or sold to unearned third parties. Soulbound tokens (EIP-5192) permanently revert any transfer attempt at the EVM bytecode level.
            </p>

            <button
              onClick={handleSimulateTransfer}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span>Simulate Illegal Transfer Attempt (Test EVM Revert)</span>
            </button>

            {transferAttemptError && (
              <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs space-y-1 animate-in fade-in duration-150">
                <div className="font-mono font-bold text-rose-400">
                  ⚠️ EVM REVERT: {transferAttemptError.errorName}
                </div>
                <div className="text-slate-300 text-[11px]">{transferAttemptError.reason}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: High-Res Diploma Certificate Display */}
        <div className="lg:col-span-7">
          {activeCredential ? (
            <div>
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
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
              <Award className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">No academic credentials found in this soul wallet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
