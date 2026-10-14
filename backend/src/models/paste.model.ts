import mongoose, { Schema, Document } from "mongoose";

export interface IPaste extends Document {
  pasteId: string;
  content: string;
  createdAt: Date;
  expiresAt: Date | null;
  maxViews: number | null;
  views: number;
  purgeAt: Date | null;
  deleteTokenHash: string;
}

const pasteSchema = new Schema<IPaste>(
  {
    pasteId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    maxViews: {
      type: Number,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    purgeAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0 },
    },
    deleteTokenHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

export const Paste = mongoose.models.Paste || mongoose.model<IPaste>("Paste", pasteSchema);
