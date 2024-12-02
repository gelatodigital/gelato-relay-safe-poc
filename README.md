# Gelato Relay Safe Transactions

This project demonstrates how to sponsor and execute transactions on a Safe using Gelato's Relay and 1Balance features. It supports:

- Sponsoring transactions using Gelato 1Balance.
- Executing transactions with the native token (`syncFee`).
- Executing transactions with ERC20 tokens (`syncFee`).

## Prerequisites

Before running any scripts, ensure you have:

1. **Node.js and Yarn**: Installed and configured.
2. **Hardhat**: Installed in the project.
3. **Environment Variables**: Create a `.env` file with the following keys:
   - `RPC_URL_KEY`: RPC URL for Base Sepolia.
   - `GELATO_PK`: Private key for the Safe owner (1/1 signer).
   - `GELATO_RELAY_API_KEY`: API key for Gelato 1Balance.

Example `.env` file:

```plaintext
RPC_URL_KEY=<Your_Base_Sepolia_RPC_URL>
GELATO_PK=<Your_Private_Key>
GELATO_RELAY_API_KEY=<Your_Gelato_1Balance_API_Key>
```

## Scripts

### 1. Safe with Gelato 1Balance

Run this script to sponsor a transaction to the counter contract using Gelato 1Balance.

```bash
yarn safe-1balance
```

**File**: `./relay-safe-scripts/1balance/safe-1balance.ts`

### 2. Safe with syncFee (Native Token)

Run this script to execute a transaction using the native token (ETH) for fees.

```bash
yarn safe-syncFee-native
```

**File**: `./relay-safe-scripts/syncFee/safe-signer.ts`

### 3. Safe with syncFee (ERC20 Token)

Run this script to execute a transaction using an ERC20 token (WETH) for fees.

```bash
yarn safe-syncFee-erc20
```

**File**: `./relay-safe-scripts/syncFee/safe-signer-weth.ts`

---

## Counter Contract

The counter contract is deployed on Base Sepolia at:

**Contract Address**: `0x20CDE68D6512B9080B5b6c5e46A8e96031126F3A`

### Contract Functionality

- **increment**: Increments the counter.

---

## Safe Details

- **Safe Address**: `0x5E417f9d1dBbE6916fF7Be8A129A8b8A0B262609`
- **Threshold**: 1/1 signer.

---

## How to Track Transactions

After running a script, you will get a **Gelato Task ID**. Use this Task ID to monitor the transaction status on Gelato Relay:

**Track Transactions Here**: [https://relay.gelato.digital/tasks/status/:taskId](https://relay.gelato.digital/tasks/status/:taskId)

---

## Troubleshooting

1. **Missing Environment Variables**:
   Ensure your `.env` file is correctly configured with all necessary keys.

2. **Transaction Reverts**:

   - Verify that the Safe has enough funds or that the ERC20 token (e.g., WETH) is approved for use.
   - Check the contract deployment address and ABI.

3. **API Key Issues**:
   - Ensure your Gelato 1Balance API key is active and has sufficient funds deposited.

---

## Additional Notes

- This repository uses Hardhat for development and deployment.
- The project interacts with the Gelato Relay, Safe, and a Counter contract on Base Sepolia.
- Scripts are modular and can be extended to other chains or contracts.
