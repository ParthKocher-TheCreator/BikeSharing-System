# 🚲 BikeSharing System

## Project Title
**BikeSharing System** - A Decentralized Community-Owned Bike Sharing Platform

## Project Description
The BikeSharing System is a smart contract-based solution built on the Stacks blockchain that enables community-owned bike sharing with integrated maintenance tracking and usage incentives. This system provides a transparent, trustless way for communities to manage shared bicycle resources while ensuring proper maintenance and fair usage.

### Key Features
- **Decentralized Bike Management**: Community-owned bikes managed through smart contracts
- **Automated Rental System**: Seamless bike rental and return process
- **Maintenance Tracking**: Built-in maintenance history and reporting system
- **Usage Incentives**: Fair pricing model with deposit-based security
- **Transparent Operations**: All transactions and bike status visible on the blockchain

### Core Functions
1. **`rent-bike`**: Allows users to rent available bikes by providing a deposit
2. **`return-bike`**: Enables users to return bikes and optionally report maintenance issues

## Project Vision
Our vision is to create a sustainable, community-driven transportation ecosystem that promotes:
- **Environmental Sustainability**: Encouraging eco-friendly transportation options
- **Community Ownership**: Empowering communities to manage shared resources
- **Transparency**: Building trust through blockchain-based transparency
- **Accessibility**: Making bike sharing accessible to everyone in the community
- **Maintenance Excellence**: Ensuring bikes remain in optimal condition through community reporting

### Long-term Goals
- Expand to multiple communities and cities
- Integrate with other transportation networks
- Develop mobile applications for seamless user experience
- Implement reward systems for regular users and maintenance reporters
- Create governance mechanisms for community decision-making

## Future Scope

### Phase 2: Enhanced Features
- **GPS Integration**: Real-time bike location tracking
- **Smart Lock Integration**: IoT-enabled bike locks
- **User Reputation System**: Build trust through user ratings and history
- **Maintenance Scheduling**: Automated maintenance reminders and scheduling
- **Insurance Integration**: Optional insurance coverage for bike damage

### Phase 3: Ecosystem Expansion
- **Multi-City Network**: Inter-city bike sharing capabilities
- **Partner Integration**: Collaboration with local businesses and transit systems
- **Mobile App Development**: Native iOS and Android applications
- **Analytics Dashboard**: Community insights and usage analytics
- **Environmental Impact Tracking**: Carbon footprint reduction metrics

### Phase 4: Advanced Features
- **AI-Powered Maintenance**: Predictive maintenance using machine learning
- **Dynamic Pricing**: Demand-based pricing algorithms
- **Community Governance**: DAO-style community decision making
- **Cross-Chain Integration**: Interoperability with other blockchain networks
- **Sustainability Rewards**: Token incentives for eco-friendly transportation choices

## Contract Address Details
*Contract deployment information will be added here after deployment*

### Network Information
- **Blockchain**: Stacks (STX)
- **Contract Language**: Clarity
- **Deployment Status**: Pending
- **Contract Owner**: TBD

### Technical Specifications
- **Minimum Deposit**: 1000 microSTX per bike rental
- **Rental Fee**: 10 microSTX per block
- **Maximum Bike ID**: Configurable during initialization
- **Maintenance Notes**: Up to 100 ASCII characters

---

