# 🐛 Debugging & Running Guide - DpappFans Web3

## ⚠️ Prerequisites Check

Before running, ensure you have installed:
- ✅ Node.js 18+ (`node --version`)
- ✅ npm or yarn (`npm --version`)
- ✅ Git (`git --version`)

## 🚀 Step-by-Step Setup & Debugging

### Step 1: Install Dependencies

```bash
cd /home/trappy/DpappFans-1
npm install
```

**Expected issues and fixes:**

#### Issue: "npm ERR! ERESOLVE unable to resolve dependency tree"
**Fix:**
```bash
npm install --legacy-peer-deps
```

#### Issue: "node-gyp rebuild failed"
**Fix (Linux):**
```bash
sudo apt-get install build-essential python3
npm install --legacy-peer-deps
```

#### Issue: "sharp installation failed"
**Fix:**
```bash
npm install sharp --legacy-peer-deps --ignore-scripts
npm rebuild sharp
```

### Step 2: Create Environment File

```bash
cp .env.example .env
nano .env
```

**Minimum Required for Local Testing:**
```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=get_from_walletconnect

# Hardhat Local
RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BACKEND_SIGNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Web3.Storage (get from web3.storage)
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here

# Lit Protocol
NEXT_PUBLIC_LIT_NETWORK=datil-dev

# RapidAPI (optional for testing)
RAPIDAPI_KEY=your_rapidapi_key_or_leave_blank

# Contracts (will be filled after deployment)
NEXT_PUBLIC_USDC_LOCAL=
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_LOCAL=
NEXT_PUBLIC_PPV_MANAGER_LOCAL=
NEXT_PUBLIC_TIPS_MANAGER_LOCAL=
NEXT_PUBLIC_CREATOR_TOKEN_LOCAL=
```

### Step 3: Compile Smart Contracts

```bash
npx hardhat compile
```

**Expected output:**
```
Compiled 10 Solidity files successfully
```

**Common issues:**

#### Issue: "HH700: Project initialization failed"
**Fix - Check hardhat.config.ts:**
```bash
cat hardhat.config.ts | grep "import"
```
Should show:
- `import { HardhatUserConfig } from "hardhat/config"`
- `import "@nomicfoundation/hardhat-toolbox"`

#### Issue: "Cannot find module '@openzeppelin/contracts'"
**Fix:**
```bash
npm install @openzeppelin/contracts@5.0.1
```

#### Issue: "Solidity version mismatch"
**Fix - Ensure all contracts use:**
```solidity
pragma solidity ^0.8.24;
```

### Step 4: Run Local Blockchain

**Terminal 1:**
```bash
npx hardhat node
```

**Expected output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts + Private Keys:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**⚠️ Leave this terminal running!**

### Step 5: Deploy Contracts

**Terminal 2:**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Expected output:**
```
Deploying contracts with account: 0xf39Fd...
Network: localhost Chain ID: 1337
Account balance: 10000.0

Deploying mock USDC for local testing...
Mock USDC deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Deploying SubscriptionManager...
SubscriptionManager deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

... (more deployments)

=== Deployment Complete ===
Contract Addresses:
USDC: 0x5FbDB...
SubscriptionManager: 0xe7f17...
PayPerViewManager: 0x9fE46...
TipsManager: 0xCf7Ed...
CreatorToken: 0xDc64a...
```

**⚠️ Copy these addresses!**

### Step 6: Update .env with Contract Addresses

Copy the deployed addresses to `.env`:

