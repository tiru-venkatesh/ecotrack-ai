import { EcoDataInput, EmissionsBreakdown, FootprintRecord, AIInsight, EnvironmentalTip, EcoBadge } from '../types';

// Emission factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  transport: {
    car: 0.18,      // kg CO2 per km
    ev: 0.05,       // kg CO2 per km
    bus: 0.06,      // kg CO2 per km
    train: 0.04,     // kg CO2 per km
    bike: 0,
    walking: 0
  },
  electricity: 0.40, // kg CO2 per kWh
  food: {
    vegetarian: 547.5, // kg CO2 per year (1.5 kg/day)
    mixed: 912.5,      // kg CO2 per year (2.5 kg/day)
    meat: 1460.0       // kg CO2 per year (4.0 kg/day)
  },
  flight: 500,     // kg CO2 per flight (average medium-haul)
  water: 0.002     // kg CO2 per liter (composite pumping + partial electric heating)
};

/**
 * Calculates raw annual CO2 emissions in kg from individual ecological consumption metrics.
 * 
 * @param input - The individual's daily travel, utility, diet, flight, and water inputs.
 * @returns A structured yearly CO2 emissions breakdown for all categories in kg CO2/year.
 */
export function calculateEmissions(input: EcoDataInput): EmissionsBreakdown {
  const transportFactor = EMISSION_FACTORS.transport[input.transportType];
  const yearlyTransport = input.travelDistance * 365 * transportFactor;

  const yearlyElectricity = input.electricityConsume * 12 * EMISSION_FACTORS.electricity;

  const yearlyFood = EMISSION_FACTORS.food[input.foodPref];

  const yearlyFlights = input.flightsPerYear * EMISSION_FACTORS.flight;

  const yearlyWater = input.waterConsume * 365 * EMISSION_FACTORS.water;

  const total = yearlyTransport + yearlyElectricity + yearlyFood + yearlyFlights + yearlyWater;

  return {
    transport: Math.round(yearlyTransport),
    electricity: Math.round(yearlyElectricity),
    food: Math.round(yearlyFood),
    flights: Math.round(yearlyFlights),
    water: Math.round(yearlyWater),
    total: Math.round(total)
  };
}

/**
 * Converts annual emissions into a sustainability score from 5 to 100.
 * A score of 100 indicates total alignment with the global 2,000 kg baseline.
 * 
 * @param totalEmissions - Combined yearly CO2 output in kg.
 * @returns An ecological sustainability score between 5 and 100.
 */
export function calculateSustainabilityScore(totalEmissions: number): number {
  // Global sustainable baseline ~ 2000 kg CO2/year. High emitter ~ 15000 kg CO2/year.
  // Formula shapes a score from 0 to 100
  const score = 100 - (totalEmissions / 150);
  return Math.max(5, Math.min(100, Math.round(score)));
}

/**
 * Resolves an environmental letter grade from 'A' to 'E' based on the sustainability score.
 * 
 * @param score - Sustainability score (5 to 100).
 * @returns An environmental tier classification letter.
 */
export function getEnvironmentalGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'E';
}

/**
 * Provides a descriptive literal label matching the given environmental grade tier.
 * 
 * @param grade - Environmental grade tier 'A' through 'E'.
 * @returns A title describing the category of consumer.
 */
export function getGradeLabel(grade: 'A' | 'B' | 'C' | 'D' | 'E'): string {
  const labels = {
    A: 'Climate Champion',
    B: 'Eco Guardian',
    C: 'Green Path Traveler',
    D: 'Carbon Conscious Miner',
    E: 'Carbon Intensive Consumer'
  };
  return labels[grade];
}

/**
 * Generates local deterministic fallback action cards corresponding to the user's footprint profiles.
 * Runs instantly when the server or Gemini network is offline, bypassing lag or errors.
 * 
 * @param input - The original ecological input.
 * @param emissions - The calculated emissions breakdown.
 * @returns An array of prioritized, categorised fallback recommendations.
 */
