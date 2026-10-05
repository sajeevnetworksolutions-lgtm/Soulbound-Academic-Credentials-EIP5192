import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import OverviewPage from './pages/OverviewPage';
import RegistrarPortal from './pages/RegistrarPortal';
import DeanPortal from './pages/DeanPortal';
import StudentSoulWallet from './pages/StudentSoulWallet';
import EmployerVerificationPortal from './pages/EmployerVerificationPortal';
import DisciplinaryBoardPortal from './pages/DisciplinaryBoardPortal';
import BenchmarkDashboard from './pages/BenchmarkDashboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationPreloadData, setVerificationPreloadData] = useState(null);

  // Check URL query parameters for direct 1-click verification links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken') || params.get('token');
    const hash = params.get('hash');

    if (verifyToken || hash) {
      setActiveTab('employer');
      setVerificationPreloadData({
        tokenId: verifyToken,
        certificateHash: hash,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && <OverviewPage setActiveTab={setActiveTab} />}
        {activeTab === 'registrar' && <RegistrarPortal setActiveTab={setActiveTab} />}
        {activeTab === 'dean' && <DeanPortal setActiveTab={setActiveTab} />}
        {activeTab === 'student' && (
          <StudentSoulWallet
            setActiveTab={setActiveTab}
            onSelectCredentialForVerification={(cred) => setVerificationPreloadData(cred)}
          />
        )}
        {activeTab === 'employer' && (
          <EmployerVerificationPortal initialVerificationData={verificationPreloadData} />
        )}
        {activeTab === 'board' && <DisciplinaryBoardPortal />}
        {activeTab === 'benchmarks' && <BenchmarkDashboard />}
      </main>

      {/* Modern Academic & Web3 Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-mono">
            M.Tech Dissertation Project • Decentralized Academic Credential Verification Platform
          </p>
          <p className="text-[11px] text-slate-600">
            Compliant with EIP-5192 (Minimal Soulbound NFTs), EIP-721 Metadata, and IPFS Cryptographic Standards.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
