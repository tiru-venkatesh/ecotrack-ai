import { describe, it, expect } from 'vitest';
import { calculateSustainabilityScore, getEnvironmentalGrade, getGradeLabel } from '../utils/carbonCalculator';

describe('Sustainability Scoring & Grading Engine', () => {
  it('should calculate perfect score of 100 for very low carbon footprints', () => {
    // 0 emissions should yield 100
    const score = calculateSustainabilityScore(0);
    expect(score).toBe(100);

    const scoreLow = calculateSustainabilityScore(100); // 100 - (100 / 150) = 99.33 -> 99
    expect(scoreLow).toBe(99);
  });

  it('should clip scores to a lower limit of 5 for intense emissions', () => {
    // High emission like 20,000 kg CO2 should go below 0, but gets clipped to 5
    const score = calculateSustainabilityScore(20000);
    expect(score).toBe(5);
  });

  it('should map scores to correct alphabetical environmental grades', () => {
    expect(getEnvironmentalGrade(90)).toBe('A');
    expect(getEnvironmentalGrade(85)).toBe('A');
    expect(getEnvironmentalGrade(84)).toBe('B');
    expect(getEnvironmentalGrade(70)).toBe('B');
    expect(getEnvironmentalGrade(69)).toBe('C');
    expect(getEnvironmentalGrade(50)).toBe('C');
    expect(getEnvironmentalGrade(49)).toBe('D');
    expect(getEnvironmentalGrade(30)).toBe('D');
    expect(getEnvironmentalGrade(25)).toBe('E');
    expect(getEnvironmentalGrade(5)).toBe('E');
  });

  it('should assign respectful, literal, professional grade labels', () => {
    expect(getGradeLabel('A')).toBe('Climate Champion');
    expect(getGradeLabel('B')).toBe('Eco Guardian');
    expect(getGradeLabel('C')).toBe('Green Path Traveler');
    expect(getGradeLabel('D')).toBe('Carbon Conscious Miner');
    expect(getGradeLabel('E')).toBe('Carbon Intensive Consumer');
  });
});
