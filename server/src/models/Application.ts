import { Schema, model, type InferSchemaType, Types } from 'mongoose';
import { BedTypeEnum } from './Student.js';

const ApplicationSchema = new Schema(
  {
    fullName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    bedType: { type: String, required: true, enum: BedTypeEnum },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    school: { type: String, required: true },
    address: { type: String, required: true },
    guardianName: { type: String, required: true },
    localGuardianName: { type: String, required: true },
    collegeOrWorkTiming: { type: String, required: true },
    dateOfEntry: { type: Date, required: true },
    passportPhotoDataUrl: { type: String, required: true },
    citizenshipDataUrl: { type: String, required: true },

    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], required: true, default: 'PENDING' },

    tempUsername: { type: String, required: true },
    tempPasswordEnc: { type: String, required: true },

    // One-time email actions
    actionTokenHash: { type: String, required: true, index: true },
    actionTokenExpiresAt: { type: Date, required: true },
    actionTokenUsedAt: { type: Date },

    createdAt: { type: Date, default: () => new Date() }
  },
  { timestamps: false }
);

export type Application = InferSchemaType<typeof ApplicationSchema> & { _id: Types.ObjectId };
export const ApplicationModel = model('Application', ApplicationSchema);
