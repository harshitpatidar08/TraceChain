import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to log event to blockchain
export async function logEventToBlockchain(traceId, stage, actorRole, eventHash) {
  try {
    const addressPath = path.join(__dirname, '..', 'contract-address.json');
    if (!fs.existsSync(addressPath)) {
      console.warn('Blockchain skipped: contract-address.json not found.');
      return null;
    }

    const { address } = JSON.parse(fs.readFileSync(addressPath, 'utf8'));

    // Connect to local hardhat node
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

    // ABI for SupplyChainLogger
    const abi = [
      "function logEvent(string memory traceId, string memory stage, string memory actorRole, string memory eventHash) public"
    ];

    // Use Hardhat's default first account private key for signing
    // Hardhat Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const signer = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(address, abi, signer);

    const tx = await contract.logEvent(traceId, stage, actorRole, eventHash);
    await tx.wait();

    return tx.hash;
  } catch (error) {
    console.error('Blockchain logging failed:', error.message);
    return null;
  }
}
