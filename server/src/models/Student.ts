import { Schema, model, type InferSchemaType, Types } from 'mongoose';

export const BedTypeEnum = ['2-Seater', '3-Seater', '4-Seater', '5-Seater'] as const;
export type BedType = (typeof BedTypeEnum)[number];

const StudentSchema = new Schema(
  {
    fullName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    bedType: { type: String, required: true, enum: BedTypeEnum },
    phone: { type: String, required: true },
    school: { type: String, required: true },
    address: { type: String, default: '' },
    guardianName: { type: String, required: true },
    localGuardianName: { type: String, default: '' },
    collegeOrWorkTiming: { type: String, default: '' },
    dateOfEntry: { type: Date, required: true },
    billingAnchorDay: { type: Number },
    nextDueDate: { type: Date },
    isOnLeave: { type: Boolean, default: false },
    currentLeaveId: { type: Schema.Types.ObjectId, ref: 'LeaveRecord', default: null },

    email: { type: String, required: true },

    username: { type: String, index: true, unique: true, sparse: true },
    passwordHash: { type: String },
    status: { type: String, enum: ['PENDING', 'ACTIVE', 'INACTIVE'], required: true, default: 'PENDING' },

    createdAt: { type: Date, default: () => new Date() }
  },
  { timestamps: false }
);

export type Student = InferSchemaType<typeof StudentSchema> & { _id: Types.ObjectId };
export const StudentModel = model('Student', StudentSchema);
