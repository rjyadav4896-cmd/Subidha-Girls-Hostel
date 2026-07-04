import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const LeaveRecordSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE', index: true },
    totalDays: { type: Number, default: 0 },
    feeImpact: { type: Number, default: 0 },
    billingCycleRef: { type: Schema.Types.ObjectId, ref: 'PaymentRecord' }
  },
  { timestamps: true }
);

export type LeaveRecord = InferSchemaType<typeof LeaveRecordSchema> & { _id: Types.ObjectId };
export const LeaveRecordModel = model('LeaveRecord', LeaveRecordSchema);
