import { describe, it, expect } from 'vitest';
import { calculateEmissions, EMISSION_FACTORS } from '../utils/carbonCalculator';
import { EcoDataInput } from '../types';

describe('Carbon Calculator', () => {
  it('should correctly calculate emissions for mixed diet and car commuter', () => {
    const input: EcoDataInput = {
      travelDistance: 20, // 20 km daily
      transportType: 'car',
      electricityConsume: 300, // 300 kWh/month
      foodPref: 'mixed',
      flightsPerYear: 2,
      waterConsume: 150 // 150 liters/day
    };

    const emissions = calculateEmissions(input);

    // Transport emissions: travelDistance * 365 * transportFactor
    // 20 * 365 * 0.18 = 1314
    expect(emissions.transport).toBe(1314);

    // Electricity emissions: electricityConsume * 12 * factor
    // 300 * 12 * 0.40 = 1440
    expect(emissions.electricity).toBe(1440);

    // Food preferences emissions
    // 'mixed' = 912.5
    expect(emissions.food).toBe(913); // Rounded is 913 (912.5 rounded is 913)

    // Flight emissions: flightsPerYear * factor
    // 2 * 500 = 1000
    expect(emissions.flights).toBe(1000);

    // Water emissions: waterConsume * 365 * factor
    // 150 * 365 * 0.002 = 109.5 -> rounded is 110
    expect(emissions.water).toBe(110);

    // Total should equal the rounded sum of raw inputs (1314 + 1440 + 912.5 + 1000 + 109.5 = 4776.0 -> 4776)
    // Sum of individually rounded outputs would be 1314 + 1440 + 913 + 1000 + 110 = 4777
    expect(emissions.total).toBe(4776);
  });

  it('should return 0 transport emissions for walking and cycling', () => {
    const input: EcoDataInput = {
      travelDistance: 15,
      transportType: 'walking',
      electricityConsume: 0,
      foodPref: 'vegetarian',
      flightsPerYear: 0,
      waterConsume: 0
    };

    const emissions = calculateEmissions(input);
    expect(emissions.transport).toBe(0);
    expect(emissions.electricity).toBe(0);
    expect(emissions.flights).toBe(0);
    expect(emissions.water).toBe(0);
    expect(emissions.food).toBe(548); // vegetarian factor is 547.5
    expect(emissions.total).toBe(548);
  });

  it('should evaluate ev transport factors correctly', () => {
    const input: EcoDataInput = {
      travelDistance: 100,
      transportType: 'ev',
      electricityConsume: 100,
      foodPref: 'meat',
      flightsPerYear: 5,
      waterConsume: 250
    };

    const emissions = calculateEmissions(input);
    // EV factor is 0.05. 100 * 365 * 0.05 = 1825
    expect(emissions.transport).toBe(1825);
  });
});
