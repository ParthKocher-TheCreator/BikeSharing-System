# BikeDAO - Decentralized Bike Sharing Platform

A revolutionary Web3 bike-sharing platform built on blockchain technology, featuring decentralized ownership, transparent governance, and tokenized incentives.

## 🚀 Overview

BikeDAO is the first fully decentralized bike-sharing platform where:
- **Community Ownership**: Bikes are owned by token holders, not corporations
- **NFT-Based Assets**: Each bike is represented as a unique NFT with transparent history
- **DAO Governance**: Community votes on platform decisions and fund allocation
- **Tokenized Incentives**: Users earn RIDE tokens for positive actions
- **Decentralized Maintenance**: Local mechanics earn tokens for bike maintenance
- **Multi-Chain Support**: Works with Ethereum/Polygon AND Stacks blockchain

## 🏗️ Architecture

### Core Components

1. **Smart Contracts** (Solidity + Clarity)
   - **Ethereum/Polygon**: Full platform functionality
     - `RideToken.sol` - Utility token for platform operations
     - `BikeDAOToken.sol` - Governance token for DAO voting
     - `BikeNFT.sol` - NFT representation of physical bikes
     - `BikeSharing.sol` - Main ride management contract
     - `MaintenanceManager.sol` - Decentralized maintenance system
     - `BikeDAO.sol` - DAO governance and treasury management
   - **Stacks**: Clarity smart contracts for STX integration
     - `bike-token.clar` - RIDE token on Stacks

2. **Frontend dApp** (React + Web3)
   - **MetaMask Integration**: For Ethereum/Polygon networks
   - **Leather Wallet Integration**: For Stacks blockchain
   - Interactive map for bike discovery
   - Ride management interface
   - Maintenance job marketplace
   - DAO governance dashboard

3. **Oracle Service** (Node.js)
   - IoT device communication
   - Blockchain event listening
   - Off-chain data management
   - Real-time location updates

## 📋 Prerequisites

