import React, { useState } from 'react';
import { Leaf, Sun, Moon, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  communitySavedCo2: number;
}

export default function Header({ currentTab, setTab, darkMode, setDarkMode, communitySavedCo2 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'analytics', label: 'Advanced Analytics' },
    { id: 'planner', label: 'Impact Planner' },
    { id: 'learn', label: 'Tips & Eco-Library' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/70 backdrop-blur-md transition-all duration-300 dark:border-emerald-950/60 dark:bg-slate-900/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo - Geometric styled and highly accessible */}
        <div 
          id="app-logo" 
          role="button"
          tabIndex={0}
          aria-label="EcoTrack AI home, go to Dashboard"
          className="flex items-center gap-3 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-xl p-1" 
          onClick={() => setTab('dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setTab('dashboard');
            }
          }}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-250 dark:shadow-emerald-900/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-emerald-950 italic dark:text-emerald-50">
              EcoTrack<span className="text-emerald-500 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase block leading-none mt-0.5">Climate-Tech OS</span>
          </div>
        </div>

        {/* Desktop Navigation - styled like the sidebar but aligned in desktop top bar */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950/40 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/40">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-4 py-2 text-xs font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Global Community Goal & Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Live API Connected Widget - Styled exactly as requested in the design reference */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-emerald-100 dark:border-emerald-950/60 shadow-sm" role="status" aria-live="polite">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">Live API Connected</span>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={`Toggle Theme, currently ${darkMode ? 'dark mode' : 'light mode'}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" aria-hidden="true" /> : <Moon className="h-4.5 w-4.5" aria-hidden="true" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" aria-hidden="true" /> : <Menu className="h-4.5 w-4.5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div id="mobile-menu" role="menu" className="border-t border-slate-100 bg-white px-4 py-2 space-y-1 md:hidden dark:border-slate-800 dark:bg-slate-900 shadow-xl">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                role="menuitem"
                onClick={() => {
                  setTab(item.id);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 opacity-100'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {/* Community display link for mobile */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 pb-1.5 px-4 text-xs" role="presentation">
            <span className="text-slate-400">Total Community Savings:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {communitySavedCo2.toLocaleString()} kg CO₂
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
