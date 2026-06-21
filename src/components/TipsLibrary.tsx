import React, { useState, useMemo } from 'react';
import { EnvironmentalTip } from '../types';
import { ENVIRONMENTAL_TIPS } from '../utils/carbonCalculator';
import { BookOpen, Search, Filter, Compass, Check, HelpCircle, Heart, Award, ArrowUpRight } from 'lucide-react';

interface TipsLibraryProps {
  onUnlockBadge: (badgeId: string) => void;
  setCommunitySavedCo2: React.Dispatch<React.SetStateAction<number>>;
}

export default function TipsLibrary({ onUnlockBadge, setCommunitySavedCo2 }: TipsLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [committedTipIds, setCommittedTipIds] = useState<string[]>([]);

  // Filter tips based on controls
  const filteredTips = useMemo(() => {
    return ENVIRONMENTAL_TIPS.filter(tip => {
      const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tip.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || tip.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleCommitTip = (id: string, savingsStr: string) => {
    if (committedTipIds.includes(id)) return; // already committed
    
    setCommittedTipIds(prev => [...prev, id]);

    // Parse savings from string e.g., "saves ~150 kg CO2/year"
    const numbers = savingsStr.match(/\d+/);
    const savingsAmount = numbers ? Number(numbers[0]) : 50;

    setCommunitySavedCo2(prev => prev + savingsAmount);
    
    // Unlock scholar badge if they read and commit to items
    if (committedTipIds.length >= 2) {
      onUnlockBadge('badge2'); // Green Path Finder
    }
  };

  const categories = [
    { id: 'all', label: 'All Fields' },
    { id: 'energy', label: 'Home Energy' },
    { id: 'transport', label: 'Commuting' },
    { id: 'food', label: 'Nutrition' },
    { id: 'water', label: 'Water' },
    { id: 'offsets', label: 'Offsets' }
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'Easy', label: 'Easy (Under 10 mins)' },
    { id: 'Medium', label: 'Medium (Planning needed)' },
    { id: 'Hard', label: 'Hard (Investment required)' }
  ];

  return (
    <section id="tips-library-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Intro header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          The Sustainability <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Eco-Knowledge Hub</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500 dark:text-slate-400">
          Search actionable environmental audits, inspect localized recycling trivia, and pledge ecological commitments.
        </p>
      </div>

      {/* Control filters bar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-center">
          
          {/* Search bar */}
          <div className="relative md:col-span-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-450 dark:text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              id="library-search"
              type="text"
              placeholder="Search environmental logs or tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/20 text-slate-700 dark:text-slate-350"
            />
          </div>

          {/* Category filter */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              id="library-category"
              value={selectedCategory}
              aria-label="Filter by Topic Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-910 dark:bg-slate-950/20 text-slate-705 dark:text-slate-300"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <Compass className="h-4 w-4 text-slate-400" />
            <select
              id="library-difficulty"
              value={selectedDifficulty}
              aria-label="Filter by Implementation Difficulty"
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950/20 text-slate-705 dark:text-slate-300"
            >
              {difficulties.map(diff => (
                <option key={diff.id} value={diff.id}>{diff.label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main layout columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left: Tips layout cards */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {filteredTips.length > 0 ? (
              filteredTips.map((tip) => {
                const isCommitted = committedTipIds.includes(tip.id);
                return (
                  <div
                    key={tip.id}
                    id={`tip-card-${tip.id}`}
                    className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between ${
                      isCommitted
                        ? 'border-emerald-500/30 bg-emerald-50/5 dark:border-emerald-500/25'
                        : 'border-slate-200 dark:border-slate-800'
                    } dark:bg-slate-900`}
                  >
                    <div>
                      {/* Meta information tags */}
                      <div className="flex items-center justify-between text-[10px] mb-3">
                        <span className="uppercase tracking-widest font-bold text-slate-400 font-mono">
                          {tip.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold font-mono ${
                          tip.difficulty === 'Easy'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : tip.difficulty === 'Medium'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                        }`}>
                          {tip.difficulty}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                        {tip.co2Saving}
                      </span>
                      
                      <button
                        id={`btn-commit-tip-${tip.id}`}
                        onClick={() => handleCommitTip(tip.id, tip.co2Saving)}
                        disabled={isCommitted}
                        className={`flex items-center space-x-1 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer transition-colors ${
                          isCommitted
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isCommitted ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Committed (+CO₂)</span>
                          </>
                        ) : (
                          <>
                            <span>Pledge Action</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div id="no-tips-results-card" className="col-span-full border border-dashed border-slate-200 p-8 rounded-2xl text-center dark:border-slate-800">
                <Compass className="h-10 w-10 text-slate-350 mx-auto animate-spin" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">No eco tips match your query</h4>
                <p className="text-xs text-slate-405 mt-1">Try relaxing your search terms or filter constraints.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Educational Trivia Cards sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Science trivia console */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1.5">Climate Science Ledger</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Quick facts exploring organic carbon footprints and soil warming mechanics.
            </p>

            <div className="mt-5 space-y-4 text-xs leading-relaxed">
              {[
                { label: 'The Dietary Gap', fact: 'Beef agriculture requires 20x more land and expels 10x more gases than legume protein crops per calorie.' },
                { label: 'Vampire Vampirism', fact: 'Standby electronics represent up to 10% of standard household utility bills, emitting millions of tonnes globally.' },
                { label: 'Seagrass Sequestration', fact: 'One square meter of healthy ocean seagrass converts carbon up to 35 times quicker than equivalents of rainforest tree topsoil.' }
              ].map((item, id) => (
                <div key={id} className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{item.label}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.fact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick certificate helper */}
          <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 p-6 shadow-md dark:border-emerald-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 text-white shadow-sm mb-4">
              <Award className="h-5 w-5" />
            </div>
            
            <h3 className="font-extrabold text-slate-800 dark:text-emerald-200 text-sm">Citizen Action commitment</h3>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed dark:text-slate-400">
              Each committed tip saves carbon aggregates which increments global dashboard stats immediately! Committing to at least 3 tips unlocks your certified Green Fighter accolade.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
