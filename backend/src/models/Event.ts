import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  ticker: string;
  title?: string;
  imageUrl?: string;
  active: boolean;
  markets?: Array<{
    ticker: string;
    title: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    ticker: {
      type: String,
      required: [true, 'Ticker is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    markets: [
      {
        ticker: {
          type: String,
          required: true,
          trim: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create text index on title and markets.title for efficient searching
EventSchema.index({ title: 'text', 'markets.title': 'text' });

export default mongoose.model<IEvent>('Event', EventSchema);
