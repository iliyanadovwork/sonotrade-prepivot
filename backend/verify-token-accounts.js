/**
 * Script to verify which token account corresponds to which mint
 *
 * Usage: node verify-token-accounts.js <WALLET_PUBLIC_KEY>
 */

const { PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');

const MINTS = {
  NO_POSITION: 'F1MndHKaPMMCjjo3HJsU8BArNd212kjykiN7yH9Je3xT',
  YES_POSITION: '9W4zv64GzHJx6cmgF2XEkmmpRD6pwyipLe4oXjJcBRmp'
};

const EXPECTED_TOKEN_ACCOUNTS = [
  'GUV4o9eeJC7vj1Wg42EkAoKY2orjR7zegGVkMjCnKQTx',
  '5SohpksXWMcDnz1aAMxbtivUUuSNLvDSfrhd5jXJE79C'
];

async function verifyTokenAccounts(walletPublicKey) {
  console.log('Wallet Public Key:', walletPublicKey);
  console.log('\n=== Deriving Associated Token Accounts ===\n');

  const wallet = new PublicKey(walletPublicKey);

  // Derive ATA for NO position mint
  const noPositionATA = await getAssociatedTokenAddress(
    new PublicKey(MINTS.NO_POSITION),
    wallet,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  // Derive ATA for YES position mint
  const yesPositionATA = await getAssociatedTokenAddress(
    new PublicKey(MINTS.YES_POSITION),
    wallet,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  console.log('NO Position (isRedeemable: false, balance: 8):');
  console.log('  Mint:', MINTS.NO_POSITION);
  console.log('  Token Account:', noPositionATA.toBase58());
  console.log('  Match:', EXPECTED_TOKEN_ACCOUNTS.includes(noPositionATA.toBase58()) ? '✅' : '❌');

  console.log('\nYES Position (isRedeemable: true, balance: 9):');
  console.log('  Mint:', MINTS.YES_POSITION);
  console.log('  Token Account:', yesPositionATA.toBase58());
  console.log('  Match:', EXPECTED_TOKEN_ACCOUNTS.includes(yesPositionATA.toBase58()) ? '✅' : '❌');

  console.log('\n=== Summary ===');
  console.log(`\n${noPositionATA.toBase58()} = NO position (should be closed)`);
  console.log(`${yesPositionATA.toBase58()} = YES position (should NOT be closed)`);
}

// Get wallet address from command line
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error('Usage: node verify-token-accounts.js <WALLET_PUBLIC_KEY>');
  process.exit(1);
}

verifyTokenAccounts(walletAddress)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
