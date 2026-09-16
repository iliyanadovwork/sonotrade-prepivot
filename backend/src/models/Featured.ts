import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatured extends Document {
  ticker: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedSchema: Schema = new Schema(
  {
    ticker: {
      type: String,
      required: [true, 'Ticker is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFeatured>('Featured', FeaturedSchema);
