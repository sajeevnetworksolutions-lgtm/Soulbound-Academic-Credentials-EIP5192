import React, { useState } from 'react';
import { useWeb3, PRESET_ACCOUNTS } from '../context/Web3Context';
import {
  Award,
  ShieldCheck,
  UserCheck,
  Building2,
  FileCheck2,
  AlertOctagon,
  Activity,
  Wallet,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatAddress } from '../services/hashUtil';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    currentAccount,
    switchPresetAccount,
    isMetaMaskConnected,
    connectMetaMask,
    activeAddress,
    networkName,
    contractAddress,
  } = useWeb3();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Synopsis & Research', icon: Layers },
    { id: 'registrar', label: 'Registrar Issuance', icon: Building2 },
    { id: 'dean', label: 'Dean Multi-Sig', icon: UserCheck },
    { id: 'student', label: 'Student Soul Wallet', icon: Award },
    { id: 'employer', label: 'Employer 1-Click Verify', icon: ShieldCheck },
    { id: 'board', label: 'Disciplinary Board', icon: AlertOctagon },
    { id: 'benchmarks', label: 'Performance Metrics', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-title font-bold text-lg tracking-wide text-white">
                  SOULBOUND
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                  EIP-5192
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Decentralized Academic Credentials</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Web3 Role & Wallet Switcher */}
          <div className="flex items-center space-x-3">
            {/* Network Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono">{networkName}</span>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all shadow-sm"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    currentAccount.color === 'emerald'
                      ? 'bg-emerald-400'
                      : currentAccount.color === 'indigo'
                      ? 'bg-indigo-400'
                      : currentAccount.color === 'rose'
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
                <div className="text-left">
                  <div className="font-semibold">{currentAccount.role}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatAddress(activeAddress)}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Web3 Identity
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {PRESET_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.role}
                        onClick={() => {
                          switchPresetAccount(acc);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center space-x-2.5 hover:bg-slate-800 text-xs transition-colors ${
                          !isMetaMaskConnected && currentAccount.role === acc.role
                            ? 'bg-slate-800/80 font-medium text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            acc.color === 'emerald'
                              ? 'bg-emerald-400'
                              : acc.color === 'indigo'
                              ? 'bg-indigo-400'
                              : acc.color === 'rose'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-semibold text-slate-200">{acc.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{acc.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono">
                            {formatAddress(acc.address)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        connectMetaMask();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 rounded-lg text-xs font-semibold text-white shadow-sm"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Connect MetaMask Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex overflow-x-auto space-x-1 py-2 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
