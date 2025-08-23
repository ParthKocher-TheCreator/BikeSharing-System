# BikeDAO - Decentralized Bike Sharing Platform

A revolutionary Web3 bike-sharing platform built on blockchain technology, featuring decentralized ownership, transparent governance, and tokenized incentives.

## 🚀 Overview

BikeDAO is the first fully decentralized bike-sharing platform where:
- **Community Ownership**: Bikes are owned by token holders, not corporations
- **NFT-Based Assets**: Each bike is represented as a unique NFT with transparent history
- **DAO Governance**: Community votes on platform decisions and fund allocation
- **Tokenized Incentives**: Users earn RIDE tokens for positive actions
- **Decentralized Maintenance**: Local mechanics earn tokens for bike maintenance

## 🏗️ Architecture

### Core Components

1. **Smart Contracts** (Solidity)
   - `RideToken.sol` - Utility token for platform operations
   - `BikeDAOToken.sol` - Governance token for DAO voting
   - `BikeNFT.sol` - NFT representation of physical bikes
   - `BikeSharing.sol` - Main ride management contract
   - `MaintenanceManager.sol` - Decentralized maintenance system
   - `BikeDAO.sol` - DAO governance and treasury management

2. **Frontend dApp** (React + Web3)
   - Wallet integration (MetaMask, WalletConnect)
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
- MetaMask browser extension
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

### 4. Deploy Smart Contracts

#### Local Development
```bash
# Start local Hardhat node
cd contracts
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

#### Polygon Mumbai Testnet
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mumbai
```

#### Polygon Mainnet
```bash
cd contracts
npx hardhat run scripts/deploy.js --network polygon
```

### 5. Start the Oracle Service

```bash
cd backend
npm run dev
```

### 6. Start the Frontend

```bash
cd frontend
npm start
```

The dApp will be available at `http://localhost:3000`

## 🔧 Development Workflow

### Smart Contract Development

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy locally
npm run deploy:local

# Verify on Polygonscan
npm run verify
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend Development

```bash
cd backend

# Start with auto-reload
npm run dev

# Run tests
npm test

# Start production server
npm start
```

## 📖 Usage Guide

### For Riders

1. **Connect Wallet**: Use MetaMask or WalletConnect
2. **Make Deposit**: Deposit RIDE tokens as security
3. **Find a Bike**: Use the map to locate available bikes
4. **Start Ride**: Scan QR code or select bike from map
5. **End Ride**: Lock bike at destination
6. **Earn Rewards**: Get RIDE tokens for good behavior

### For Maintainers

1. **Browse Jobs**: View available maintenance tasks
2. **Claim Job**: Stake tokens to claim a maintenance job
3. **Complete Work**: Perform repairs and submit proof
4. **Get Paid**: Receive tokens after validation

### For DAO Members

1. **Get Governance Tokens**: Acquire BIKEDAO tokens
2. **Create Proposals**: Submit governance proposals
3. **Vote**: Participate in community decisions
4. **Earn Rewards**: Receive revenue share from platform

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npm run test

# With coverage
npm run coverage

# Gas reporting
REPORT_GAS=true npm run test
```

### Frontend Tests

```bash
cd frontend
npm test

# Coverage
npm test -- --coverage
```

### Backend Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch
```

## 🚀 Deployment

### Smart Contracts

1. Configure `.env` with deployment wallet and RPC URLs
2. Fund deployment wallet with native tokens (ETH/MATIC)
3. Run deployment script for target network
4. Verify contracts on block explorer
5. Update frontend with deployed addresses

### Frontend (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Deploy `build` folder to hosting service
3. Configure environment variables
4. Set up domain and SSL

### Backend (Railway/Heroku)

1. Configure production environment variables
2. Set up MongoDB and Redis instances
3. Deploy using platform-specific methods
4. Monitor logs and performance

## 🔐 Security Considerations

- **Smart Contracts**: All contracts should be audited before mainnet deployment
- **Private Keys**: Never commit private keys or seed phrases
- **Oracle Security**: Use secure communication channels for IoT devices
- **Rate Limiting**: Implement API rate limiting in production
- **Access Control**: Proper role-based access control throughout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Contract deployment fails**
- Check wallet has sufficient balance for gas
- Verify RPC URL is correct and accessible
- Ensure private key is valid

**Frontend can't connect to contracts**
- Verify contract addresses in frontend config
- Check network configuration matches deployment
- Ensure MetaMask is on correct network

**Oracle service errors**
- Check database connectivity
- Verify blockchain RPC connection
- Ensure environment variables are set

### Getting Help

- Check existing [Issues](link-to-issues)
- Join our [Discord](link-to-discord)
- Read the [Documentation](link-to-docs)

## 🔗 Links

- **Website**: [bikedao.org](https://bikedao.org)
- **Docs**: [docs.bikedao.org](https://docs.bikedao.org)
- **Twitter**: [@BikeDAO](https://twitter.com/BikeDAO)
- **Discord**: [BikeDAO Community](https://discord.gg/bikedao)

## 📊 Project Status

- ✅ Smart Contract Development
- ✅ Frontend dApp
- ✅ Oracle Service
- ✅ Local Testing Environment
- 🔄 Testnet Deployment
- ⏳ Security Audit
- ⏳ Mainnet Launch

---

Built with ❤️ by the BikeDAO community
