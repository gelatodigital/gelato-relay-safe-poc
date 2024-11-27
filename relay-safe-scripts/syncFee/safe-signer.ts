import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import Safe, { SigningMethod } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/types-kit";
import * as dotenv from "dotenv";
import ContractInfo from "../../deployments/baseSepolia/SimpleCounter.json";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL_KEY!;
const signerPrivateKey = process.env.GELATO_PK!; // Single Signer
const safeAddress = "0x5E417f9d1dBbE6916fF7Be8A129A8b8A0B262609"; // Base sepolia AM Safe account
const nativeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const targetAddress = ContractInfo.address;
const gasLimit = "10000000";

async function relayTransaction() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Initialize Safe Protocol Kit for the single signer
  const protocolKit = await Safe.init({
    provider: RPC_URL,
    signer: signerPrivateKey,
    safeAddress,
  });

  console.log("Initialized Safe Protocol Kit");

  // Retrieve and log the Safe account balance
  const safeBalance = await provider.getBalance(safeAddress);
  console.log("Safe Account Balance:", ethers.formatEther(safeBalance), "ETH");

  // Log Safe configuration
  const safeOwners = await protocolKit.getOwners();
  console.log("Safe Owners:", safeOwners);

  const safeThreshold = await protocolKit.getThreshold();
  console.log("Safe Threshold:", safeThreshold);

  // Validate Safe deployment
  const isSafeDeployed = await protocolKit.isSafeDeployed();
  console.log("Is Safe Deployed:", isSafeDeployed);

  if (!isSafeDeployed) {
    console.error("Safe is not deployed. Exiting.");
    return;
  }

  // Create an instance of the Gelato Relay Kit
  const relayKit = new GelatoRelayPack({ protocolKit });
  console.log("Initialized Gelato Relay Kit");

  // Initialize the Counter contract
  const counterContract = new ethers.Contract(
    targetAddress,
    ContractInfo.abi,
    new ethers.Wallet(signerPrivateKey, provider)
  );
  console.log("Counter contract initialized at:", targetAddress);

  // Prepare MetaTransaction Data
  const transactions: MetaTransactionData[] = [
    {
      to: targetAddress,
      data: counterContract.interface.encodeFunctionData("increment", []),
      value: "0",
    },
  ];

  console.log("Prepared transaction data:", transactions);

  // Create the Safe transaction
  let safeTransaction = await relayKit.createTransaction({ transactions });
  console.log("Created Safe transaction:", safeTransaction);

  // Sign the transaction with the single signer
  safeTransaction = await protocolKit.signTransaction(
    safeTransaction,
    SigningMethod.ETH_SIGN
  );
  console.log("Single signer signed the transaction");

  // Execute the Safe transaction using Gelato Relay
  try {
    const response = await relayKit.executeTransaction({
      executable: safeTransaction,
      options: { gasLimit, isSponsored: false, gasToken: nativeToken }, // Include options for gas limit and sponsorship
    });

    console.log(
      `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
    );
  } catch (error) {
    console.error("Failed to execute transaction:", error);
  }
}

relayTransaction();
