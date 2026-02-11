# DpappFans Web3 - Deployment & Setup Guide

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- RPC endpoints for target networks
- USDC tokens for testing (testnets)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Rename package file
mv package.web3.json package.json

# Install dependencies
npm install

# or
yarn install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your keys
nano .env
```

### 3. Compile Smart Contracts

```bash
npm run hardhat:compile
```

### 4. Deploy Contracts (Local Testing)

```bash
# Terminal 1: Start local blockchain
npm run hardhat:node

# Terminal 2: Deploy contracts
npm run hardhat:deploy:local
```

### 5. Update Contract Addresses

After deployment, copy the contract addresses from the console output and update your `.env` file:

```env
NEXT_PUBLIC_USDC_LOCAL=0x...
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_LOCAL=0x...
NEXT_PUBLIC_PPV_MANAGER_LOCAL=0x...
NEXT_PUBLIC_TIPS_MANAGER_LOCAL=0x...
NEXT_PUBLIC_CREATOR_TOKEN_LOCAL=0x...
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🌐 Network Deployment

### Deploy to Polygon Amoy Testnet

1. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

2. Configure RPC and private key in `.env`:

```env
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

3. Deploy:

```bash
npm run hardhat:deploy:polygon
```

4. Update `.env` with deployed addresses (found in `deployments/deployment-80002.json`)

### Deploy to Base Sepolia Testnet

1. Get test ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

2. Configure in `.env`:

```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

3. Deploy:

```bash
npm run hardhat:deploy:base
```

### Deploy to Production (Polygon/Base Mainnet)

**⚠️ CRITICAL: Use a hardware wallet or secure key management for mainnet deployments**

```bash
# Polygon Mainnet
npm run hardhat:deploy:polygon

# Base Mainnet
npm run hardhat:deploy:base
```

## 🔧 Configuration Guide

### Required API Keys & Services

#### 1. WalletConnect Project ID

- Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create a new project
- Copy Project ID to `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### 2. Web3.Storage Token

- Sign up at [Web3.Storage](https://web3.storage/)
- Create API token
- Add to `NEXT_PUBLIC_WEB3_STORAGE_TOKEN`

#### 3. RapidAPI Key

- Sign up at [RapidAPI](https://rapidapi.com/)
- Get API key from dashboard
- Add to `RAPIDAPI_KEY`
- Subscribe to required APIs (see [RAPIDAPI_INTEGRATION.md](RAPIDAPI_INTEGRATION.md))

#### 4. Stripe API Keys (for fiat payments)

- Create account at [Stripe](https://stripe.com/)
- Get test/live API keys from dashboard
- Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

- Set up webhook endpoint:
  - URL: `https://yourdomain.com/api/fiat/webhook`
  - Events: `checkout.session.completed`
  - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

#### 5. Backend Signer (for fiat bridge)

Generate a new wallet for backend operations:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add private key to `BACKEND_SIGNER_PRIVATE_KEY`

**Security**: Store this key securely (AWS Secrets Manager, Azure Key Vault, etc.)

### Contract Configuration

After deployment, you need to configure the contracts:

```bash
# Set trusted backend for fiat bridging
# Use Hardhat console or create a script:

const subscriptionManager = await ethers.getContractAt(
  "SubscriptionManager",
  "0xYourContractAddress"
);

await subscriptionManager.setTrustedBackend("0xYourBackendSignerAddress");
```

## 📦 Production Build

```bash
# Build Next.js application
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment (Optional)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t dpappfans-web3 .
docker run -p 3000:3000 --env-file .env dpappfans-web3
```

## 🌍 Hosting Options

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy

### AWS / DigitalOcean / Cloud Provider

1. Set up VM with Node.js
2. Clone repository
3. Configure environment variables
4. Run with PM2:

```bash
npm install -g pm2
pm2 start npm --name "dpappfans" -- start
pm2 save
pm2 startup
```

## 🔐 Security Checklist

### Pre-Production

- [ ] Audit smart contracts (use OpenZeppelin Defender or similar)
- [ ] Test all payment flows (crypto + fiat)
- [ ] Verify RLS policies and access controls
- [ ] Test Lit Protocol encryption/decryption
- [ ] Validate RapidAPI moderation
- [ ] Set up rate limiting on API routes
- [ ] Configure CORS properly
- [ ] Use environment-specific RPC URLs
- [ ] Never commit `.env` file
- [ ] Use hardware wallet for contract ownership
- [ ] Set up monitoring (Sentry, DataDog, etc.)

### Smart Contract Security

- [ ] Set reasonable platform fees (5-10%)
- [ ] Transfer contract ownership to multisig
- [ ] Set trusted backend to secure server
- [ ] Test emergency pause mechanisms
- [ ] Verify all events are emitted
- [ ] Check for reentrancy vulnerabilities
- [ ] Validate input parameters

### API Security

- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Use HTTPS only
- [ ] Set up CSRF protection
- [ ] Implement request signing
- [ ] Monitor for abuse
- [ ] Log all API calls

## 📊 Monitoring & Analytics

### Blockchain Monitoring

- [Polygonscan](https://polygonscan.com/) - Polygon transactions
- [Basescan](https://basescan.org/) - Base transactions
- [Tenderly](https://tenderly.co/) - Contract monitoring
- [OpenZeppelin Defender](https://www.openzeppelin.com/defender) - Security monitoring

### Application Monitoring

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  { silent: true },
  { hideSourceMaps: true }
);
```

## 🧪 Testing

### Smart Contract Tests

```bash
npm run hardhat:test
```

### Integration Tests

Create test file `test/integration.test.ts`:

```typescript
describe("Subscription Flow", () => {
  it("should allow user to subscribe with USDC", async () => {
    // Test implementation
  });
  
  it("should encrypt and decrypt content", async () => {
    // Test implementation
  });
});
```

## 📝 Maintenance

### Updating Contracts

If you need to upgrade contracts:

1. Deploy new contract versions
2. Migrate data if necessary
3. Update frontend contract addresses
4. Test thoroughly on testnet first
5. Update production environment variables

### Database Backups (if using off-chain DB)

```bash
# Backup IPFS CIDs and metadata
# Consider using Supabase or PostgreSQL for metadata
```

### Monitoring Contract Events

Set up event listeners for key actions:

```typescript
subscriptionManager.on("Subscribed", (subscriber, planId, creator) => {
  console.log(`New subscription: ${subscriber} -> Plan ${planId}`);
  // Send notification, update analytics, etc.
});
```

## 🆘 Troubleshooting

### Common Issues

**Issue**: "Insufficient funds for gas"
- **Solution**: Ensure deployer wallet has enough native tokens (MATIC/ETH)

**Issue**: "Contract not found"
- **Solution**: Verify contract addresses in `.env` match deployment

**Issue**: "RPC rate limit exceeded"
- **Solution**: Use dedicated RPC provider (Infura, Alchemy, QuickNode)

**Issue**: "Lit Protocol connection failed"
- **Solution**: Check network compatibility and Lit network setting

**Issue**: "IPFS upload timeout"
- **Solution**: Verify Web3.Storage token and check file size limits

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)
- [Lit Protocol Docs](https://developer.litprotocol.com/)
- [Web3.Storage Docs](https://web3.storage/docs/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## 💬 Support

- GitHub Issues: [Create an issue](https://github.com/yourrepo/issues)
- Discord: [Join our community](#)
- Documentation: [Read the docs](#)

## 📄 License

MIT License - See LICENSE file for details