```env
NEXT_PUBLIC_USDC_LOCAL=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_LOCAL=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_PPV_MANAGER_LOCAL=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_TIPS_MANAGER_LOCAL=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_CREATOR_TOKEN_LOCAL=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

# Also set these for API routes
SUBSCRIPTION_MANAGER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PPV_MANAGER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### Step 7: Start Next.js Dev Server

**Terminal 3:**
```bash
npm run dev
```

**Expected output:**
```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Ready in 2.3s
```

**Common issues:**

#### Issue: "Error: listen EADDRINUSE: address already in use :::3000"
**Fix:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

#### Issue: "Module not found: Can't resolve '@/lib/wagmi'"
**Fix:**
```bash
# Check tsconfig.json includes:
grep -A5 '"paths"' tsconfig.json
# Should show @/* mapping
```

#### Issue: "Error: Invalid environment variables"
**Fix - Check .env file exists and has values:**
```bash
cat .env | grep NEXT_PUBLIC
```

### Step 8: Connect Wallet & Test

1. **Open Browser:** http://localhost:3000

2. **Install MetaMask** (if not installed)

3. **Add Localhost Network to MetaMask:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

4. **Import Test Account:**
   - Click MetaMask → Import Account
   - Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - ⚠️ This is Hardhat's test account #0 - NEVER use for real funds!

5. **Click "Connect Wallet"** on the site

6. **Approve connection** in MetaMask

**✅ Success: You should see your address in the navbar!**

---

## 🧪 Testing Functionality

### Test 1: Get Test USDC

```bash
# In Hardhat console (Terminal 2)
npx hardhat console --network localhost

# Then run:
const USDC = await ethers.getContractAt("MockUSDC", "0x5Fb...") // Your USDC address
const [user] = await ethers.getSigners()
await USDC.mint(user.address, ethers.parseUnits("1000", 6)) // Mint 1000 USDC
```

### Test 2: Create a Subscription Plan

1. Go to creator upload page
2. Enter plan details:
   - Price: `9.99` USDC
   - Duration: `30` days
3. Click "Create Plan"
4. Approve transaction in MetaMask

### Test 3: Subscribe to a Plan

1. Copy the plan ID from the transaction
2. Navigate to subscribe page
3. Click "Pay with USDC"
4. Approve USDC spending
5. Confirm subscription

### Test 4: Upload Encrypted Content

1. Select a file
2. Enter plan ID
3. Upload will:
   - Encrypt file with Lit Protocol
   - Upload to IPFS
   - Store metadata
4. Share the metadata CID with subscribers

---

## 🔍 Common Runtime Errors & Fixes

### Error: "Cannot read properties of undefined (reading 'chainId')"

**Cause:** Wallet not connected
**Fix:** Click "Connect Wallet" button

### Error: "User rejected the request"

**Cause:** Transaction cancelled in MetaMask
**Fix:** Try again and approve in MetaMask

### Error: "Insufficient funds for gas"

**Cause:** Test account out of ETH
**Fix:** Restart Hardhat node (Terminal 1) - resets balances

### Error: "Contract call reverted: Plan not active"

**Cause:** Invalid plan ID or plan doesn't exist
**Fix:** Use `createPlan()` first to create a plan

### Error: "ERC20: insufficient allowance"

**Cause:** USDC not approved for spending
**Fix:** Click "Approve USDC" button first

### Error: "Network version mismatch"

**Cause:** MetaMask connected to wrong network
**Fix:** Switch to "Hardhat Local" network in MetaMask

### Error: "Lit Protocol connection failed"

**Cause:** Lit network configuration issue
**Fix:** Check `.env` has `NEXT_PUBLIC_LIT_NETWORK=datil-dev`

### Error: "IPFS upload timeout"

**Cause:** Web3.Storage token missing or invalid
**Fix:** 
1. Get token from https://web3.storage/
2. Add to `.env`: `NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token`
3. Restart dev server

### Error: "RapidAPI rate limit exceeded"

**Cause:** Free tier limit reached
**Fix:** Wait or upgrade RapidAPI subscription

---

## 📊 Debugging Tools

### 1. Browser DevTools

```bash
# Open in Chrome/Firefox
F12 → Console tab
```

Check for:
- Red errors
- Network failures
- Wallet connection status

### 2. Next.js Error Overlay

When errors occur, Next.js shows a helpful modal with:
- Stack trace
- File and line number
- Suggested fixes

### 3. Hardhat Console Logs

Monitor Terminal 1 for:
- Transaction receipts
- Gas usage
- Emitted events

### 4. MetaMask Activity Tab

Click MetaMask → Activity to see:
- Pending transactions
- Failed transactions
- Transaction details

### 5. Check Contract Events

```bash
# In Hardhat console
const sub = await ethers.getContractAt("SubscriptionManager", "0x...")
const filter = sub.filters.Subscribed()
const events = await sub.queryFilter(filter)
console.log(events)
```

---

## 🧹 Clean Restartbash
# Kill all processes
pkill -f "hardhat node"
pkill -f "next dev"

# Clean build artifacts
rm -rf .next artifacts cache deployments node_modules

# Reinstall
npm install --legacy-peer-deps

# Start fresh
npx hardhat node &
npx hardhat run scripts/deploy.ts --network localhost
# Update .env with new addresses
npm run dev
```

