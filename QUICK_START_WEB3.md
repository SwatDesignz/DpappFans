# 🎯 Quick Start Guide - Run It Now!

## Prerequisites Installation (if needed)

### Install Node.js on Linux:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
```

### Install Node.js on Mac:
```bash
brew install node@20
node --version
```

### Install Node.js on Windows:
Download from https://nodejs.org/ (LTS version)

---

## 🚀 5-Minute Startup

```bash
# 1. Navigate to project
cd /home/trappy/DpappFans-1

# 2. Install dependencies (takes 2-3 minutes)
npm install --legacy-peer-deps

# 3. Setup environment
cp .env.example .env

# Edit .env - add at minimum:
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=get_from_walletconnect_com
# NEXT_PUBLIC_WEB3_STORAGE_TOKEN=get_from_web3_storage
# (Other fields can stay default for local testing)

# 4. Compile contracts
npx hardhat compile

# 5. Start blockchain (Terminal 1 - leave running)
npx hardhat node

# 6. Deploy contracts (Terminal 2)
npx hardhat run scripts/deploy.ts --network localhost

# ⚠️ IMPORTANT: Copy contract addresses from output!
# Update .env with these addresses:
# NEXT_PUBLIC_USDC_LOCAL=0x5FbDB...
# NEXT_PUBLIC_SUBSCRIPTION_MANAGER_LOCAL=0xe7f17...
# etc.

# 7. Start Next.js (Terminal 3)
npm run dev

# 8. Open browser
# Visit: http://localhost:3000
# Connect MetaMask to "Hardhat Local" network (Chain ID: 1337)
```

---

## 📱 MetaMask Setup

1. **Add Hardhat Network:**
   - Open MetaMask
   - Networks → Add Network
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

2. **Import Test Account:**
   - Import Account
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - ⚠️ TEST ONLY - Never use for real funds!

---

## ✅ What You Should See

### Terminal 1 (Hardhat):
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Account #0: 0xf39Fd... (10000 ETH)
```

### Terminal 2 (Deployment):
```
✅ SubscriptionManager deployed to: 0x...
✅ PayPerViewManager deployed to: 0x...
✅ All contracts deployed!
```

### Terminal 3 (Next.js):
```
▲ Next.js 14.1.0
- Local:  http://localhost:3000
✓ Ready in 2.3s
```

### Browser:
- Beautiful landing page with gradient
- "Connect Wallet" button (top right)
- After connecting: Shows your address
- Can navigate to Upload, Explore pages

---

## 🧪 Test the Platform

### 1. Mint Test USDC
```bash
npx hardhat console --network localhost

# In console:
const USDC = await ethers.getContractAt("MockUSDC", "YOUR_USDC_ADDRESS")
const [user] = await ethers.getSigners()
await USDC.mint(user.address, ethers.parseUnits("1000", 6))
// ✅ You now have 1000 USDC
```

### 2. Create Subscription Plan
1. Go to http://localhost:3000/upload
2. Connect wallet
3. Fill form:
   - Price: 9.99
   - Duration: 30 days
   - Title: "My Premium Content"
4. Create Plan → Approve in MetaMask
5. Note the Plan ID from transaction

### 3. Subscribe
1. Share plan ID with another address
2. That address visits site
3. Clicks "Subscribe"
4. Approves USDC → Pays subscription
5. ✅ Now has access to encrypted content!

---

## 🐛 Quick Fixes

### "npm: command not found"
Install Node.js (see Prerequisites above)

### "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9
# Or use different port:
npm run dev -- -p 3001
```

### "Cannot find module 'hardhat'"
```bash
npm install --legacy-peer-deps
```

### "Transaction reverted"
- Check you have ETH for gas
- Check USDC is approved
- Check plan exists

### "Wallet not connecting"
- Ensure MetaMask installed
- Switch to Hardhat Local network
- Refresh page

### "IPFS upload failed"
- Add Web3.Storage token to .env
- Restart dev server

---

## 📚 Full Documentation

- **[DEBUG_GUIDE.md](DEBUG_GUIDE.md)** - Comprehensive debugging
- **[DEPLOYMENT_GUIDE_WEB3.md](DEPLOYMENT_GUIDE_WEB3.md)** - Production deployment
- **[RAPIDAPI_INTEGRATION.md](RAPIDAPI_INTEGRATION.md)** - API services
- **[WEB3_MIGRATION_COMPLETE.md](WEB3_MIGRATION_COMPLETE.md)** - Project overview

---

## 🎉 You're Ready!

Once all terminals show success:
1. Browser at http://localhost:3000 ✅
2. Wallet connects ✅
3. Can create plans ✅
4. Can subscribe ✅
5. Can upload encrypted content ✅

**Next:** Test on Polygon Amoy testnet → Deploy to production → Launch! 🚀

---

**Having issues?** Check [DEBUG_GUIDE.md](DEBUG_GUIDE.md) for detailed troubleshooting.
