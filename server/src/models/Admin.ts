import { Schema, model, type InferSchemaType } from 'mongoose';

const AdminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true }
  },
  { timestamps: true }
);

export type Admin = InferSchemaType<typeof AdminSchema>;
export const AdminModel = model('Admin', AdminSchema);

