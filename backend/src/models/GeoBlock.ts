import mongoose from 'mongoose';

const geoBlockSchema = new mongoose.Schema({
  countryCode: { type: String, required: true, unique: true }, // ISO 3166-1 alpha-2 code (e.g., "US", "GB")
  countryName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const GeoBlock = mongoose.model('GeoBlock', geoBlockSchema);
