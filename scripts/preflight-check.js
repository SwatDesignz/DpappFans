#!/usr/bin/env node

/**
 * Pre-flight check script
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-flight checks...\n');

let hasErrors = false;

// Check 1: Node.js version
console.log('✓ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error(`❌ Node.js ${nodeVersion} detected. Required: v18 or higher`);
  hasErrors = true;
} else {
  console.log(`  ✓ Node.js ${nodeVersion}\n`);
}

// Check 2: Required files exist
console.log('✓ Checking required files...');
const requiredFiles = [
  'package.json',
  'hardhat.config.ts',
  'next.config.mjs',
  'tsconfig.json',
  '.env.example',
  'contracts/SubscriptionManager.sol',
  'contracts/PayPerViewManager.sol',
  'contracts/TipsManager.sol',
  'contracts/CreatorToken.sol',
  'contracts/MockUSDC.sol',
  'scripts/deploy.ts',
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`  ✓ ${file}`);
  } else {
    console.error(`  ❌ Missing: ${file}`);
    hasErrors = true;
  }
});
console.log('');

// Check 3: Check .env configuration
console.log('✓ Checking environment configuration...');
if (!fs.existsSync('.env')) {
  console.log('  ⚠️  .env file not found (copy from .env.example)');
} else {
  const env = fs.readFileSync('.env', 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'NEXT_PUBLIC_WEB3_STORAGE_TOKEN',
    'RPC_URL',
  ];
  
  requiredEnvVars.forEach(varName => {
    if (env.includes(`${varName}=`) && !env.includes(`${varName}=your_`)) {
      console.log(`  ✓ ${varName} configured`);
    } else {
      console.log(`  ⚠️  ${varName} needs configuration`);
    }
  });
}
console.log('');

// Check 4: Check src structure
console.log('✓ Checking source structure...');
const requiredDirs = [
  'src/app',
  'src/components',
  'src/hooks',
  'src/lib',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✓ ${dir}/`);
  } else {
    console.error(`  ❌ Missing: ${dir}/`);
    hasErrors = true;
  }
});
console.log('');

// Check 5: Validate package.json dependencies
console.log('✓ Checking dependencies...');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDeps = [
  'next',
  'react',
  'wagmi',
  '@rainbow-me/rainbowkit',
  'hardhat',
  '@openzeppelin/contracts',
  'ethers',
];

criticalDeps.forEach(dep => {
  if (pkg.dependencies[dep] || pkg.devDependencies[dep]) {
    console.log(`  ✓ ${dep}`);
  } else {
    console.error(`  ❌ Missing dependency: ${dep}`);
    hasErrors = true;
  }
});
console.log('');

// Check 6: node_modules installed
console.log('✓ Checking node_modules...');
if (fs.existsSync('node_modules')) {
  console.log('  ✓ node_modules exists\n');
} else {
  console.log('  ⚠️  node_modules not found - run: npm install\n');
}

// Summary
console.log('='.repeat(50));
if (hasErrors) {
  console.log('❌ Pre-flight check FAILED');
  console.log('\nPlease fix the errors above before proceeding.');
  process.exit(1);
} else {
  console.log('✅ Pre-flight check PASSED');
  console.log('\nYour project is ready to run!');
  console.log('\nNext steps:');
  console.log('  1. npx hardhat compile');
  console.log('  2. npx hardhat node (in Terminal 1)');
  console.log('  3. npx hardhat run scripts/deploy.ts --network localhost');
  console.log('  4. Update .env with contract addresses');
  console.log('  5. npm run dev');
  console.log('\nSee QUICK_START_WEB3.md for detailed instructions.');
}
