import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying SimpleCounter contract...");

  // Deploy the contract
  const simpleCounter = await deploy("SimpleCounter", {
    from: deployer,
    log: true, // Logs the deployment info to the console
  });

  console.log(`SimpleCounter deployed at: ${simpleCounter.address}`);

  // Interact with the deployed contract to verify it's working
  const counterContract = await ethers.getContractAt(
    "SimpleCounter",
    simpleCounter.address
  );

  // Example interaction (optional)
  const counterValue = await counterContract.counter();
  console.log(`Initial counter value: ${counterValue.toString()}`);
};

export default func;
func.tags = ["SimpleCounter"]; // Tag to run this deployment script
