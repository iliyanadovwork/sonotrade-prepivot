/**
 * Generate a Sponsor Wallet for Gas Fee Sponsorship
 * 
 * This script creates a new Solana keypair that your platform will use
 * to pay for users' transaction fees (gasless swaps).
 * 
 * Usage:
 *   npx ts-node scripts/generate-sponsor-wallet.ts
 */

import { Keypair } from '@solana/web3.js';

console.log('🔐 Generating Sponsor Wallet...\n');

// Generate new keypair
const sponsorWallet = Keypair.generate();

// Get public key
const publicKey = sponsorWallet.publicKey.toString();

// Get private key in base64 format (for environment variable)
const privateKeyBase64 = Buffer.from(sponsorWallet.secretKey).toString('base64');

// Display results
console.log('✅ Sponsor Wallet Generated Successfully!\n');
console.log('━'.repeat(70));
console.log('\n📋 WALLET DETAILS:\n');
console.log(`Public Key:  ${publicKey}`);
console.log(`\n🔑 Private Key (Base64):\n${privateKeyBase64}\n`);
console.log('━'.repeat(70));

console.log('\n📝 NEXT STEPS:\n');
console.log('1. Fund this wallet with SOL:');
console.log(`   - For devnet: solana airdrop 2 ${publicKey} --url devnet`);
console.log(`   - For mainnet: Send SOL to ${publicKey}`);
console.log('   - Recommended minimum: 0.1 SOL\n');

console.log('2. Add to your backend/.env file:');
console.log(`   SPONSOR_PRIVATE_KEY=${privateKeyBase64}\n`);

console.log('3. Restart your backend server\n');

console.log('⚠️  SECURITY WARNING:');
console.log('   - Keep the private key secret');
console.log('   - Never commit to git');
console.log('   - Add to .gitignore');
console.log('   - Use environment variables only\n');

console.log('━'.repeat(70));
console.log('\n✨ Your platform will now pay gas fees for all user trades!\n');
