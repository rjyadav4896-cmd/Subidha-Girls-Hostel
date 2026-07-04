import { SettingsModel, type Settings } from '../models/Settings.js';

const DEFAULT_SETTINGS = {
  fees: {
    twoSeater: 0,
    threeSeater: 0,
    fourSeater: 0,
    fiveSeater: 0
  },
  leaveDiscountRate: 0.5,
  adminEmail: 'pickyourhostel1@gmail.com',
  hostelUpiId: '',
  hostelDisplayName: '',
  paymentGateway: 'NONE',
  staticQrImageUrl: '',
  autoVerifyPayments: false
} as const;

function normalizeSettings(settings: any): Settings {
  return {
    ...settings,
    fees: {
      ...DEFAULT_SETTINGS.fees,
      ...(settings?.fees ?? {})
    },
    leaveDiscountRate: typeof settings?.leaveDiscountRate === 'number' ? settings.leaveDiscountRate : DEFAULT_SETTINGS.leaveDiscountRate,
    adminEmail: settings?.adminEmail || DEFAULT_SETTINGS.adminEmail,
    hostelUpiId: settings?.hostelUpiId ?? DEFAULT_SETTINGS.hostelUpiId,
    hostelDisplayName: settings?.hostelDisplayName ?? DEFAULT_SETTINGS.hostelDisplayName,
    paymentGateway: settings?.paymentGateway ?? DEFAULT_SETTINGS.paymentGateway,
    staticQrImageUrl: settings?.staticQrImageUrl ?? DEFAULT_SETTINGS.staticQrImageUrl,
    autoVerifyPayments: settings?.autoVerifyPayments ?? DEFAULT_SETTINGS.autoVerifyPayments
  } as Settings;
}

export async function getSettings(): Promise<Settings> {
  const existing = await SettingsModel.findOne().lean<Settings>().exec();
  if (existing) {
    const normalized = normalizeSettings(existing);
    const needsRepair =
      !existing.fees ||
      existing.fees.twoSeater == null ||
      existing.fees.threeSeater == null ||
      existing.fees.fourSeater == null ||
      existing.fees.fiveSeater == null ||
      existing.leaveDiscountRate == null;
    if (needsRepair) {
      await SettingsModel.updateOne(
        { _id: (existing as any)._id },
        {
          $set: {
            fees: normalized.fees,
            leaveDiscountRate: normalized.leaveDiscountRate
          }
        }
      ).exec();
    }
    return normalized;
  }
  const created = await SettingsModel.create(DEFAULT_SETTINGS);
  return normalizeSettings(created.toObject());
}

export async function updateSettings(patch: Partial<Settings>) {
  const $set: Record<string, unknown> = {};
  if (patch.fees) {
    if (patch.fees.twoSeater != null) $set['fees.twoSeater'] = patch.fees.twoSeater;
    if (patch.fees.threeSeater != null) $set['fees.threeSeater'] = patch.fees.threeSeater;
    if (patch.fees.fourSeater != null) $set['fees.fourSeater'] = patch.fees.fourSeater;
    if (patch.fees.fiveSeater != null) $set['fees.fiveSeater'] = patch.fees.fiveSeater;
  }
  for (const [key, value] of Object.entries(patch)) {
    if (key !== 'fees' && value !== undefined) $set[key] = value;
  }

  const updated = await SettingsModel.findOneAndUpdate({}, { $set }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean<Settings>().exec();
  return normalizeSettings(updated);
}
