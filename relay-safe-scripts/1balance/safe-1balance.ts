import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import Safe from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  MetaTransactionOptions,
} from "@safe-global/types-kit";
import * as dotenv from "dotenv";
import ContractInfo from "../../deployments/baseSepolia/SimpleCounter.json";

dotenv.config({ path: ".env" });

// Setup variables
const RPC_URL = process.env.RPC_URL_KEY!;
const OWNER_PRIVATE_KEY = process.env.GELATO_PK!; // Owner's private key
const safeAddress = "0x5E417f9d1dBbE6916fF7Be8A129A8b8A0B262609"; // Safe address
const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY!; // Gelato Relay API Key
const targetAddress = ContractInfo.address; // Counter contract address

async function sponsorTransaction() {
  try {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Initialize Safe Protocol Kit
    const protocolKit = await Safe.init({
      provider: RPC_URL,
      signer: OWNER_PRIVATE_KEY,
      safeAddress,
    });

    console.log("Initialized Safe Protocol Kit");

    // Initialize Gelato Relay Kit
    const relayKit = new GelatoRelayPack({
      apiKey: GELATO_RELAY_API_KEY,
      protocolKit,
    });

    console.log("Initialized Gelato Relay Kit");

    // Initialize Counter contract
    const counterContract = new ethers.Contract(
      targetAddress,
      ContractInfo.abi,
      provider
    );
    console.log("Counter contract initialized at:", targetAddress);

    // Prepare MetaTransaction data
    const transactions: MetaTransactionData[] = [
      {
        to: targetAddress,
        data: counterContract.interface.encodeFunctionData("increment", []),
        value: "0", // No ETH value sent
      },
    ];

    console.log("Prepared transaction data:", transactions);

    // MetaTransaction options
    const options: MetaTransactionOptions = {
      isSponsored: true, // Gelato 1Balance sponsorship
    };

    // Create the transaction
    const safeTransaction = await relayKit.createTransaction({
      transactions,
      options,
    });

    console.log("Created Safe transaction:", safeTransaction);

    // Sign the transaction
    const signedSafeTransaction = await protocolKit.signTransaction(
      safeTransaction
    );
    console.log("Signed the Safe transaction");

    // Execute the transaction using Gelato Relay
    const response = await relayKit.executeTransaction({
      executable: signedSafeTransaction,
      options,
    });

    console.log(
      `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
    );
  } catch (error) {
    console.error("Error in sponsoring transaction:", error);
  }
}

sponsorTransaction();
