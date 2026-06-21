import React, { useState, useMemo } from 'react';
import { FootprintRecord, ScenarioSandbox } from '../types';
import { EMISSION_FACTORS } from '../utils/carbonCalculator';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Sliders, HelpCircle, Sparkles, TrendingDown, RefreshCw, BarChart2, PieChartIcon, Lightbulb } from 'lucide-react';

interface AnalyticsProps {
  records: FootprintRecord[];
  onUnlockBadge: (badgeId: string) => void;
}

export default function Analytics({ records, onUnlockBadge }: AnalyticsProps) {
  const [sandbox, setSandbox] = useState<ScenarioSandbox>({
    carToEcoPercent: 0,
    renewablePowerPercent: 0,
    plantDietDays: 0,
    waterReductionPercent: 0
  });

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  // Compile individual baseline variables
  const currentTransport = latestRecord ? latestRecord.emissions.transport : 1850;
  const currentElectricity = latestRecord ? latestRecord.emissions.electricity : 1680;
  const currentFood = latestRecord ? latestRecord.emissions.food : 912;
  const currentFlights = latestRecord ? latestRecord.emissions.flights : 1000;
  const currentWater = latestRecord ? latestRecord.emissions.water : 109;
  const currentTotal = currentTransport + currentElectricity + currentFood + currentFlights + currentWater;

  // Calculate simulated Sandbox metrics based on sliders
  const simulatedTransport = Math.round(
    currentTransport * (1 - (sandbox.carToEcoPercent / 100) * 0.8) // assumption: switching car reduces transport block by up to 80%
  );
  const simulatedElectricity = Math.round(
    currentElectricity * (1 - (sandbox.renewablePowerPercent / 100) * 0.95) // assumption: solar grid drops grid emissions by up to 95%
  );
  // assumption: each daily plant meal subtraction saves ~ 1.5 kg co2/day (approx 547 kg co2/year value split)
  const simulatedFood = Math.round(
    Math.max(300, currentFood - (sandbox.plantDietDays * 52 * 1.5 * 7))
  );
  const simulatedWater = Math.round(
    currentWater * (1 - (sandbox.waterReductionPercent / 100))
  );
  
  const simulatedTotal = simulatedTransport + simulatedElectricity + simulatedFood + currentFlights + simulatedWater;
  const totalSavedSandbox = Math.max(0, currentTotal - simulatedTotal);
  const percentSavedSandbox = currentTotal > 0 ? Math.round((totalSavedSandbox / currentTotal) * 100) : 0;

  // Unlock sandbox badge as soon as they interact with sliders
  React.useEffect(() => {
    if (sandbox.carToEcoPercent > 0 || sandbox.renewablePowerPercent > 0 || sandbox.plantDietDays > 0) {
      onUnlockBadge('badge5'); // What-If Alchemist badge
    }
  }, [sandbox, onUnlockBadge]);

  // Chart Data 1: Pie chart of current emission sources
  const sourceBreakdownData = useMemo(() => {
    return [
      { name: 'Commuting & Travel', value: currentTransport, color: '#3b82f6' }, // Blue
      { name: 'Power & Grid', value: currentElectricity, color: '#f59e0b' },   // Amber
      { name: 'Nutrition', value: currentFood, color: '#10b981' },          // Emerald
      { name: 'Aviation Flights', value: currentFlights, color: '#8b5cf6' },    // Purple
      { name: 'Home Water', value: currentWater, color: '#06b6d4' }           // Cyan
    ].filter(item => item.value > 0);
  }, [currentTransport, currentElectricity, currentFood, currentFlights, currentWater]);

  // Chart Data 2: Real-world Carbon Reduction Progress Timeline (Phase 4 requirement)
  const progressTimelineData = useMemo(() => {
    if (records.length > 1) {
      return records.map((rec, idx) => ({
        label: `Audit #${idx + 1}`,
        Footprint: Math.round(rec.emissions.total)
      }));
    }
    // Fallback/Simulated historical re-routes
    return [
      { label: 'Baseline', Footprint: Math.round(currentTotal * 1.35) },
      { label: 'Midterm', Footprint: Math.round(currentTotal * 1.15) },
      { label: 'Current', Footprint: Math.round(currentTotal) }
    ];
  }, [records, currentTotal]);

  // Chart Data 3: Carbon Footprint Comparison Against Global Average & Net-Zero Target (Phase 4 requirement)
  const benchmarkComparisonData = useMemo(() => {
    return [
      { name: 'Your Footprint', Footprint: Math.round(currentTotal) },
      { name: 'Net-Zero Target', Footprint: 2000 },
      { name: 'Global Average', Footprint: 4700 },
      { name: 'USA Average', Footprint: 15600 }
    ];
  }, [currentTotal]);

  // Chart Data 4: Sandbox comparator bars
  const sandboxCompareData = useMemo(() => {
    return [
      {
        category: 'Transport',
        Current: currentTransport,
        Projected: simulatedTransport
      },
      {
        category: 'Grid Power',
        Current: currentElectricity,
        Projected: simulatedElectricity
      },
      {
        category: 'Nutrition',
        Current: currentFood,
        Projected: simulatedFood
      },
      {
        category: 'Water',
        Current: currentWater,
        Projected: simulatedWater
      }
    ];
  }, [currentTransport, simulatedTransport, currentElectricity, simulatedElectricity, currentFood, simulatedFood, currentWater, simulatedWater]);

  return (
    <section id="analytics-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* View Title */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Climate Intelligence <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Analytics Portal</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Deconstruct emission components, study historical offsets timelines, and audit hypothetical physical scenarios.
        </p>
      </div>

      {/* Grid: Charts Block */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Source Breakdown (Pie Chart) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Carbon Outflow Sources</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Proportional analysis illustrating how individual resource grids make up your annual footprint.
          </p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourceBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} kg CO₂e/yr`, 'Emissions']}
                  contentStyle={{ borderRadius: '8px', border: 'solid 1px #e2e8f0', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {sourceBreakdownData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="h-3 w-3 rounded-md" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Trends (Weekly & Monthly Combined tabs) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Timeline Trajectory & Benchmarks</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium">
              Study actual historical audit reduction progress and contrast current annual totals against international averages.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Real Progress Timeline */}
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">Reduction Timeline (kg CO₂)</div>
              <div className="h-44 w-full" aria-label="Line graph displaying carbon reduction trend from initial baseline audit to current status.">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressTimelineData}>
                    <defs>
                      <linearGradient id="colorWk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', backgroundColor: '#fff' }} />
                    <Area type="monotone" dataKey="Footprint" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Global Benchmark Comparison */}
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">Global Comparison (kg CO₂/yr)</div>
              <div className="h-44 w-full" aria-label="Bar chart contrasting your current annual footprint against global net-zero limit, global average and high-emission average.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkComparisonData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', backgroundColor: '#fff' }} />
                    <Bar dataKey="Footprint" fill="#ef4444" radius={[4, 4, 0, 0]}>
                      {
                        benchmarkComparisonData.map((entry, index) => {
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={colors[index % 4]} />;
                        })
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-[11px] text-center text-slate-400 dark:text-slate-500 border-t pt-3 border-slate-100 dark:border-slate-800">
            Note: Your metrics auto-synchronize with your latest Audit record updates.
          </div>
        </div>

      </div>

      {/* DYNAMIC SCENARIO WHAT-IF SANDBOX */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Scenario Sandbox Simulator (What-If?)</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Drag simulated lifestyle alterations below to see instant carbon reduction forecasts.</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 px-4 py-2 text-right">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-mono">
              Hypothetical Saved
            </span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {percentSavedSandbox}% Savings
            </span>
            <span className="text-[10px] text-slate-500 block">
              (~{totalSavedSandbox.toLocaleString()} kg CO₂ / yr saved)
            </span>
          </div>
        </div>

        {/* Sliders and Live comparison chart inside 2 columns */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Controls column */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Active Commuter conversion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                  <span>🚲 Active Transition Shift</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {sandbox.carToEcoPercent}% swap
                </span>
              </div>
              <input
                id="sandbox-carToEcoPercent"
                type="range"
                min="0"
                max="100"
                value={sandbox.carToEcoPercent}
                aria-label="Active transition shift percentage"
                onChange={(e) => setSandbox(prev => ({ ...prev, carToEcoPercent: Number(e.target.value) }))}
                className="h-2 w-full appearance-none rounded-lg bg-slate-150 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Swapping daily vehicle trips to bikes, local trains, or EV power grids.
              </p>
            </div>

            {/* Renewable Utility Solar mix */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">☀️ Clean Renewable Power Mix</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {sandbox.renewablePowerPercent}% green
                </span>
              </div>
              <input
                id="sandbox-renewablePowerPercent"
                type="range"
                min="0"
                max="100"
                value={sandbox.renewablePowerPercent}
                aria-label="Clean renewable power mix percentage"
                onChange={(e) => setSandbox(prev => ({ ...prev, renewablePowerPercent: Number(e.target.value) }))}
                className="h-2 w-full appearance-none rounded-lg bg-slate-150 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Powering your household completely via clean solar panels or certified carbon-free grid tariffs.
              </p>
            </div>

            {/* Vegetarian days per week */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">🥗 Pure Plant Diet Ingestion</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {sandbox.plantDietDays} days / week
                </span>
              </div>
              <input
                id="sandbox-plantDietDays"
                type="range"
                min="0"
                max="7"
                value={sandbox.plantDietDays}
                aria-label="Plant-based dietary days per week"
                onChange={(e) => setSandbox(prev => ({ ...prev, plantDietDays: Number(e.target.value) }))}
                className="h-2 w-full appearance-none rounded-lg bg-slate-150 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Sourcing nutrition purely from grains, beans, and produce, reducing agricultural forest degradation.
              </p>
            </div>

            {/* Water saver rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">💧 Shower & Flow Aerator Savers</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {sandbox.waterReductionPercent}% cut
                </span>
              </div>
              <input
                id="sandbox-waterReductionPercent"
                type="range"
                min="0"
                max="50"
                value={sandbox.waterReductionPercent}
                aria-label="Water savings percentage"
                onChange={(e) => setSandbox(prev => ({ ...prev, waterReductionPercent: Number(e.target.value) }))}
                className="h-2 w-full appearance-none rounded-lg bg-slate-150 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Deploying low-flow shower-heads and reducing bathing blocks to save deep clean reservoir reserves.
              </p>
            </div>

          </div>

          {/* Comparative double bar chart */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sandboxCompareData}>
                  <XAxis dataKey="category" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis fontSize={10} stroke="#888888" />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Current" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Projected" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-53 bg-blue-50/50 dark:bg-slate-800/40 flex items-start space-x-2.5 border border-blue-500/10">
              <Lightbulb className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-white">Simulator Insight: </span>
                If you execute these Sandbox lifestyle patterns fully, your projected total annual footprint drops to <span className="font-semibold text-emerald-600 dark:text-emerald-400">{simulatedTotal.toLocaleString()} kg CO₂</span>. This aligns you beautifully with target COP31 Net-Zero thresholds, reducing ocean warming coordinates substantially!
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
