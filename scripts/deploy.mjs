/**
 * Deploy BatchSender + ContactBook to Celo Mainnet
 * 
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/deploy.mjs
 *
 * Requirements:
 *   npm install viem
 */

import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

// ── ABIs (minimal, for deployment verification) ───────────────────────────────
// Full ABIs are in lib/abis.ts — these are just for the deploy script

const BATCH_SENDER_BYTECODE = "0x"; // paste compiled bytecode here
const CONTACT_BOOK_BYTECODE = "0x"; // paste compiled bytecode here

// ── Setup ─────────────────────────────────────────────────────────────────────

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌  PRIVATE_KEY env variable is required");
  process.exit(1);
}

const account = privateKeyToAccount(privateKey);

const walletClient = createWalletClient({
  account,
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

// ── Deploy helper ─────────────────────────────────────────────────────────────

async function deployContract(name, bytecode) {
  console.log(`\n📦  Deploying ${name}...`);

  const hash = await walletClient.deployContract({
    abi: [],
    bytecode,
    type: "legacy", // MiniPay & Celo compatibility
  });

  console.log(`   Tx hash: ${hash}`);
  console.log(`   Waiting for confirmation...`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;

  console.log(`   ✅  ${name} deployed at: ${address}`);
  console.log(`   🔗  https://celoscan.io/address/${address}`);

  return address;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀  CeloWallet Contract Deployment`);
  console.log(`   Network:  Celo Mainnet (chain ID 42220)`);
  console.log(`   Deployer: ${account.address}`);

  const balance = await publicClient.getBalance({ address: account.address });
  const celoBalance = Number(balance) / 1e18;
  console.log(`   Balance:  ${celoBalance.toFixed(4)} CELO`);

  if (celoBalance < 0.01) {
    console.error("❌  Insufficient CELO for deployment (need at least 0.01)");
    process.exit(1);
  }

  const batchSenderAddress = await deployContract("BatchSender", BATCH_SENDER_BYTECODE);
  const contactBookAddress = await deployContract("ContactBook", CONTACT_BOOK_BYTECODE);

  console.log(`\n✅  Deployment complete!`);
  console.log(`\n   Add these to lib/contracts.ts:`);
  console.log(`   BATCH_SENDER_ADDRESS = "${batchSenderAddress}"`);
  console.log(`   CONTACT_BOOK_ADDRESS  = "${contactBookAddress}"`);

  console.log(`\n📋  Verify on CeloScan:`);
  console.log(`   https://celoscan.io/address/${batchSenderAddress}#code`);
  console.log(`   https://celoscan.io/address/${contactBookAddress}#code`);
}

main().catch((err) => {
  console.error("❌  Deployment failed:", err.message);
  process.exit(1);
});
