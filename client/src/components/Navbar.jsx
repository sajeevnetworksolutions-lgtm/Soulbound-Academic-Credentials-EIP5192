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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
      {/* Top Bar: Brand, Network, and Web3 Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-title font-bold text-lg tracking-wider text-slate-900">
                  SOULBOUND
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-300">
                  EIP-5192
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Decentralized Academic Credentials</p>
            </div>
          </div>

          {/* Web3 Network & Role Controls */}
          <div className="flex items-center space-x-3">
            {/* Network Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-semibold tracking-tight text-slate-700">
                {networkName}
              </span>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500/60 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 transition-all shadow-sm"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ring-2 ring-slate-100 ${
                    currentAccount.color === 'emerald'
                      ? 'bg-emerald-500'
                      : currentAccount.color === 'indigo'
                      ? 'bg-indigo-500'
                      : currentAccount.color === 'rose'
                      ? 'bg-rose-500'
                      : currentAccount.color === 'cyan'
                      ? 'bg-cyan-500'
                      : 'bg-amber-500'
                  }`}
                />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight text-slate-800 flex items-center space-x-1.5">
                    <span>{currentAccount.role}</span>
                    <span className="text-[10px] text-slate-500 font-normal hidden md:inline">
                      ({currentAccount.name.split(' ')[0]})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatAddress(activeAddress)}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Role Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Switch Active Web3 Role
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Simulated
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-100">
                    {PRESET_ACCOUNTS.map((acc) => {
                      const isSelected = !isMetaMaskConnected && currentAccount.role === acc.role;
                      return (
                        <button
                          key={acc.role}
                          onClick={() => {
                            switchPresetAccount(acc);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-start space-x-3 hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-emerald-50/80 font-medium' : ''
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0 ${
                              acc.color === 'emerald'
                                ? 'bg-emerald-500'
                                : acc.color === 'indigo'
                                ? 'bg-indigo-500'
                                : acc.color === 'rose'
                                ? 'bg-rose-500'
                                : acc.color === 'cyan'
                                ? 'bg-cyan-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">
                                {acc.title}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate">{acc.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {formatAddress(acc.address)} • {acc.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        connectMetaMask();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all"
                    >
                      <Wallet className="h-3.5 w-3.5 text-white" />
                      <span>Connect External MetaMask Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Row: Spacious Persona Tabs */}
        <div className="flex items-center space-x-1.5 py-2.5 overflow-x-auto scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : item.highlight
                    ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-purple-600'
                      : 'text-slate-500'
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
