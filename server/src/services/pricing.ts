import { getSettings } from './settings.js';
import type { BedType } from '../models/Student.js';
import type { Settings } from '../models/Settings.js';

export function getFeeForBedType(bedType: string, settings: Settings): number {
  switch (bedType) {
    case '2-Seater':
      return settings.fees.twoSeater;
    case '3-Seater':
      return settings.fees.threeSeater;
    case '4-Seater':
      return settings.fees.fourSeater;
    case '5-Seater':
      return settings.fees.fiveSeater;
    default:
      return 0;
  }
}

export async function monthlyFeeForBedType(bedType: BedType) {
  const settings = await getSettings();
  return getFeeForBedType(bedType, settings);
}

export function warnMissingFee(studentName: string, bedType: string) {
  // eslint-disable-next-line no-console
  console.warn(`[billing] Missing monthly fee for ${bedType}. Skipping payment record for ${studentName} until fees are configured in Settings.`);
}