- Node.js 16+ and npm
- Git
- **One of these wallets:**
  - **MetaMask** (for Ethereum/Polygon) - [metamask.io](https://metamask.io/)
  - **Leather Wallet** (for Stacks/Bitcoin) - [leather.io](https://leather.io/)
- MongoDB (for Oracle service)
- Redis (optional, for caching)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd web3-bike-sharing
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm run setup

# Or manually install each component
cd contracts && npm install
cd ../frontend && npm install
cd ../backend && npm install
```

### 3. Environment Configuration

#### Smart Contracts
```bash
cd contracts
cp .env.example .env
# Edit .env with your configuration
```

Required variables:
- `PRIVATE_KEY` - Deployment wallet private key
- `POLYGON_RPC_URL` - Polygon network RPC endpoint
- `POLYGONSCAN_API_KEY` - For contract verification

#### Backend Oracle Service
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

#### Frontend dApp
```bash
cd frontend
# Create .env file for any frontend-specific variables
```

### 4. Choose Your Blockchain & Wallet

#### Option A: Ethereum/Polygon with MetaMask

##### Deploy Smart Contracts

**Local Development**
```bash
# Start local Hardhat node
cd contracts
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

**Polygon Mumbai Testnet**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mumbai
```

##### Setup MetaMask
1. Install MetaMask browser extension
2. Add Polygon network:
   - Network Name: Polygon Mumbai
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC

#### Option B: Stacks with Leather Wallet

##### Install Leather Wallet
1. Go to [leather.io](https://leather.io/)
2. Download and install the browser extension
3. Create a new wallet or import existing one
4. Get testnet STX from [Stacks faucet](https://explorer.stacks.co/sandbox/faucet)

##### Deploy Stacks Contracts
```bash
# Install Clarinet (Stacks development tool)
npm install -g @hirosystems/clarinet-cli

# Initialize Stacks project
cd stacks-contracts
clarinet new bike-dao-stacks
cd bike-dao-stacks

# Copy our contracts
cp ../bike-token.clar contracts/
```

### 5. Start the Services

```bash
# Backend Oracle (Terminal 1)
cd backend
npm run dev

# Frontend dApp (Terminal 2)
cd frontend
npm start
```

The dApp will be available at `http://localhost:3000`

## 🔄 Switching Between Wallets

### From MetaMask to Leather Wallet

1. **Install Leather Wallet**: Download from [leather.io](https://leather.io/)

2. **Update Frontend**: The platform now supports both wallets simultaneously:
   - MetaMask button appears for Ethereum/Polygon
   - Leather button appears for Stacks blockchain

3. **Connect Leather Wallet**:
   - Click "Connect Leather" button
   - Authorize the connection in Leather wallet
   - You'll see your STX address and balance

### Wallet Comparison

| Feature | MetaMask (Ethereum/Polygon) | Leather (Stacks/Bitcoin) |
|---------|----------------------------|-------------------------|
| **Networks** | Ethereum, Polygon, BSC, etc. | Stacks, Bitcoin |
| **Tokens** | ERC-20, ERC-721 | SIP-10, SIP-09 |
| **Smart Contracts** | Solidity | Clarity |
| **Gas Fees** | ETH, MATIC | STX |
| **DeFi Ecosystem** | Massive | Growing |
| **Bitcoin Integration** | Limited | Native |

## 🚀 Running with Leather Wallet

### 1. Install Dependencies (if not done already)

```bash
cd frontend
npm install
```

### 2. Start the Frontend

```bash
cd frontend
npm start
```

### 3. Connect Leather Wallet

1. Open `http://localhost:3000`
2. Look for the orange "Connect Leather" button (positioned below the blue MetaMask button)
3. Click "Connect Leather"
4. If Leather isn't installed, you'll see installation instructions
5. Authorize the connection in Leather wallet

### 4. Use Stacks Features

- View your STX balance
- Interact with Clarity smart contracts (coming soon)
- Send/receive tokens on Stacks network

## 🔧 Development Workflow

### For Ethereum/Polygon Development

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy locally
npm run deploy:local
```

### For Stacks Development

```bash
cd stacks-contracts

# Check contract syntax
clarinet check

# Run tests
clarinet test

# Deploy to testnet
clarinet deploy --testnet
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Test both wallet integrations
# - Connect MetaMask for Ethereum features
# - Connect Leather for Stacks features
```

## 📖 Using Both Wallets

### Dual Wallet Setup

You can now use BOTH wallets simultaneously:

1. **MetaMask**: For the main bike-sharing functionality on Ethereum/Polygon
2. **Leather**: For additional features on Stacks/Bitcoin

### Recommended Workflow

1. **Primary Operations** (MetaMask):
   - Rent bikes
   - Pay with RIDE tokens
   - Participate in DAO governance
   - Maintenance jobs

2. **Secondary Features** (Leather):
   - STX token management
   - Bitcoin-secured transactions
   - Cross-chain features (future)

## 🛡️ Security Considerations

- **Never share private keys** or seed phrases
- **Use hardware wallets** for large amounts
- **Test on testnets** before mainnet
- **Keep wallets updated** to latest versions
- **Verify contract addresses** before interacting

## 🆘 Troubleshooting

### Leather Wallet Issues

**"Leather wallet not detected"**
- Download from [leather.io](https://leather.io/)
- Refresh the page after installation
- Check browser extensions are enabled

**"Failed to connect to Leather"**
- Make sure Leather is unlocked
- Try refreshing the page
- Check if you're on the correct Stacks network

**"STX balance not showing"**
- Wait a few seconds for balance to load
- Check you're connected to the right network
- Verify you have STX in your wallet

### MetaMask + Leather Conflicts

If both wallets are installed:
- They work independently
- No conflicts expected
- Use the appropriate wallet for each blockchain

## 🔗 Links

- **MetaMask**: [metamask.io](https://metamask.io/)
- **Leather Wallet**: [leather.io](https://leather.io/)
- **Stacks**: [stacks.co](https://stacks.co/)
- **Polygon**: [polygon.technology](https://polygon.technology/)

## 📊 Project Status

- ✅ Smart Contract Development (Ethereum/Polygon)
- ✅ Smart Contract Development (Stacks/Clarity)
- ✅ Frontend dApp with MetaMask
- ✅ Frontend dApp with Leather Wallet
- ✅ Oracle Service
- ✅ Local Testing Environment
- 🔄 Multi-chain Integration
- ⏳ Cross-chain Bridge
- ⏳ Security Audit
- ⏳ Mainnet Launch

---

Built with ❤️ by the BikeDAO community
**Now supporting both Ethereum/Polygon AND Stacks blockchains!** 🚴‍♂️⚡