## 🚀 Getting Started with Clarinet & Stacks

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Clarinet CLI](https://docs.hiro.so/clarinet/)
- [Stacks CLI](https://docs.stacks.co/build-apps/references/cli)
- Basic command line knowledge

### Installation

#### 1. Install Clarinet
```bash
# For macOS/Linux
curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-install.sh | bash

# For Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-install.exe" -OutFile "clarinet-install.exe"
./clarinet-install.exe

# Verify installation
clarinet --version
```

#### 2. Install Stacks CLI
```bash
# For macOS/Linux
curl -L https://github.com/hirosystems/stacks.js/releases/latest/download/stacks-cli-install.sh | bash

# For Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/hirosystems/stacks.js/releases/latest/download/stacks-cli-install.exe" -OutFile "stacks-cli-install.exe"
./stacks-cli-install.exe

# Verify installation
stacks --version
```

#### 3. Install Project Dependencies
```bash
npm install
```

### Project Setup

#### 1. Clone and Setup Project
```bash
# Clone the repository
git clone <your-repo-url>
cd bike-sharing-system

# Check project configuration
clarinet check
```

#### 2. Start Local Development Environment
```bash
# Start local Clarinet environment
clarinet dev

# This starts a local blockchain and dashboard
# Keep this running in a separate terminal
```

#### 3. Test Locally
```bash
# Run tests
npm test

# Or use Clarinet directly
clarinet test

# Test contract functions locally
clarinet contract call bike-sharing-system initialize --args u10
clarinet contract call bike-sharing-system get-contract-stats
```

### Deployment

#### 1. Deploy to Testnet
```bash
# Deploy contract to testnet
npm run deploy:testnet

# Or use Clarinet directly
clarinet contract publish bike-sharing-system --network testnet

# Initialize contract
npm run init:testnet

# Or use Clarinet directly
clarinet contract call bike-sharing-system initialize --args u10 --network testnet
```

#### 2. Deploy to Mainnet
```bash
# Deploy contract to mainnet
npm run deploy:mainnet

# Initialize contract
npm run init:mainnet
```

#### 3. Programmatic Deployment
```bash
# Using the deployment script
node scripts/deploy.js testnet <your-private-key>
node scripts/deploy.js mainnet <your-private-key>
```

### Testing

#### 1. Local Testing
```bash
# Start local environment
clarinet dev

# In another terminal, run tests
clarinet test

# Test specific functions
clarinet contract call bike-sharing-system initialize --args u5
clarinet contract call bike-sharing-system get-contract-stats
```

#### 2. Testnet Testing
```bash
# Test on testnet
clarinet contract call bike-sharing-system get-contract-stats --network testnet

# Test bike rental
clarinet contract call bike-sharing-system rent-bike --args u1 u1000 --network testnet

# Test bike return
clarinet contract call bike-sharing-system return-bike --args u1 --network testnet
```

### Contract Interaction

#### Available Functions

**Write Functions:**
- `initialize(initial-bike-count: uint)` - Initialize contract with bikes
- `rent-bike(bike-id: uint, deposit-amount: uint)` - Rent a bike
- `return-bike(bike-id: uint, maintenance-notes: optional<string-ascii 100>)` - Return a bike

**Read Functions:**
- `get-contract-stats()` - Get contract statistics
- `get-bike-status(bike-id: uint)` - Get bike status
- `get-user-rentals(user: principal)` - Get user's rented bikes
- `get-user-deposit(user: principal)` - Get user's deposit
- `get-bike-maintenance-history(bike-id: uint)` - Get bike maintenance history

#### Example Usage
```bash
# Initialize with 10 bikes
clarinet contract call bike-sharing-system initialize --args u10

# Rent bike ID 1 with 1000 microSTX deposit
clarinet contract call bike-sharing-system rent-bike --args u1 u1000

# Return bike ID 1
clarinet contract call bike-sharing-system return-bike --args u1

# Check contract stats
clarinet contract call bike-sharing-system get-contract-stats
```

### Project Structure
```
bike-sharing-system/
├── contracts/
│   └── bike-sharing-system.clar    # Main contract file
├── tests/
│   └── bike-sharing-system_test.ts # Contract tests
├── scripts/
│   └── deploy.js                   # Deployment script
├── Clarinet.toml                   # Clarinet configuration
├── package.json                     # Node.js dependencies
└── README.md                       # This file
```

---

## 🔧 Development Workflow

### 1. Local Development
```bash
# Start local environment
clarinet dev

# Make changes to contract
# Test changes
clarinet test

# Check contract syntax
clarinet check
```

### 2. Testnet Deployment
```bash
# Deploy to testnet
clarinet contract publish bike-sharing-system --network testnet

# Test on testnet
clarinet contract call bike-sharing-system get-contract-stats --network testnet
```

### 3. Mainnet Deployment
```bash
# Deploy to mainnet
clarinet contract publish bike-sharing-system --network mainnet

# Initialize on mainnet
clarinet contract call bike-sharing-system initialize --args u10 --network mainnet
```

---

## 🚨 Common Issues & Solutions

### "Clarinet command not found"
```bash
# Restart terminal or source profile
source ~/.bashrc
# or
source ~/.zshrc
```

### "Contract not found"
```bash
# Check contract path in Clarinet.toml
cat Clarinet.toml
# Ensure path matches your contract file location
```

### "Network error"
```bash
# Check network configuration
clarinet check
# Verify network settings in Clarinet.toml
```

### "Insufficient balance"
```bash
# For testnet: Get STX from faucet
# For mainnet: Ensure you have real STX
```

---

## 📚 Useful Resources

- [Clarinet Documentation](https://docs.hiro.so/clarinet/)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/write-smart-contracts/overview)
- [Stacks Explorer](https://explorer.hiro.so/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎯 Remember**: Always test locally first, then on testnet, and only deploy to mainnet when you're 100% confident everything works correctly!

---

*This project is open source and welcomes community contributions. Join us in building the future of sustainable transportation!*