---

## 📝 Health Check Checklist

Before reporting issues, verify:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file exists with all required vars
- [ ] Hardhat node running (Terminal 1)
- [ ] Contracts deployed (check `deployments/` folder)
- [ ] Contract addresses in `.env` match deployment
- [ ] Next.js dev server running (Terminal 3)
- [ ] MetaMask installed and unlocked
- [ ] MetaMask connected to Hardhat Local network
- [ ] Test account imported with ETH balance
- [ ] Browser console shows no errors
- [ ] Wallet shows on website after connecting

---

## 🆘 Still Having Issues?

### Check Logs

**Next.js logs:**
```bash
tail -f .next/trace
```

**Hardhat logs:**
```bash
# Check Terminal 1 output
```

**Browser console:**
- Open DevTools (F12)
- Go to Console tab
- Look for red errors

### Get Contract State

```bash
npx hardhat console --network localhost

const sub = await ethers.getContractAt("SubscriptionManager", "YOUR_ADDRESS")
console.log("Platform fee:", await sub.platformFeeBps())
console.log("Platform wallet:", await sub.platformWallet())
console.log("Trusted backend:", await sub.trustedBackend())
console.log("USDC address:", await sub.paymentToken())
```

### Verify Environment

Create `scripts/verify-env.js`:

```javascript
console.log("Environment Check:");
console.log("==================");
console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
console.log("RPC_URL:", process.env.RPC_URL);
console.log("Contracts configured:", !!process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_LOCAL);
console.log("WalletConnect ID:", !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
console.log("Web3.Storage token:", !!process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN);
```

Run:
```bash
node scripts/verify-env.js
```

---

## 📚 Reference Commands

```bash
# Development
npm run dev                              # Start Next.js dev server
npx hardhat node                         # Start local blockchain
npx hardhat run scripts/deploy.ts        # Deploy contracts

# Testing
npx hardhat test                         # Run contract tests
npx hardhat coverage                     # Test coverage report

# Building
npm run build                            # Build for production
npm start                                # Run production build

# Utilities
npx hardhat compile                      # Compile contracts
npx hardhat clean                        # Clean build artifacts
npx hardhat console --network localhost  # Open Hardhat console
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Hardhat node shows: `Started HTTP and WebSocket JSON-RPC server`
2. ✅ Deployment script shows: `Deployment Complete`
3. ✅ Next.js shows: `Ready in X.Xs`
4. ✅ Browser loads without console errors
5. ✅ "Connect Wallet" button works
6. ✅ MetaMask shows Hardhat Local network
7. ✅ Test account has ETH balance
8. ✅ Can approve and interact with contracts

---

**Need more help?** Check:
- [DEPLOYMENT_GUIDE_WEB3.md](DEPLOYMENT_GUIDE_WEB3.md)
- [RAPIDAPI_INTEGRATION.md](RAPIDAPI_INTEGRATION.md)
- [WEB3_MIGRATION_COMPLETE.md](WEB3_MIGRATION_COMPLETE.md)
