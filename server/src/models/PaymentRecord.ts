import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const PaymentRecordSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    billingPeriodStart: { type: Date, required: true },
    billingPeriodEnd: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    creditCarriedOver: { type: Number, required: true, default: 0 },
    leaveDeduction: { type: Number, required: true, default: 0 },
    billingBreakdown: {
      monthlyFee: { type: Number, default: 0 },
      billableDays: { type: Number, default: 0 },
      daysInMonth: { type: Number, default: 0 },
      leaveDays: { type: Number, default: 0 },
      leaveDiscountAmount: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      creditApplied: { type: Number, default: 0 },
      creditRemaining: { type: Number, default: 0 },
      totalDue: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'VERIFICATION_PENDING'], required: true, default: 'PENDING' },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },

    // UPI / gateway metadata
    referenceId: { type: String },
    utrNumber: { type: String, index: true, sparse: true },
    gateway: { type: String, enum: ['NONE', 'KHALTI'], default: 'NONE' },
    gatewayPaymentId: { type: String },
    gatewayPayload: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

PaymentRecordSchema.index({ studentId: 1, billingPeriodStart: 1 }, { unique: true });

export type PaymentRecord = InferSchemaType<typeof PaymentRecordSchema> & { _id: Types.ObjectId };
export const PaymentRecordModel = model('PaymentRecord', PaymentRecordSchema);
