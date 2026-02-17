import { ZERO_LIMITS } from './constants';

export function applyRoundingRules(value: number, unit: 'g' | 'mg' | 'kcal' | 'kj'): number {
  if (value >= 10) {
    return Math.round(value);
  }

  if (value >= 1 && value < 10) {
    const rounded = Math.round(value * 10) / 10;
    if (rounded % 1 === 0) {
      return Math.round(rounded);
    }
    return rounded;
  }

  if (value < 1 && unit === 'g') {
    const rounded = Math.round(value * 10) / 10;
    return rounded;
  }

  if (value < 1 && (unit === 'mg' || unit === 'kcal' || unit === 'kj')) {
    const rounded = Math.round(value * 100) / 100;
    if (rounded * 10 % 1 === 0) {
      return Math.round(rounded * 10) / 10;
    }
    return rounded;
  }

  return value;
}

export function applyZeroRule(
  value: number,
  nutrient: keyof typeof ZERO_LIMITS
): number {
  const limit = ZERO_LIMITS[nutrient];
  if (limit !== undefined && value <= limit) {
    return 0;
  }
  return value;
}

export function formatDisplayValue(value: number, unit: 'g' | 'mg' | 'kcal' | 'kj'): string {
  if (value === 0) {
    return '0';
  }

  const rounded = applyRoundingRules(value, unit);

  if (rounded >= 10) {
    return rounded.toString();
  }

  if (rounded >= 1) {
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
  }

  if (unit === 'mg') {
    const str = rounded.toFixed(2);
    return str.endsWith('0') && !str.endsWith('.00') ? rounded.toFixed(1) : str;
  }

  return rounded.toFixed(1);
}