export function getDeterministicRecommendations(input: EcoDataInput, emissions: EmissionsBreakdown): AIInsight[] {
  const recommendations: AIInsight[] = [];

  // Transport Recommendation
  if (input.transportType === 'car' && input.travelDistance > 10) {
    recommendations.push({
      id: 'rec_transport_car',
      category: 'transport',
      title: 'Adopt Active Commuting or public transit',
      impactText: `Saves ~${Math.round(emissions.transport * 0.4)} kg CO2/year`,
      priority: 'high',
      text: `Switching 40% of your current car mileage (${input.travelDistance} km/day) to a bicycle, walking, or local train/bus can lead to a major footprint reduction. Consider carpooling or an electric vehicle (EV) as a secondary eco-option.`,
      actionable: true
    });
  } else if (input.transportType === 'ev' && input.travelDistance > 30) {
    recommendations.push({
      id: 'rec_transport_ev',
      category: 'transport',
      title: 'Optimize EV Charging with solar power',
      impactText: `Saves ~${Math.round(emissions.transport * 0.3)} kg CO2/year`,
      priority: 'low',
      text: 'Charging your Electric Vehicle during daytime solar peaks or signing up for a green renewable grid tariff reduces the indirect coal/gas power emissions of your clean EV commutes.',
      actionable: true
    });
  } else if (input.transportType !== 'walking' && input.transportType !== 'bike') {
    recommendations.push({
      id: 'rec_transport_active',
      category: 'transport',
      title: 'Introduce walking/biking blocks',
      impactText: 'Saves ~120 kg CO2/year',
      priority: 'medium',
      text: 'For local trips under 3km, try substituting motorized transport with healthy active walking or cycling, saving high-fuel cold starts.',
      actionable: true
    });
  }

  // Electricity Recommendation
  if (input.electricityConsume > 250) {
    recommendations.push({
      id: 'rec_electricity_high',
      category: 'energy',
      title: 'Transition to LED and Smart Off-switches',
      impactText: `Saves ~${Math.round(emissions.electricity * 0.15)} kg CO2/year`,
      priority: 'high',
      text: `Your electricity use is ${input.electricityConsume} kWh/month. Upgrading to Energy Star products, deploying smart plugs (to kill vampire draws), and installing energy-efficient LED bulbs can cut your electricity footprint instantly by 15% with zero habit disruption.`,
      actionable: true
    });
  } else {
    recommendations.push({
      id: 'rec_energy_solar',
      category: 'energy',
      title: 'Explore Community Solar schemes',
      impactText: `Saves ~${Math.round(emissions.electricity * 0.5)} kg CO2/year`,
      priority: 'medium',
      text: 'Access clean solar energy through green utility tariffs or community solar shares, transforming your energy baseline into zero-emissions power.',
      actionable: true
    });
  }

  // Food Choice Recommendation
  if (input.foodPref === 'meat') {
    recommendations.push({
      id: 'rec_food_meat',
      category: 'diet',
      title: 'Kickstart Meatless Mondays',
      impactText: 'Saves ~400 kg CO2/year',
      priority: 'high',
      text: 'Animal agriculture, particularly beef and lamb, accounts for extremely heavy methane and land-use carbon. Substituting meat with delicious, protein-rich legumes and whole grains just 2 days a week drops animal-agriculture load by 30%.',
      actionable: true
    });
  } else if (input.foodPref === 'mixed') {
    recommendations.push({
      id: 'rec_food_mixed',
      category: 'diet',
      title: 'Incorporate more plant-based spreads',
      impactText: 'Saves ~200 kg CO2/year',
      priority: 'medium',
      text: 'Try transitioning mixed dairy or chicken items to direct oat/soy alternatives. Expanding your vegan or vegetarian meals by 25% represents an exceptional compound win for global arable soils.',
      actionable: true
    });
  } else {
    recommendations.push({
      id: 'rec_food_veg',
      category: 'diet',
      title: 'Support local agroecological farming',
      impactText: 'Saves ~80 kg CO2/year',
      priority: 'low',
      text: 'As a vegetarian, you are doing incredible work! Further optimize by purchasing in-season local organic produce to bypass long fossil-fuel cargo flights and cold storage networks.',
      actionable: true
    });
  }

  // Flight Recommendation
  if (input.flightsPerYear > 4) {
    recommendations.push({
      id: 'rec_flight_high',
      category: 'general',
      title: 'De-congest high flight loops',
      impactText: `Saves ~${Math.round(input.flightsPerYear * 150)} kg CO2/year`,
      priority: 'high',
      text: `Taking ${input.flightsPerYear} flights annually releases deep atmospheric warming gases. Swap 1 or 2 regional routes for speed trains, or combine multiple business objectives into a single extended stay or leverage digital virtual conference suites.`,
      actionable: true
    });
  } else if (input.flightsPerYear > 0) {
    recommendations.push({
      id: 'rec_flight_offset',
      category: 'general',
      title: 'Sponsor Gold Standard tree/soil offsets',
      impactText: 'Compensates flight impact completely',
      priority: 'medium',
      text: 'For air travels you cannot cut down, invest in certified high-additionality local bio-char projects or gas capture coordinates to properly close the loop.',
      actionable: true
    });
  }

  // Water Recommendation
  if (input.waterConsume > 200) {
    recommendations.push({
      id: 'rec_water_high',
      category: 'water',
      title: 'Equip low-flow shower aerators',
      impactText: `Saves ~${Math.round(emissions.water * 0.25)} kg CO2/year`,
      priority: 'medium',
      text: `Water consumption is ${input.waterConsume} L/day. Installing affordable spray aerators on taps and reducing shower blockages by 2 minutes reduces the water volume needing grid-pumping and hot-tank reheating.`,
      actionable: true
    });
  } else {
    recommendations.push({
      id: 'rec_water_rain',
      category: 'water',
      title: 'Set up backyard rain collectors',
      impactText: 'Conserves local municipal reservoirs',
      priority: 'low',
      text: 'Gather clean rainwater to supply standard garden watering chores, maintaining topsoil microbiome humidity naturally.',
      actionable: true
    });
  }

  return recommendations;
}

