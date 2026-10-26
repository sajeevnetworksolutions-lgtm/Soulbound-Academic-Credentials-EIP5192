import React, { useState } from 'react';
import { useWeb3, PRESET_ACCOUNTS } from '../context/Web3Context';
import {
  Award,
  ShieldCheck,
  UserCheck,
  Building2,
  AlertOctagon,
  Activity,
  Wallet,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Scale,
  CheckCircle2,
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
  } = useWeb3();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Research & Synopsis', icon: Layers },
    { id: 'registrar', label: 'Registrar Issuance', icon: Building2 },
    { id: 'dean', label: 'Dean Multi-Sig', icon: UserCheck },
    { id: 'employer', label: 'Employer 1-Click Verify', icon: ShieldCheck, highlight: true },
    { id: 'student', label: 'Student Soul Wallet', icon: GraduationCap },
    { id: 'board', label: 'Ethics & Disciplinary', icon: Scale },
    { id: 'benchmarks', label: 'Performance Metrics', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/[0.08]">
      {/* Top Bar: Brand, Network, and Web3 Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-title font-bold text-lg tracking-wider text-white">
                  SOULBOUND
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/25">
                  EIP-5192
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Decentralized Academic Credentials</p>
            </div>
          </div>

          {/* Web3 Network & Role Controls */}
          <div className="flex items-center space-x-3">
            {/* Network Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs text-slate-300 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-medium tracking-tight text-slate-200">
                {networkName}
              </span>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2.5 bg-slate-900/90 hover:bg-slate-800/90 border border-white/[0.1] px-3.5 py-1.5 rounded-xl text-xs font-medium text-white transition-all shadow-md hover:border-emerald-500/40"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/10 ${
                    currentAccount.color === 'emerald'
                      ? 'bg-emerald-400'
                      : currentAccount.color === 'indigo'
                      ? 'bg-indigo-400'
                      : currentAccount.color === 'rose'
                      ? 'bg-rose-400'
                      : currentAccount.color === 'cyan'
                      ? 'bg-cyan-400'
                      : 'bg-amber-400'
                  }`}
                />
                <div className="text-left">
                  <div className="text-xs font-semibold leading-tight text-slate-100 flex items-center space-x-1.5">
                    <span>{currentAccount.role}</span>
                    <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
                      ({currentAccount.name.split(' ')[0]})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatAddress(activeAddress)}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Role Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0b1220] border border-white/[0.12] rounded-2xl shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-white/[0.08] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Active Web3 Role
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Instant Simulation</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-white/[0.04]">
                    {PRESET_ACCOUNTS.map((acc) => {
                      const isSelected = !isMetaMaskConnected && currentAccount.role === acc.role;
                      return (
                        <button
                          key={acc.role}
                          onClick={() => {
                            switchPresetAccount(acc);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-start space-x-3 hover:bg-white/[0.04] transition-colors ${
                            isSelected ? 'bg-emerald-500/10 font-medium' : ''
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0 ${
                              acc.color === 'emerald'
                                ? 'bg-emerald-400'
                                : acc.color === 'indigo'
                                ? 'bg-indigo-400'
                                : acc.color === 'rose'
                                ? 'bg-rose-400'
                                : acc.color === 'cyan'
                                ? 'bg-cyan-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-slate-100">
                                {acc.title}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-300 truncate">{acc.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              {formatAddress(acc.address)} • {acc.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-white/[0.08]">
                    <button
                      onClick={() => {
                        connectMetaMask();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-emerald-500/10 transition-all"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Connect External MetaMask Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Row: Spacious Persona Tabs */}
        <div className="flex items-center space-x-1.5 py-2.5 overflow-x-auto scrollbar-none border-t border-white/[0.05]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 font-semibold'
                    : item.highlight
                    ? 'text-purple-300 hover:text-white hover:bg-purple-500/10 border border-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive
                      ? 'text-emerald-400'
                      : item.highlight
                      ? 'text-purple-400'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
