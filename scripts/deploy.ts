import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // USDC addresses per network
  const USDC_ADDRESSES: { [key: string]: string } = {
    "137": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
    "80002": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", // Polygon Amoy testnet
    "8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
    "84532": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
    "1337": deployer.address, // Local - deploy mock USDC
  };

  let usdcAddress = USDC_ADDRESSES[network.chainId.toString()];
  
  // Deploy mock USDC for local testing
  if (network.chainId === 1337n) {
    console.log("\nDeploying mock USDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress);
  }

  const platformWallet = deployer.address; // In production, use a multisig
  const platformFeeBps = 500; // 5% platform fee
  const trustedBackend = deployer.address; // In production, use dedicated backend signer

  console.log("\nDeploying SubscriptionManager...");
  const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy(
    usdcAddress,
    platformWallet,
    platformFeeBps
  );
  await subscriptionManager.waitForDeployment();
  const subscriptionManagerAddress = await subscriptionManager.getAddress();
  console.log("SubscriptionManager deployed to:", subscriptionManagerAddress);

  // Set trusted backend
  console.log("Setting trusted backend...");
  await subscriptionManager.setTrustedBackend(trustedBackend);

  console.log("\nDeploying PayPerViewManager...");
  const PayPerViewManager = await ethers.getContractFactory("PayPerViewManager");
  const payPerViewManager = await PayPerViewManager.deploy(
    usdcAddress,
    platformWallet,
    platformFeeBps
  );
  await payPerViewManager.waitForDeployment();
  const payPerViewManagerAddress = await payPerViewManager.getAddress();
  console.log("PayPerViewManager deployed to:", payPerViewManagerAddress);

  // Set trusted backend
  console.log("Setting trusted backend...");
  await payPerViewManager.setTrustedBackend(trustedBackend);

  console.log("\nDeploying TipsManager...");
  const TipsManager = await ethers.getContractFactory("TipsManager");
  const tipsManager = await TipsManager.deploy(
    usdcAddress,
    platformWallet,
    platformFeeBps
  );
  await tipsManager.waitForDeployment();
  const tipsManagerAddress = await tipsManager.getAddress();
  console.log("TipsManager deployed to:", tipsManagerAddress);

  console.log("\nDeploying CreatorToken...");
  const CreatorToken = await ethers.getContractFactory("CreatorToken");
  const creatorToken = await CreatorToken.deploy();
  await creatorToken.waitForDeployment();
  const creatorTokenAddress = await creatorToken.getAddress();
  console.log("CreatorToken deployed to:", creatorTokenAddress);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      usdc: usdcAddress,
      subscriptionManager: subscriptionManagerAddress,
      payPerViewManager: payPerViewManagerAddress,
      tipsManager: tipsManagerAddress,
      creatorToken: creatorTokenAddress,
    },
    config: {
      platformWallet,
      platformFeeBps,
      trustedBackend,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${network.chainId}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Complete ===");
  console.log("Deployment info saved to:", filepath);
  console.log("\nContract Addresses:");
  console.log("USDC:", usdcAddress);
  console.log("SubscriptionManager:", subscriptionManagerAddress);
  console.log("PayPerViewManager:", payPerViewManagerAddress);
  console.log("TipsManager:", tipsManagerAddress);
  console.log("CreatorToken:", creatorTokenAddress);

  console.log("\n=== Next Steps ===");
  console.log("1. Update your .env file with these addresses");
  console.log("2. Verify contracts on block explorer (if on testnet/mainnet)");
  console.log("3. Test contract functionality");
  console.log("4. Configure frontend with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
