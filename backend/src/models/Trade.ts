import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  internalTradeId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  inputMint: String,
  outputMint: String,
  inputAmount: Number,
  outputAmount: Number,
  quotePriceImpactPct: Number,
  slippageBps: Number,
  predictionMarketSlippageBps: Number,
  solanaSignature: String,
  platformFeeSignature: String,
  sponsorPublicKey: String,

  // Timestamps as milliseconds since epoch
  requestReceivedAt: Number,
  quoteReceivedAt: Number,
  signedAt: Number,
  txSubmittedAt: Number,
  feeCollectedAt: Number,

  platformFeeUSDC: Number,

  // Market and event information
  ticker: String,
  marketTitle: String,
  eventTitle: String,
  eventTicker: String,
  side: String, // 'buy' or 'sell'
  outcome: String, // 'yes' or 'no'
});

export const Trade = mongoose.model('Trade', tradeSchema);

