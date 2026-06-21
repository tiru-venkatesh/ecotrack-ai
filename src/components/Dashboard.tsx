import React, { useState, useEffect } from 'react';
import { FootprintRecord, AIInsight } from '../types';
import { getDeterministicRecommendations, getGradeLabel } from '../utils/carbonCalculator';
import { Award, Zap, Compass, Flame, Leaf, CheckCircle2, Circle, AlertCircle, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

interface DashboardProps {
  records: FootprintRecord[];
  onSetTab: (tab: string) => void;
  aiRecommendations: AIInsight[];
  setAiRecommendations: React.Dispatch<React.SetStateAction<AIInsight[]>>;
  aiSummary: string;
  setAiSummary: React.Dispatch<React.SetStateAction<string>>;
}

export default function Dashboard({
  records,
  onSetTab,
  aiRecommendations,
  setAiRecommendations,
  aiSummary,
  setAiSummary
}: DashboardProps) {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [completedRecIds, setCompletedRecIds] = useState<string[]>([]);
  const [isErrorAi, setIsErrorAi] = useState(false);

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  // Compile stats based on latest audit report
  const annualTotal = latestRecord ? latestRecord.emissions.total : 6850; // default average baseline
  const dailyTotal = Math.round(annualTotal / 365);
  const monthlyTotal = Math.round(annualTotal / 12);
  const score = latestRecord ? latestRecord.sustainabilityScore : 55;
  const grade = latestRecord ? latestRecord.grade : 'C';
  const gradeLabel = latestRecord ? getGradeLabel(grade) : 'Green Path Traveler';

  // Trigger server-side AI evaluation proxy inside useEffect if a new record appears
  useEffect(() => {
    if (!latestRecord) {
      // populate defaults deterministic recommendations for standard experience
      const stubInput = {
        travelDistance: 25,
        transportType: 'car' as const,
        electricityConsume: 350,
        foodPref: 'mixed' as const,
        flightsPerYear: 2,
        waterConsume: 150
      };
      const stubEmissions = {
        transport: 1642,
        electricity: 1680,
        food: 912,
        flights: 1000,
        water: 109,
        total: 5343
      };
      const localRecs = getDeterministicRecommendations(stubInput, stubEmissions);
      setAiRecommendations(localRecs);
      setAiSummary("Get started by inputting your carbon profile on the footprint calculator tab above to activate real-time AI modeling!");
      return;
    }

    const fetchAiInsights = async () => {
      setIsLoadingAi(true);
      setIsErrorAi(false);
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: latestRecord.input,
            emissions: latestRecord.emissions,
            sustainabilityScore: latestRecord.sustainabilityScore,
            grade: latestRecord.grade,
            gradeLabel: getGradeLabel(latestRecord.grade)
          }),
        });

        if (!response.ok) {
          throw new Error('Server returned unsuccessful response code');
        }

        const data = await response.json();
        
        if (data.aiGenerated) {
          setAiRecommendations(data.recommendations);
          setAiSummary(data.personalizedSummary);
        } else {
          // If server reports offline/no api key, fallback deterministic
          const localRecs = getDeterministicRecommendations(latestRecord.input, latestRecord.emissions);
          setAiRecommendations(localRecs);
          setAiSummary("Carbon profile updated successfully. (Operating in High-Fidelity Local Deterministic mode, keeping your metrics clean).");
        }
      } catch (err) {
        console.warn("Express proxy error, loading client deterministic fallback.", err);
        const localRecs = getDeterministicRecommendations(latestRecord.input, latestRecord.emissions);
        setAiRecommendations(localRecs);
        setAiSummary("Carbon profile loaded offline. Optimized local carbon recommendation engine successfully structured.");
        setIsErrorAi(true);
      } finally {
        setIsLoadingAi(false);
      }
    };

    fetchAiInsights();
  }, [latestRecord, setAiRecommendations, setAiSummary]);

  const toggleRecommendationComplete = (id: string) => {
    if (completedRecIds.includes(id)) {
      setCompletedRecIds(prev => prev.filter(x => x !== id));
    } else {
      setCompletedRecIds(prev => [...prev, id]);
    }
  };

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-cyan-500' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = score >= 80 ? 'bg-emerald-500/10' : score >= 60 ? 'bg-cyan-500/10' : score >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10';

  return (
    <div id="dashboard-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Dynamic Welcome Heading */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
            Platform Dashboard
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Welcome to <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">EcoTrack AI</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">
            {latestRecord 
              ? `Your environmental footprint recorded on ${latestRecord.date} ranks at score ${score}. Modify values at any time.` 
              : 'Add your carbon audits through our Footprint Calculator to see dynamic metrics, scores, and unlocking badges!'}
          </p>
        </div>

        {!latestRecord && (
          <button
            id="dash-cta-btn"
            onClick={() => onSetTab('calculator')}
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:opacity-90 cursor-pointer"
          >
            <span>Run Free Carbon Audit</span>
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        
        {/* Core total Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Leaf className="h-5.5 w-5.5" />
          </div>
          <div className="mt-4 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Yearly Carbon Outflow
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 mt-1">
            {annualTotal.toLocaleString()} <span className="text-xs font-light text-slate-500">kg CO₂e</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Global target is <span className="font-semibold text-emerald-600 dark:text-emerald-400">2,000 kg</span> / person / year
          </p>
        </div>

        {/* Monthly Estimate Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
            <Zap className="h-5.5 w-5.5" />
          </div>
          <div className="mt-4 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Monthly Carbon Outflow
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 mt-1">
            {monthlyTotal.toLocaleString()} <span className="text-xs font-light text-slate-500">kg CO₂e</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Equivalent to burning ~{Math.round(monthlyTotal / 2.3)} kg coal
          </p>
        </div>

        {/* Daily Estimate Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Compass className="h-5.5 w-5.5" />
          </div>
          <div className="mt-4 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Daily Carbon Outflow
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 mt-1">
            {dailyTotal.toLocaleString()} <span className="text-xs font-light text-slate-500">kg CO₂e</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Requires {Math.round(dailyTotal / 0.05)} full mature trees to absorb daily
          </p>
        </div>

        {/* Sustainability Score Gauge Card */}
        <div 
          className="relative overflow-hidden rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/30 dark:bg-slate-900 flex flex-col items-center justify-center"
          role="region"
          aria-label="Sustainability score summary"
        >
          <div className="relative flex items-center justify-center">
            {/* SVG Circle indicator */}
            <svg 
              className="h-28 w-28 transform -rotate-90"
              role="img"
              aria-label={`Sustainability score progress bar showing ${score} out of 100`}
            >
              <circle
                cx="56"
                cy="56"
                r="45"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="45"
                className="stroke-emerald-500 transition-all duration-[1500ms] ease-out-back"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className={`absolute flex flex-col items-center justify-center`}>
              <span className="text-3xl font-black font-mono text-slate-800 dark:text-white leading-none">
                {score}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider leading-none">
                Score
              </span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{gradeLabel}</div>
            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
              Tier {grade} Rating
            </span>
          </div>
        </div>

      </div>

      {/* Main Core Columns - Recommendations & Bio Impact Details */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left column - AI Sustainability Recommendations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm dark:border-emerald-900/30 dark:bg-slate-900">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-emerald-500 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Sustainability Insights Engine</h3>
              </div>
              <div className="flex items-center space-x-2">
                {isLoadingAi && (
                  <span className="flex items-center space-x-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>ML Generating...</span>
                  </span>
                )}
                {!isLoadingAi && !latestRecord && (
                  <span className="text-[10px] uppercase font-mono bg-slate-100 text-slate-500 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    Demo Mode Activated
                  </span>
                )}
                {!isLoadingAi && latestRecord && (
                  <span className="text-[10px] uppercase font-mono bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Active Profile</span>
                  </span>
                )}
              </div>
            </div>

            {/* Motivational message summary */}
            {aiSummary && (
              <div className="mt-4 text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/20 p-4 rounded-xl leading-relaxed border border-emerald-500/10">
                <p>{aiSummary}</p>
              </div>
            )}

            {/* Recommendations stack */}
            <div className="mt-6 space-y-4">
              
              {isLoadingAi ? (
                // Skeleton loading state
                <div id="ai-skeleton-loader" className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex space-x-4 border border-slate-100 p-4 rounded-xl animate-pulse dark:border-slate-800">
                      <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                      <div className="space-y-2 flex-grow">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                aiRecommendations.map((rec) => {
                  const isChecked = completedRecIds.includes(rec.id);
                  return (
                    <div
                      key={rec.id}
                      id={`rec-item-${rec.id}`}
                      className={`flex items-start space-x-4 border rounded-xl p-4 transition-all duration-300 ${
                        isChecked
                          ? 'border-emerald-500/30 bg-emerald-50/5 dark:border-emerald-500/20 dark:bg-emerald-950/5'
                          : 'border-slate-200 bg-transparent hover:border-slate-300 dark:border-slate-800 hover:dark:border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleRecommendationComplete(rec.id)}
                        className={`flex-shrink-0 mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded ${isChecked ? 'text-emerald-500' : ''}`}
                        aria-label={`Mark advice "${rec.title}" as complete`}
                        aria-pressed={isChecked}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-550 fill-emerald-500/10" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                        )}
                      </button>
                      
                      <div className="flex-grow">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className={`text-sm font-bold text-slate-900 dark:text-white transition-all ${isChecked ? 'line-through text-slate-400 dark:text-slate-500 font-medium' : ''}`}>
                            {rec.title}
                          </h4>
                          <div className="flex items-center space-x-1.5 text-xs font-semibold">
                            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 px-2 py-0.5 rounded font-mono">
                              {rec.impactText}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest ${
                              rec.priority === 'high' 
                                ? 'bg-red-50 text-red-500 dark:bg-red-950/20' 
                                : rec.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                        </div>
                        <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed ${isChecked ? 'text-slate-400 dark:text-slate-600' : ''}`}>
                          {rec.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

            </div>
          </div>
        </div>

        {/* Right column - Environmental Equivalencies Ledger & Help guides */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Equivalencies scorecard */}
          <div className="rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm dark:border-emerald-900/30 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Impact Equivalencies</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Visualizing the direct material consequences of emitting {annualTotal.toLocaleString()} kg CO₂ annually.
            </p>

            <div className="mt-6 space-y-4">
              
              {/* Coal equivalent */}
              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 leading-none">Coal Burned</div>
                  <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 leading-none">
                    {Math.round(annualTotal / 2.3).toLocaleString()} kg
                  </div>
                </div>
              </div>

              {/* Tree Absorption */}
              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 leading-none">Tree-Absorption Year-Equiv</div>
                  <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 leading-none">
                    {Math.round(annualTotal / 22).toLocaleString()} trees
                  </div>
                </div>
              </div>

              {/* Car Drive */}
              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 leading-none">Average Gas Car Driving Equivalent</div>
                  <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200 mt-1 leading-none">
                    {Math.round(annualTotal / 0.18).toLocaleString()} km
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-50/10 p-4 dark:border-cyan-500/10 dark:bg-cyan-950/5">
              <h4 className="text-xs font-bold text-cyan-800 dark:text-cyan-300">How EcoTrack scores you:</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Scores are determined matching yearly carbon outflows against scientific target limits. Lower totals yield higher sustainability indexes. Keep checking off actions and refining calculator records to watch metrics decline.
              </p>
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="rounded-3xl border border-emerald-50 bg-white p-6 shadow-sm dark:border-emerald-900/30 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Carbon Reduction Milestones</h3>
            <div className="mt-3.5 space-y-3">
              {[
                { title: '1. Input Audit', done: !!latestRecord, desc: 'Register baseline household variables.' },
                { title: '2. Deploy Sandbox Strategy', done: false, desc: 'Simulate climate projection variables.' },
                { title: '3. Lock Goal Protocol', done: false, desc: 'Anchor standard reductions on the Planner.' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs">
                  <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    ✓
                  </span>
                  <div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 leading-none">{step.title}</div>
                    <p className="text-[9px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
