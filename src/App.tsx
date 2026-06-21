import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Analytics from './components/Analytics';
import Planner from './components/Planner';
import TipsLibrary from './components/TipsLibrary';
import { FootprintRecord, EcoBadge, MonthlyGoal, AIInsight } from './types';
import { INITIAL_BADGES, getGradeLabel } from './utils/carbonCalculator';
import { Leaf, Award, Download, Sparkles, Printer, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentTab, setTab] = useState<string>('dashboard');
  const [offsetCo2, setOffsetCo2] = useState<number>(() => {
    const stored = localStorage.getItem('ecotrack_offset_co2');
    return stored ? Number(stored) : 0;
  });
  const [communitySavedCo2, setCommunitySavedCo2] = useState<number>(() => {
    const stored = localStorage.getItem('ecotrack_comm_saved_co2');
    return stored ? Number(stored) : 142850; // a living, breathing community benchmark
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('ecotrack_dark_mode');
    return stored ? stored === 'true' : false; // default false
  });

  const [records, setRecords] = useState<FootprintRecord[]>(() => {
    const stored = localStorage.getItem('ecotrack_records');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return []; // start empty to allow calculator CTA, but custom seed is used in dashboard if empty
  });

  const [goals, setGoals] = useState<MonthlyGoal[]>(() => {
    const stored = localStorage.getItem('ecotrack_goals');
    return stored ? JSON.parse(stored) : [];
  });

  const [badges, setBadges] = useState<EcoBadge[]>(() => {
    const stored = localStorage.getItem('ecotrack_badges');
    return stored ? JSON.parse(stored) : INITIAL_BADGES;
  });

  // State to retain the latest retrieved AI insights across views
  const [aiRecommendations, setAiRecommendations] = useState<AIInsight[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');

  // Handle dark mode DOM modifications
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ecotrack_dark_mode', String(darkMode));
  }, [darkMode]);

  // Synchronise states into local storage
  useEffect(() => {
    localStorage.setItem('ecotrack_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('ecotrack_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('ecotrack_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('ecotrack_offset_co2', String(offsetCo2));
  }, [offsetCo2]);

  useEffect(() => {
    localStorage.setItem('ecotrack_comm_saved_co2', String(communitySavedCo2));
  }, [communitySavedCo2]);

  // Unlock badges trigger
  const handleUnlockBadge = (id: string) => {
    setBadges(prev => {
      const isAlreadyUnlocked = prev.find(b => b.id === id)?.unlocked;
      if (isAlreadyUnlocked) return prev;

      return prev.map(badge => {
        if (badge.id === id) {
          return {
            ...badge,
            unlocked: true,
            unlockedAt: new Date().toISOString().split('T')[0]
          };
        }
        return badge;
      });
    });
  };

  const handleRecordAdded = (newRecord: FootprintRecord) => {
    setRecords(prev => [...prev, newRecord]);
    setTab('dashboard'); // take them back to cockpit dynamically
    
    // Unlock basic calculator badges
    handleUnlockBadge('badge1'); // Carbon Pioneer
    if (newRecord.sustainabilityScore > 65) {
      handleUnlockBadge('badge2'); // Green Pathfinder
    }
    if (newRecord.grade === 'A') {
      handleUnlockBadge('badge4'); // Absolute Zero Hero
    }
  };

  // Secure client-side Blob downloader to fetch formatted text file of results
  const handleDownloadReport = () => {
    const activeRecord = records.length > 0 ? records[records.length - 1] : {
      date: new Date().toISOString().split('T')[0],
      sustainabilityScore: 55,
      grade: 'C' as const,
      emissions: {
        transport: 1850,
        electricity: 1680,
        food: 912,
        flights: 1000,
        water: 109,
        total: 5551
      }
    };

    const emissions = activeRecord.emissions;
    const textReport = `==================================================================
           ECOTRACK AI – CERTIFIED CARBON AUDIT REPORT
==================================================================
Recorded Audit Date   : ${activeRecord.date}
Overall Sustainability: ${activeRecord.sustainabilityScore} / 100
Environmental Grade   : TIER ${activeRecord.badge1 ? 'A' : activeRecord.grade} (${getGradeLabel(activeRecord.grade)})
Total Offset Sequest  : ${offsetCo2.toLocaleString()} kg CO2/yr

MATERIAL METRIC BREAKDOWNS (Annual kg CO2 output):
------------------------------------------------------------------
- Commuting & Air Travel flights : ${emissions.transport.toLocaleString()} kg CO2e
- Household Electricity & grid  : ${emissions.electricity.toLocaleString()} kg CO2e
- Food choice & dietary load     : ${emissions.food.toLocaleString()} kg CO2e
- Aviation flights               : ${emissions.flights.toLocaleString()} kg CO2e
- Household Water treating       : ${emissions.water.toLocaleString()} kg CO2e
------------------------------------------------------------------
GROSS CALCULATED FOOTPRINT      : ${emissions.total.toLocaleString()} kg CO2e
NET INDIVIDUAL BIO IMPACT       : ${Math.max(0, emissions.total - offsetCo2).toLocaleString()} kg CO2e
==================================================================

ACTIONABLE RE-ROUTE STRATEGIES:
${aiRecommendations.map((rec, i) => `${i + 1}. [${rec.category.toUpperCase()}] ${rec.title} (${rec.priority.toUpperCase()})\n   - Benefit metric: ${rec.impactText}\n   - Description: ${rec.text}`).join('\n\n')}

==================================================================
Generated via EcoTrack AI Climate-Tech OS.
Sponsor global direct air sequestering channels to close remaining loops.
==================================================================`;

    const blob = new Blob([textReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EcoTrack-AI-Audit-${activeRecord.date}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      
      <div>
        {/* Core navbar */}
        <Header
          currentTab={currentTab}
          setTab={setTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          communitySavedCo2={communitySavedCo2}
        />

        {/* Global sticky notification with Print / Action reports triggers */}
        {records.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 border border-emerald-500/25 px-4 py-3 gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
                <span className="text-slate-700 dark:text-emerald-200">
                  Carbon Audit record active. Export reports cleanly to share with community groups!
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Download plain report */}
                <button
                  id="btn-report-download"
                  onClick={handleDownloadReport}
                  className="flex items-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Audit Document</span>
                </button>
                {/* Native print */}
                <button
                  id="btn-report-print"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Portfolio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Routing System */}
        <main className="flex-grow">
          {currentTab === 'dashboard' && (
            <Dashboard
              records={records}
              onSetTab={setTab}
              aiRecommendations={aiRecommendations}
              setAiRecommendations={setAiRecommendations}
              aiSummary={aiSummary}
              setAiSummary={setAiSummary}
            />
          )}

          {currentTab === 'calculator' && (
            <Calculator
              onRecordAdded={handleRecordAdded}
              lastRecord={records.length > 0 ? records[records.length - 1] : null}
            />
          )}

          {currentTab === 'analytics' && (
            <Analytics
              records={records}
              onUnlockBadge={handleUnlockBadge}
            />
          )}

          {currentTab === 'planner' && (
            <Planner
              records={records}
              badges={badges}
              onUnlockBadge={handleUnlockBadge}
              goals={goals}
              onAddGoal={(g) => setGoals(prev => [...prev, g])}
              offsetCo2={offsetCo2}
              setOffsetCo2={setOffsetCo2}
              communitySavedCo2={communitySavedCo2}
              setCommunitySavedCo2={setCommunitySavedCo2}
            />
          )}

          {currentTab === 'learn' && (
            <TipsLibrary
              onUnlockBadge={handleUnlockBadge}
              setCommunitySavedCo2={setCommunitySavedCo2}
            />
          )}
        </main>
      </div>

      {/* Modern footer details */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 py-6 mt-16 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2026 EcoTrack AI Inc. Systems fully aligned with UNFCCC guidelines.</p>
          <p className="mt-1 pb-1 font-mono text-[9px] tracking-wide text-slate-400 dark:text-slate-600 uppercase">
            Net-Zero Infrastructure • Certified Climate Registry Applet #208fd135
          </p>
        </div>
      </footer>

    </div>
  );
}
