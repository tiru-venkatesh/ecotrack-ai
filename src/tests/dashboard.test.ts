import { describe, it, expect } from 'vitest';
import { getDeterministicRecommendations, calculateEmissions } from '../utils/carbonCalculator';
import { EcoDataInput } from '../types';

describe('Deterministic AI Recommendations Engine', () => {
  it('should trigger high priority car transport and diet recommendations under heavy use', () => {
    const input: EcoDataInput = {
      travelDistance: 50, // High distance
      transportType: 'car',
      electricityConsume: 500, // High electricity
      foodPref: 'meat', // Animal diet
      flightsPerYear: 6, // Heavy flyer
      waterConsume: 350 // High water consumer
    };

    const emissions = calculateEmissions(input);
    const recommendations = getDeterministicRecommendations(input, emissions);

    // Verify recommendations list is populated
    expect(recommendations.length).toBeGreaterThan(0);

    // Should recommend switching car commutes (high priority)
    const carRec = recommendations.find(r => r.id === 'rec_transport_car');
    expect(carRec).toBeDefined();
    expect(carRec?.priority).toBe('high');
    expect(carRec?.category).toBe('transport');

    // Should recommend LED and smart switches for high electricity use
    const electricityRec = recommendations.find(r => r.id === 'rec_electricity_high');
    expect(electricityRec).toBeDefined();
    expect(electricityRec?.priority).toBe('high');
    expect(electricityRec?.category).toBe('energy');

    // Should suggest Meatless Mondays for heavy meat eaters
    const meatRec = recommendations.find(r => r.id === 'rec_food_meat');
    expect(meatRec).toBeDefined();
    expect(meatRec?.priority).toBe('high');
    expect(meatRec?.category).toBe('diet');

    // Should identify multiple flights and suggest de-congestion
    const flightRec = recommendations.find(r => r.id === 'rec_flight_high');
    expect(flightRec).toBeDefined();
    expect(flightRec?.priority).toBe('high');

    // Should identify heavy water volumes and recommend aerators
    const waterRec = recommendations.find(r => r.id === 'rec_water_high');
    expect(waterRec).toBeDefined();
    expect(waterRec?.priority).toBe('medium');
    expect(waterRec?.category).toBe('water');
  });

  it('should trigger lower priority suggestions for ultra-green inputs', () => {
    const input: EcoDataInput = {
      travelDistance: 5, // low distance
      transportType: 'walking',
      electricityConsume: 100, // low electricity
      foodPref: 'vegetarian', // climate-friendly diet
      flightsPerYear: 0, // no flights
      waterConsume: 80 // low water
    };

    const emissions = calculateEmissions(input);
    const recommendations = getDeterministicRecommendations(input, emissions);

    // Vegetarian should trigger local farming suggestions
    const vegRec = recommendations.find(r => r.id === 'rec_food_veg');
    expect(vegRec).toBeDefined();
    expect(vegRec?.priority).toBe('low');

    // Low electricity should trigger community solar schemes
    const solarRec = recommendations.find(r => r.id === 'rec_energy_solar');
    expect(solarRec).toBeDefined();
    expect(solarRec?.priority).toBe('medium');

    // Low water should trigger backyard rain collector
    const rainRec = recommendations.find(r => r.id === 'rec_water_rain');
    expect(rainRec).toBeDefined();
    expect(rainRec?.priority).toBe('low');
  });

  it('should trigger intermediate suggestions for EV, mixed diet, regional flight, and bus commuter', () => {
    const input: EcoDataInput = {
      travelDistance: 40,
      transportType: 'ev',
      electricityConsume: 200,
      foodPref: 'mixed',
      flightsPerYear: 3,
      waterConsume: 100
    };

    const emissions = calculateEmissions(input);
    const recommendations = getDeterministicRecommendations(input, emissions);

    // EV should trigger solar charging optimization
    const evRec = recommendations.find(r => r.id === 'rec_transport_ev');
    expect(evRec).toBeDefined();

    // Mixed food preferences should trigger plant-based margins
    const mixedFood = recommendations.find(r => r.id === 'rec_food_mixed');
    expect(mixedFood).toBeDefined();

    // Flight count of 3 should trigger gold-standard offsets suggestions
    const flightOffset = recommendations.find(r => r.id === 'rec_flight_offset');
    expect(flightOffset).toBeDefined();

    // Now test a public bus commuter
    const busInput: EcoDataInput = {
      ...input,
      transportType: 'bus'
    };
    const busEmissions = calculateEmissions(busInput);
    const busRecommendations = getDeterministicRecommendations(busInput, busEmissions);

    // Bus commuter should trigger active transition suggestion
    const activeCommRec = busRecommendations.find(r => r.id === 'rec_transport_active');
    expect(activeCommRec).toBeDefined();
  });
});
