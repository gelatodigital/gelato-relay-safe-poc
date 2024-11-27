import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import Safe, { SigningMethod } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/types-kit";
import * as dotenv from "dotenv";
import ContractInfo from "../../deployments/baseSepolia/SimpleCounter.json";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL_KEY!;
const signerPrivateKey = process.env.GELATO_PK!;
const safeAddress = "0x5E417f9d1dBbE6916fF7Be8A129A8b8A0B262609";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; // WETH on Base Sepolia
const GELATO_RELAY_ADDRESS = "0xaBcC9b596420A9E9172FD5938620E265a0f9Df92"; // Base Sepolia Gelato Relay Address
const targetAddress = ContractInfo.address;
const gasLimit = "10000000";

// WETH ABI (minimal for approve function)
// Comprehensive WETH ABI
const WETH_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
];

async function relayTransaction() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(signerPrivateKey, provider);

  // Initialize Safe Protocol Kit
  const protocolKit = await Safe.init({
    provider: RPC_URL,
    signer: signerPrivateKey,
    safeAddress,
  });

  // Create WETH contract instance
  const wethContract = new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);

  // Check WETH balance
  const wethBalance = await wethContract.balanceOf(safeAddress);
  console.log("WETH Balance:", ethers.formatEther(wethBalance));

  // Check current allowance
  const currentAllowance = await wethContract.allowance(
    safeAddress,
    GELATO_RELAY_ADDRESS
  );
  console.log("Current WETH Allowance:", ethers.formatEther(currentAllowance));

  // Approve Gelato Relay to spend WETH
  const approvalAmount = ethers.parseEther("0.01"); // Approve enough for gas
  const approveTx = await wethContract.approve(
    GELATO_RELAY_ADDRESS,
    approvalAmount
  );
  await approveTx.wait();
  console.log("WETH Approval Transaction Sent");

  // Create an instance of the Gelato Relay Kit
  const relayKit = new GelatoRelayPack({ protocolKit });

  // Initialize the Counter contract
  const counterContract = new ethers.Contract(
    targetAddress,
    ContractInfo.abi,
    signer
  );

  // Prepare MetaTransaction Data
  const transactions: MetaTransactionData[] = [
    {
      to: targetAddress,
      data: counterContract.interface.encodeFunctionData("increment", []),
      value: "0",
    },
  ];

  // Create the Safe transaction
  let safeTransaction = await relayKit.createTransaction({ transactions });

  // Sign the transaction with the single signer
  safeTransaction = await protocolKit.signTransaction(
    safeTransaction,
    SigningMethod.ETH_SIGN
  );

  // Execute the Safe transaction using Gelato Relay
  try {
    const response = await relayKit.executeTransaction({
      executable: safeTransaction,
      options: {
        gasLimit,
        isSponsored: false,
        gasToken: WETH_ADDRESS,
      },
    });

    console.log(
      `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
    );
  } catch (error) {
    console.error("Failed to execute transaction:", error);
    console.error("Detailed Error:", JSON.stringify(error, null, 2));
  }
}

relayTransaction();
