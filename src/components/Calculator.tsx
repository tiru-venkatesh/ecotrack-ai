import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FootprintRecord, TransportType, FoodPreference, EcoDataInput } from '../types';
import { calculateEmissions, calculateSustainabilityScore, getEnvironmentalGrade } from '../utils/carbonCalculator';
import { Car, Bike, Bus, Train, Shuffle, Flame, Sparkles, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const calculatorSchema = z.object({
  travelDistance: z.number().min(0, "Distance must be 0 or positive.").max(500, "Daily distance cannot exceed 500 km."),
  transportType: z.enum(['car', 'bike', 'bus', 'train', 'ev', 'walking'] as const),
  electricityConsume: z.number().min(0, "Consumption must be 0 or positive.").max(5000, "Consumption must be extremely realistic (under 5000 kWh/month)."),
  foodPref: z.enum(['vegetarian', 'mixed', 'meat'] as const),
  flightsPerYear: z.number().min(0, "Flight count cannot be negative.").max(100, "Flight count must be realistic."),
  waterConsume: z.number().min(0, "Water consumption must be 0 or positive.").max(1000, "Average water consumption must be under 1000 liters/day.")
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

interface CalculatorProps {
  onRecordAdded: (record: FootprintRecord) => void;
  lastRecord: FootprintRecord | null;
}

export default function Calculator({ onRecordAdded, lastRecord }: CalculatorProps) {
  const [step, setStep] = useState(1);
  const [isAuditing, setIsAuditing] = useState(false);

  // default to last record if available, else standard baselines
  const defaultValues: CalculatorFormValues = lastRecord ? {
    travelDistance: lastRecord.input.travelDistance,
    transportType: lastRecord.input.transportType,
    electricityConsume: lastRecord.input.electricityConsume,
    foodPref: lastRecord.input.foodPref,
    flightsPerYear: lastRecord.input.flightsPerYear,
    waterConsume: lastRecord.input.waterConsume
  } : {
    travelDistance: 25,
    transportType: 'car',
    electricityConsume: 350,
    foodPref: 'mixed',
    flightsPerYear: 2,
    waterConsume: 150
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues
  });

  const watchValues = watch();

  const handleAuditSubmit = (values: CalculatorFormValues) => {
    setIsAuditing(true);
    // Simulate auditing delay
    setTimeout(() => {
      const emissions = calculateEmissions(values);
      const score = calculateSustainabilityScore(emissions.total);
      const grade = getEnvironmentalGrade(score);

      const record: FootprintRecord = {
        id: 'rec_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        input: values,
        emissions,
        sustainabilityScore: score,
        grade
      };

      onRecordAdded(record);
      setIsAuditing(false);
      setStep(1); // reset step to 1
    }, 1200);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Live total estimation safely updated on user change
  const currentEstTotal = React.useMemo(() => {
    try {
      const safeValues: EcoDataInput = {
        travelDistance: Number(watchValues.travelDistance) || 0,
        transportType: watchValues.transportType || 'car',
        electricityConsume: Number(watchValues.electricityConsume) || 0,
        foodPref: watchValues.foodPref || 'mixed',
        flightsPerYear: Number(watchValues.flightsPerYear) || 0,
        waterConsume: Number(watchValues.waterConsume) || 0
      };
      return calculateEmissions(safeValues).total;
    } catch {
      return 0;
    }
  }, [watchValues]);

  return (
    <section id="calculator-section" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Intro Banner */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Assess Your <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Eco Footprint</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500 dark:text-slate-400">
          Enter your behavioral data and EcoTrack will execute a high-fidelity carbon audit, contrasting your scores against optimal global safety targets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Form panel */}
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/60 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            
            {/* Step Indicators */}
            <div className="flex border-b border-slate-100 bg-slate-55/40 dark:border-slate-800/80">
              {[
                { number: 1, label: 'Commute' },
                { number: 2, label: 'Energy & Res' },
                { number: 3, label: 'Diet & Flight' }
              ].map((s) => (
                <div
                  key={s.number}
                  className={`flex-1 text-center py-4 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    step === s.number
                      ? 'border-b-2 border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                    {s.number}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Form Box */}
            <form onSubmit={handleSubmit(handleAuditSubmit)} className="p-6 sm:p-8" aria-label="Carbon Audit Form">
              
              {/* STEP 1: Commuting */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transportation Profile</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">How do you navigate your daily routines?</p>
                  </div>

                  {/* Transport Buttons */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Mode of Transport</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'car', label: 'Gas Car', icon: Car, desc: 'Single occupancy' },
                        { type: 'ev', label: 'EV', icon: Sparkles, desc: 'Electric vehicle' },
                        { type: 'bus', label: 'Bus', icon: Bus, desc: 'City public bus' },
                        { type: 'train', label: 'Local Train', icon: Train, desc: 'Eco rail lines' },
                        { type: 'bike', label: 'Bicycle', icon: Bike, desc: 'Active commute' },
                        { type: 'walking', label: 'Walking', icon: Shuffle, desc: 'Zero emissions' }
                      ].map((item) => {
                        const IconComp = item.icon;
                        const isSelected = watchValues.transportType === item.type;
                        return (
                          <button
                            key={item.type}
                            id={`transport-btn-${item.type}`}
                            type="button"
                            onClick={() => setValue('transportType', item.type as TransportType)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                            }`}
                          >
                            <IconComp className="h-5 w-5 mb-1.5" />
                            <span className="text-xs font-bold leading-tight">{item.label}</span>
                            <span className="text-[9px] text-slate-400 mt-1 hidden sm:inline">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Travel Distance Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-centerCent flex-wrap">
                      <label htmlFor="travelDistance" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Average Daily Travel Distance (KM)
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        {watchValues.travelDistance} km / day
                      </span>
                    </div>
                    <input
                      id="travelDistance"
                      type="range"
                      min="0"
                      max="150"
                      aria-label="Daily travel distance"
                      className="h-2 w-full appearance-none rounded-lg bg-slate-100 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
                      {...register('travelDistance', { valueAsNumber: true })}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span>0 km</span>
                      <span>50 km (Commuter)</span>
                      <span>100 km+ (Heavy Travel)</span>
                    </div>
                    {errors.travelDistance && <span id="error-travelDistance" className="text-xs text-red-500 font-semibold">{errors.travelDistance.message}</span>}
                  </div>

                  {/* Next Arrow */}
                  <div className="pt-4 flex justify-end">
                    <button
                      id="btn-next-step-2"
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-1.5 bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer transition-colors"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Energy & Home */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Home Energy & Conservation</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Provide estimates on resource consumption within your residence.</p>
                  </div>

                  {/* Electricity Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap">
                      <label htmlFor="electricityConsume" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Monthly Electricity Consumption (kWh)
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                        {watchValues.electricityConsume} kWh / month
                      </span>
                    </div>
                    <input
                      id="electricityConsume"
                      type="range"
                      min="0"
                      max="1200"
                      step="10"
                      aria-label="Monthly electricity consumption"
                      className="h-2 w-full appearance-none rounded-lg bg-slate-100 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
                      {...register('electricityConsume', { valueAsNumber: true })}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span>0 (Net zero solar)</span>
                      <span>300 (Average Apt)</span>
                      <span>800+ (Large Residence)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Pro-tip: Refer to your utility service invoice details to see your typical Monthly Kilowatt-Hours.
                    </p>
                    {errors.electricityConsume && <span id="error-electricityConsume" className="text-xs text-red-500 font-semibold">{errors.electricityConsume.message}</span>}
                  </div>

                  {/* Water Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap">
                      <label htmlFor="waterConsume" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Average Daily Water Usage (Liters)
                      </label>
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-0.5 rounded-full">
                        {watchValues.waterConsume} L / day
                      </span>
                    </div>
                    <input
                      id="waterConsume"
                      type="range"
                      min="10"
                      max="450"
                      step="5"
                      aria-label="Daily water consumption"
                      className="h-2 w-full appearance-none rounded-lg bg-slate-100 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
                      {...register('waterConsume', { valueAsNumber: true })}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span>10 L (Eco ultra)</span>
                      <span>150 L (Typical single)</span>
                      <span>350 L+ (Excessive baths)</span>
                    </div>
                    {errors.waterConsume && <span id="error-waterConsume" className="text-xs text-red-500 font-semibold">{errors.waterConsume.message}</span>}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="pt-4 flex justify-between">
                    <button
                      id="btn-back-step-1"
                      type="button"
                      onClick={prevStep}
                      className="flex items-center space-x-1.5 border border-slate-200 text-slate-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <button
                      id="btn-next-step-3"
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-1.5 bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer transition-colors"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Diet & Flight */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nutrition & Aviation Profile</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Dietary profiles and global air travel frequencies dictate significant carbon blocks.</p>
                  </div>

                  {/* Food Preference Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dietary Preference</label>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {[
                        { type: 'vegetarian', label: 'Vegetarian / Vegan', desc: 'No livestock meat consumption' },
                        { type: 'mixed', label: 'Balanced / Mixed', desc: 'Poultry, seafood & dairy bundles' },
                        { type: 'meat', label: 'Frequent Red Meat', desc: 'Beef, pork, and high mutton plates' }
                      ].map((item) => {
                        const isSelected = watchValues.foodPref === item.type;
                        return (
                          <button
                            key={item.type}
                            id={`food-btn-${item.type}`}
                            type="button"
                            onClick={() => setValue('foodPref', item.type as FoodPreference)}
                            className={`flex flex-col items-start rounded-xl border p-4.5 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-bold">{item.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flight Frequency Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap">
                      <label htmlFor="flightsPerYear" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Annual Individual Flights Taken
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        {watchValues.flightsPerYear} flights / year
                      </span>
                    </div>
                    <input
                      id="flightsPerYear"
                      type="range"
                      min="0"
                      max="15"
                      aria-label="Flights per year"
                      className="h-2 w-full appearance-none rounded-lg bg-slate-100 dark:bg-slate-800 accent-emerald-500 cursor-pointer"
                      {...register('flightsPerYear', { valueAsNumber: true })}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span>0 flights</span>
                      <span>3 (Moderate travel)</span>
                      <span>10+ (Frequent flyer)</span>
                    </div>
                    {errors.flightsPerYear && <span id="error-flightsPerYear" className="text-xs text-red-500 font-semibold">{errors.flightsPerYear.message}</span>}
                  </div>

                  {/* Progress navigation & final submit */}
                  <div className="pt-4 flex justify-between">
                    <button
                      id="btn-back-step-2"
                      type="button"
                      onClick={prevStep}
                      className="flex items-center space-x-1.5 border border-slate-200 text-slate-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <button
                      id="btn-submit-calc"
                      type="submit"
                      disabled={isAuditing}
                      className={`flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 rounded-lg px-6 py-2.5 text-sm font-bold relative transition-all duration-300 cursor-pointer hover:opacity-90 ${
                        isAuditing ? 'opacity-80 cursor-wait' : ''
                      }`}
                    >
                      {isAuditing ? (
                        <>
                          <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Auditing Profile...</span>
                        </>
                      ) : (
                        <>
                          <Flame className="h-4.5 w-4.5" />
                          <span>Generate Audit Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Real-time Indicator Panel on Right */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-50/10 p-5 dark:border-emerald-500/10 dark:bg-emerald-950/5">
            <h3 className="font-semibold text-slate-800 dark:text-emerald-200 text-sm tracking-tight flex items-center space-x-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Auditing Screen</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
              Interactive estimates based on changing dials:
            </p>

            <div className="mt-5 space-y-4">
              {/* Transport Estimate Indicator */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Monthly Transport:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {Math.round((watchValues.travelDistance * 30 * (EMISSIONS_FACTORS.transport[watchValues.transportType || 'car'])))} kg CO₂
                </span>
              </div>

              {/* Electricity Estimate Indicator */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Monthly Electricity:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {Math.round(watchValues.electricityConsume * EMISSIONS_FACTORS.electricity)} kg CO₂
                </span>
              </div>

              {/* Flight estimation indicator */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Aviation block (Yearly):</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {Math.round(watchValues.flightsPerYear * EMISSIONS_FACTORS.flight)} kg CO₂
                </span>
              </div>

              {/* Total CO2 Yearly equivalent */}
              <div className="border-t border-dashed border-emerald-500/30 pt-4 dark:border-emerald-500/10">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Est. Annual Outflow
                </div>
                <div className="text-2xl font-black font-mono tracking-tight text-slate-800 dark:text-emerald-100">
                  {currentEstTotal.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg CO₂e</span>
                </div>
                
                {/* Visual meter */}
                <div className="w-full h-1.5 mt-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentEstTotal > 10000 ? 'bg-red-500' : currentEstTotal > 5000 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentEstTotal / 15000) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                  <span>Carbon Neutral</span>
                  <span>15K Global Limit</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start space-x-2 text-[11px] text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed rounded-lg border border-emerald-500/20 bg-emerald-50/50 p-3 dark:bg-emerald-900/10">
              <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                By finishing this form, EcoTrack AI activates the machine learning engine to suggest local offsets, target reduction grids, and unlock progress badges.
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// helper variables copied in for safe rendering
const EMISSIONS_FACTORS = {
  transport: {
    car: 0.18,
    ev: 0.05,
    bus: 0.06,
    train: 0.04,
    bike: 0,
    walking: 0
  },
  electricity: 0.40,
  flight: 500
};
