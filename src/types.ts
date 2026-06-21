export type TransportType = 'car' | 'bike' | 'bus' | 'train' | 'ev' | 'walking';
export type FoodPreference = 'vegetarian' | 'mixed' | 'meat';

export interface EcoDataInput {
  travelDistance: number; // daily km
  transportType: TransportType;
  electricityConsume: number; // monthly kWh
  foodPref: FoodPreference;
  flightsPerYear: number;
  waterConsume: number; // daily liters
}

export interface EmissionsBreakdown {
  transport: number; // kg CO2 / year
  electricity: number; // kg CO2 / year
  food: number; // kg CO2 / year
  flights: number; // kg CO2 / year
  water: number; // kg CO2 / year
  total: number; // kg CO2 / year
}

export interface FootprintRecord {
  id: string;
  date: string; // YYYY-MM-DD
  input: EcoDataInput;
  emissions: EmissionsBreakdown;
  sustainabilityScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E'; // rating
}

export interface MonthlyGoal {
  id: string;
  monthString: string; // e.g., "2026-06"
  targetEmissions: number; // kg CO2 / year equivalent target
  baselineEmissions: number; // kg CO2 / year baseline
  isCompleted: boolean;
}

export interface EcoBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon identifier
  unlocked: boolean;
  unlockedAt?: string;
  category: 'calc' | 'goal' | 'reduction' | 'sandbox' | 'trivia';
}

export interface AIInsight {
  id: string;
  category: 'energy' | 'transport' | 'diet' | 'water' | 'general';
  title: string;
  impactText: string; // e.g., "Saves ~450 kg CO2/year"
  priority: 'high' | 'medium' | 'low';
  text: string;
  actionable: boolean;
  completed?: boolean;
}

export interface ScenarioSandbox {
  carToEcoPercent: number; // slider 0 - 100
  renewablePowerPercent: number; // slider 0 - 100
  plantDietDays: number; // slider 0 - 7
  waterReductionPercent: number; // slider 0 - 50
}

export interface CommunityBenchmark {
  cohort: string;
  averageEmissions: number; // kg CO2/year
  userDistance: number; // percentage difference
}

export interface EnvironmentalTip {
  id: string;
  category: 'energy' | 'transport' | 'food' | 'water' | 'offsets';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  co2Saving: string;
}