export const ENVIRONMENTAL_TIPS: EnvironmentalTip[] = [
  {
    id: 'tip1',
    category: 'energy',
    title: 'The Vampire Load Vampire Slayer',
    difficulty: 'Easy',
    description: 'Microwaves, TVs, and phone chargers consume "standby power" even when turned off. Plug them into smart power strips that completely disengage from grids.',
    co2Saving: 'saves ~80 kg CO2/year'
  },
  {
    id: 'tip2',
    category: 'transport',
    title: 'Maintain Eco-Inflation in Tires',
    difficulty: 'Easy',
    description: 'Under-inflated tires decrease car fuel economy by 3%. Regularly checking and refilling tires to standard cold pressures boosts direct fuel range effortlessly.',
    co2Saving: 'saves ~110 kg CO2/year'
  },
  {
    id: 'tip3',
    category: 'food',
    title: 'The Organic Waste Composting Loop',
    difficulty: 'Medium',
    description: 'Food rotting in dense, anaerobic landfills generates hazardous methane gas (28x more warming than CO2). Composting organic scraps at home returns carbon back to standard soil microbes.',
    co2Saving: 'saves ~150 kg CO2/year'
  },
  {
    id: 'tip4',
    category: 'water',
    title: 'Cold wash your laundry laundry bundles',
    difficulty: 'Easy',
    description: 'About 75-90% of a laundry washing machine\'s total energy is spent purely on heating water. Switching temperature dials to "Cold" cleans clothes similarly and stops electric coil spikes.',
    co2Saving: 'saves ~70 kg CO2/year'
  },
  {
    id: 'tip5',
    category: 'energy',
    title: 'Program smart thermostats for night drops',
    difficulty: 'Medium',
    description: 'Lowering household target temps by 2°C (3.6°F) at bedtime or away periods translates to great electrical and natural gas savings.',
    co2Saving: 'saves ~240 kg CO2/year'
  },
  {
    id: 'tip6',
    category: 'offsets',
    title: 'Plant bio-diverse local flower hedges',
    difficulty: 'Easy',
    description: 'Native plants integrate carbon deeply in roots and provide natural wildlife corridors for pollinators, countermanding standard pesticide-reliant mono-culture grass sod lawns.',
    co2Saving: 'absorbs ~20 kg CO2/year'
  }
];

export const INITIAL_BADGES: EcoBadge[] = [
  {
    id: 'badge1',
    title: 'Carbon Pioneer',
    description: 'Completed your first carbon footprint calculation audit.',
    icon: 'Calculator',
    unlocked: false,
    category: 'calc'
  },
  {
    id: 'badge2',
    title: 'Green Path Finder',
    description: 'Unlocked a Sustainability Score above 65.',
    icon: 'TrendingDown',
    unlocked: false,
    category: 'calc'
  },
  {
    id: 'badge3',
    title: 'Target Lock-on',
    description: 'Established a sustainable monthly carbon reduction goal.',
    icon: 'Target',
    unlocked: false,
    category: 'goal'
  },
  {
    id: 'badge4',
    title: 'Absolute Zero Hero',
    description: 'Achieved a Climate Champion Grade (A) on EcoTrack.',
    icon: 'Award',
    unlocked: false,
    category: 'reduction'
  },
  {
    id: 'badge5',
    title: 'What-If Alchemist',
    description: 'Manipulated climate variables in the Sandbox Simulator.',
    icon: 'Sliders',
    unlocked: false,
    category: 'sandbox'
  },
  {
    id: 'badge6',
    title: 'Sustainability Scholar',
    description: 'Committed to a high-impact carbon offset strategy.',
    icon: 'Leaf',
    unlocked: false,
    category: 'trivia'
  }
];
