import React, { useState, useMemo } from 'react';
import { FootprintRecord, MonthlyGoal, EcoBadge } from '../types';
import { Leaf, Award, Target, Landmark, Coins, Trees, ShieldAlert, Sparkles, Compass, CheckCircle } from 'lucide-react';

interface PlannerProps {
  records: FootprintRecord[];
  badges: EcoBadge[];
  onUnlockBadge: (badgeId: string) => void;
  goals: MonthlyGoal[];
  onAddGoal: (goal: MonthlyGoal) => void;
  offsetCo2: number;
  setOffsetCo2: React.Dispatch<React.SetStateAction<number>>;
  communitySavedCo2: number;
  setCommunitySavedCo2: React.Dispatch<React.SetStateAction<number>>;
}

export default function Planner({
  records,
  badges,
  onUnlockBadge,
  goals,
  onAddGoal,
  offsetCo2,
  setOffsetCo2,
  communitySavedCo2,
  setCommunitySavedCo2
}: PlannerProps) {
  
  // States for goal form
  const [targetPercent, setTargetPercent] = useState(15);
  const [goalMonth, setGoalMonth] = useState('2026-07');
  
  // State for offset projects selection
  const [basket, setBasket] = useState<{ [key: string]: number }>({
    reforest: 0,
    seagrass: 0,
    sequestration: 0
  });

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;
  const currentTotal = latestRecord ? latestRecord.emissions.total : 6850;

  // Compile active goals
  const activeGoal = goals.length > 0 ? goals[goals.length - 1] : null;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetEmissions = Math.round(currentTotal * (1 - targetPercent / 100));

    const newGoal: MonthlyGoal = {
      id: 'goal_' + Date.now(),
      monthString: goalMonth,
      targetEmissions,
      baselineEmissions: currentTotal,
      isCompleted: false
    };

    onAddGoal(newGoal);
    onUnlockBadge('badge3'); // Target Lock-on badge
  };

  // Custom offset details
  const offsetProjects = [
    {
      id: 'reforest',
      title: 'Amazon Basin Reforestation',
      desc: 'Plant biodiverse, local hardwood timbers. Restores native wildlife corridors and topsoil humus.',
      cost: 15, // $15 per unit
      absorption: 22, // absorbs 22 kg CO2 / year per unit
      icon: Trees,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      id: 'seagrass',
      title: 'Seagrass Blue Carbon Meadows',
      desc: 'Sponsor aquatic seagrass transplantings. Blue carbon stores gas 35x quicker than tropical soils.',
      cost: 25,
      absorption: 35,
      icon: Leaf,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
    },
    {
      id: 'sequestration',
      title: 'Direct Air Carbon Sequestration',
      desc: 'Sponsor industrial fan networks capturing atmosphere molecules, storing them deep in basalt minerals.',
      cost: 65,
      absorption: 100,
      icon: Coins,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
    }
  ];

  const updateBasket = (id: string, delta: number) => {
    setBasket(prev => {
      const newVal = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: newVal };
    });
  };

  // Calculate compiled offset statistics
  const calculatedOffset = useMemo(() => {
    let Co2Total = 0;
    let costTotal = 0;
    
    offsetProjects.forEach(proj => {
      const quantity = basket[proj.id] || 0;
      Co2Total += quantity * proj.absorption;
      costTotal += quantity * proj.cost;
    });

    return { Co2Total, costTotal };
  }, [basket]);

  const handleCommitOffsets = () => {
    if (calculatedOffset.Co2Total > 0) {
      setOffsetCo2(prev => prev + calculatedOffset.Co2Total);
      setCommunitySavedCo2(prev => prev + calculatedOffset.Co2Total);
      // Reset basket
      setBasket({ reforest: 0, seagrass: 0, sequestration: 0 });
      onUnlockBadge('badge6'); // Sustainability Scholar badge
    }
  };

  // Global Cohort Benchmarking Dataset
  const benchmarkCohorts = [
    { name: 'Your Active Output', emissions: Math.max(0, currentTotal - offsetCo2), color: 'bg-emerald-500 text-white font-bold' },
    { name: 'COP31 Net Zero Target', emissions: 2000, color: 'bg-indigo-50 border border-indigo-55/10 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400' },
    { name: 'Global Citizen Median', emissions: 4500, color: 'bg-slate-50 border border-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-350' },
    { name: 'Local Citizen Household Average', emissions: 12000, color: 'bg-red-50 border border-red-500/10 text-red-700 dark:bg-red-950/10 dark:text-red-400' }
  ].sort((a,b) => a.emissions - b.emissions);

  // Commit commitments dynamically (increases current global user community pool)
  const commitPledge = (amount: number, badgeId?: string) => {
    setCommunitySavedCo2(prev => prev + amount);
    if (badgeId) {
      onUnlockBadge(badgeId);
    }
  };

  return (
    <section id="planner-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Intro section */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          The Carbon Reduction <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Planner & Gamification Suite</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500 dark:text-slate-400">
          Establish monthly carbon target blue-prints, explore dynamic offshore offset coordinates, and unlock rare sustainable progress badges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left column (Goal console + Benchmarking) */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Monthly goal blueprints setter */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Target Lock-on</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Lock down realistic yearly equivalent targets and compound monthly progress metrics.
            </p>

            {activeGoal ? (
              <div id="active-goal-box" className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-50/10 p-5 dark:border-emerald-500/10 dark:bg-emerald-950/10">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
                    Locked Target Month: {activeGoal.monthString}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                    Active
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Baseline Emissions:</span>
                    <div className="text-base font-black font-mono text-slate-800 dark:text-white mt-0.5">
                      {activeGoal.baselineEmissions.toLocaleString()} kg/yr
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Target Envelope Limit:</span>
                    <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeGoal.targetEmissions.toLocaleString()} kg/yr
                    </div>
                  </div>
                </div>

                {/* Progress bar mock representation */}
                <div className="mt-5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                    <span>In-progress Performance</span>
                    <span>100% Target Met</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="targetPercent" className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Reduction</label>
                    <select
                      id="targetPercent"
                      value={targetPercent}
                      onChange={(e) => setTargetPercent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-transparent p-2.5 text-xs font-semibold focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    >
                      <option value="5">5% Reduction (Easy)</option>
                      <option value="15">15% Reduction (Recommended)</option>
                      <option value="30">30% Reduction (High Ambition)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="goalMonth" className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Month</label>
                    <input
                      id="goalMonth"
                      type="month"
                      value={goalMonth}
                      onChange={(e) => setGoalMonth(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-transparent p-2.5 text-xs font-semibold focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 text-slate-705 dark:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  id="btn-lock-monthly-goal"
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-slate-811 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Anchor Goal Blueprint
                </button>
              </form>
            )}

          </div>

          {/* Environmental Cohort Benchmarking Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 mb-4">
              <Landmark className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Community Cohort Benchmarking</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Compare your current net footprint against local averages and international Net-Zero agreements.
            </p>

            <div className="space-y-3">
              {benchmarkCohorts.map((cohort, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-xs transition-colors duration-350 ${cohort.color}`}
                >
                  <span className="font-semibold">{cohort.name}</span>
                  <span className="font-mono font-black">{cohort.emissions.toLocaleString()} kg CO₂/yr</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column (Gamification badging + Certified Offsets simulator) */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Unlocked Badges Gallery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Unlocked Eco-Badges Gallery</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium">
              Actions taken across calculator forms, goal blueprint consoles, and offset simulators unlock rare glowing certificates.
            </p>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  id={`badge-card-${b.id}`}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                    b.unlocked
                      ? 'border-emerald-500/30 bg-gradient-to-tr from-emerald-50/10 to-emerald-100/5 shadow-md dark:border-emerald-500/10 dark:from-emerald-950/20 dark:to-emerald-900/10'
                      : 'border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 grayscale opacity-40'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full mb-2 bg-gradient-to-tr ${
                    b.unlocked 
                      ? 'from-emerald-400 to-cyan-555 text-white shadow-md shadow-emerald-500/10' 
                      : 'from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-700'
                  }`}>
                    {/* Simplified dynamic Icon lookup */}
                    <Award className="h-5.5 w-5.5" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{b.title}</div>
                  <span className="text-[9px] text-slate-400 mt-1 leading-snug">{b.description}</span>
                  {b.unlocked && b.unlockedAt && (
                    <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-2">
                      Unlocked {b.unlockedAt.split('-').slice(1).join('/')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Offsets simulators */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-2 mb-4">
              <Coins className="h-5 w-5 text-emerald-500 animate-spin" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Certified Offsets simulator</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Sponsor verified conservation indices to absorb atmospheric compounds and offset unavoidable flight totals.
            </p>

            <div className="space-y-4">
              {offsetProjects.map((proj) => {
                const quantity = basket[proj.id] || 0;
                const IconComponent = proj.icon;
                return (
                  <div key={proj.id} className="flex items-center justify-between p-3 border rounded-xl border-slate-100 dark:border-slate-800">
                    <div className="flex items-start space-x-3 max-w-[70%]">
                      <div className={`p-2.5 rounded-lg flex-shrink-0 ${proj.color}`}>
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{proj.title}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">{proj.desc}</p>
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
                          Cost: ${proj.cost} | Absorbs: ~{proj.absorption} kg CO₂ / yr
                        </span>
                      </div>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => updateBasket(proj.id, -1)}
                        className="h-6 w-6 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-white w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateBasket(proj.id, 1)}
                        className="h-6 w-6 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total calculators summaries */}
            <div className="mt-5 border-t pt-4 border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Simulation Price:</span>
                <span className="font-mono font-bold text-slate-850 dark:text-white">${calculatedOffset.costTotal} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1.5">
                <span className="text-slate-500 dark:text-slate-400">Total Equivalent Sequestration:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">-{calculatedOffset.Co2Total} kg CO₂/yr</span>
              </div>

              <button
                id="btn-execute-offsets-sim"
                onClick={handleCommitOffsets}
                disabled={calculatedOffset.Co2Total === 0}
                className={`w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg px-4 py-2 text-xs font-bold shadow-md shadow-emerald-500/10 cursor-pointer ${calculatedOffset.Co2Total === 0 ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:opacity-95'}`}
              >
                Execute Offset simulation credits
              </button>
            </div>
          </div>

          {/* Shared Action commitment ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Collective Action commitments</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              Bind commitments with thousands of fellow global EcoTrack users. Committing directly increases the collective aggregate counter shown in page margins!
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[
                { label: 'Single-Use Plastic Ban', co2: 75, badge: 'badge2' },
                { label: 'Methane Zero diet pledge', co2: 450, badge: 'badge4' },
                { label: 'LED Vampire Load Slayed', co2: 120, badge: 'badge1' },
                { label: 'Eco Rain-Pond Restored', co2: 30, badge: 'badge6' }
              ].map((pledge, idx) => (
                <button
                  key={idx}
                  id={`pledge-btn-${idx}`}
                  onClick={() => commitPledge(pledge.co2, pledge.badge)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-emerald-500/40 text-left hover:bg-emerald-50/10 text-slate-700 dark:border-slate-800 dark:hover:border-emerald-500/10 dark:hover:bg-emerald-950/10 dark:text-slate-350 cursor-pointer transition-all"
                >
                  <div className="max-w-[70%]">
                    <span className="text-[10px] font-bold block leading-snug">{pledge.label}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">+{pledge.co2} kg saved</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
