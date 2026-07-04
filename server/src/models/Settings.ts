import { Schema, model, type InferSchemaType } from 'mongoose';

const SettingsSchema = new Schema(
  {
    fees: {
      twoSeater: { type: Number, required: true, default: 0 },
      threeSeater: { type: Number, required: true, default: 0 },
      fourSeater: { type: Number, required: true, default: 0 },
      fiveSeater: { type: Number, required: true, default: 0 }
    },
    leaveDiscountRate: { type: Number, required: true, default: 0.5 },
    adminEmail: { type: String, required: true, default: 'pickyourhostel1@gmail.com' },

    hostelUpiId: { type: String, default: '' },
    hostelDisplayName: { type: String, default: '' },
    paymentGateway: { type: String, enum: ['NONE', 'KHALTI'], default: 'NONE' },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecretEnc: { type: String, default: '' },
    razorpayWebhookSecretEnc: { type: String, default: '' },
    staticQrImageUrl: { type: String, default: '' },
    autoVerifyPayments: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export type Settings = InferSchemaType<typeof SettingsSchema>;
export const SettingsModel = model('Settings', SettingsSchema);
