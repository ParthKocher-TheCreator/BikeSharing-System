# 🚲 BikeSharing System

## Project Title & Short Description

**BikeSharing System** is a decentralized community-owned bike sharing platform built on the Stacks blockchain. The system enables users to rent and return bikes with integrated maintenance tracking, usage incentives, and transparent operations. Users can rent bikes by providing a deposit, track rental duration, and report maintenance issues when returning bikes.

---

## Tech Stack Used

- **Blockchain**: Stacks (STX)
- **Smart Contract Language**: Clarity
- **Development Framework**: Clarinet
- **Testing Framework**: Clarinet Test Suite
- **Deployment Tools**: Stacks CLI, Clarinet CLI
- **Programming Language**: TypeScript (for tests)
- **Package Manager**: npm

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Git
- Basic command line knowledge

### Step 1: Install Required Tools

#### Install Clarinet CLI
```bash
# For macOS/Linux
curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-install.sh | bash

# For Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-install.exe" -OutFile "clarinet-install.exe"
./clarinet-install.exe

# Verify installation
clarinet --version
```

#### Install Stacks CLI
```bash
# For macOS/Linux
curl -L https://github.com/hirosystems/stacks.js/releases/latest/download/stacks-cli-install.sh | bash

# For Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/hirosystems/stacks.js/releases/latest/download/stacks-cli-install.exe" -OutFile "stacks-cli-install.exe"
./stacks-cli-install.exe

# Verify installation
stacks --version
```

### Step 2: Clone and Setup Project
```bash
# Clone the repository
git clone <your-repo-url>
cd bike-sharing-system

# Install dependencies
npm install

# Check project configuration
clarinet check
```

### Step 3: Start Local Development
```bash
# Start local Clarinet environment
clarinet dev

# Keep this running in a separate terminal
```

### Step 4: Test Locally
```bash
# In a new terminal, run tests
npm test

# Test contract functions
clarinet contract call bike-sharing-system initialize --args u10
clarinet contract call bike-sharing-system get-contract-stats
```

---

## Smart Contract Address (Deployed on Testnet/Mainnet)

### Testnet Deployment
- **Contract Address**: `ST1PQHQKV0RJXZFYVWE6CHS7RT4WXZV80C6QWTWXY.bike-sharing-system`
- **Network**: Stacks Testnet
- **Status**: Ready for deployment
- **Explorer**: [Testnet Explorer](https://explorer.hiro.so/sandbox)

### Mainnet Deployment
- **Contract Address**: `[To be deployed]`
- **Network**: Stacks Mainnet
- **Status**: Pending
- **Explorer**: [Mainnet Explorer](https://explorer.hiro.so)

### Deployment Commands
```bash
# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Initialize contract (after deployment)
npm run init:testnet
npm run init:mainnet
```

---

## How to Use the Project

### 1. Local Development

#### Start Local Environment
```bash
# Start local blockchain
clarinet dev
```

#### Test Contract Functions
```bash
# Initialize with 10 bikes
clarinet contract call bike-sharing-system initialize --args u10

# Check contract statistics
clarinet contract call bike-sharing-system get-contract-stats

# Rent bike ID 1 with 1000 microSTX deposit
clarinet contract call bike-sharing-system rent-bike --args u1 u1000

# Return bike ID 1
clarinet contract call bike-sharing-system return-bike --args u1
```

### 2. Testnet Usage

#### Deploy to Testnet
```bash
# Deploy contract
clarinet contract publish bike-sharing-system --network testnet

# Initialize contract
clarinet contract call bike-sharing-system initialize --args u10 --network testnet
```

#### Interact on Testnet
```bash
# Check contract stats
clarinet contract call bike-sharing-system get-contract-stats --network testnet

# Rent a bike
clarinet contract call bike-sharing-system rent-bike --args u1 u1000 --network testnet

# Return a bike
clarinet contract call bike-sharing-system return-bike --args u1 --network testnet
```

### 3. Mainnet Usage

#### Deploy to Mainnet
```bash
# Deploy contract
clarinet contract publish bike-sharing-system --network mainnet

# Initialize contract
clarinet contract call bike-sharing-system initialize --args u10 --network mainnet
```

#### Interact on Mainnet
```bash
# Check contract stats
clarinet contract call bike-sharing-system get-contract-stats --network mainnet

# Rent a bike
clarinet contract call bike-sharing-system rent-bike --args u1 u1000 --network mainnet

# Return a bike
clarinet contract call bike-sharing-system return-bike --args u1 --network mainnet
```

### 4. Available Functions

#### Write Functions (Cost STX)
- **`initialize(initial-bike-count: uint)`** - Initialize contract with bikes
- **`rent-bike(bike-id: uint, deposit-amount: uint)`** - Rent a bike
- **`return-bike(bike-id: uint, maintenance-notes: optional<string-ascii 100>)`** - Return a bike

#### Read Functions (Free)
- **`get-contract-stats()`** - Get contract statistics
- **`get-bike-status(bike-id: uint)`** - Get bike status
- **`get-user-rentals(user: principal)`** - Get user's rented bikes
- **`get-user-deposit(user: principal)`** - Get user's deposit
- **`get-bike-maintenance-history(bike-id: uint)`** - Get bike maintenance history

### 5. Example Workflow

#### Complete Bike Rental Cycle
```bash
# 1. Initialize contract with 5 bikes
clarinet contract call bike-sharing-system initialize --args u5

# 2. Check initial state
clarinet contract call bike-sharing-system get-contract-stats

# 3. Rent bike ID 1
clarinet contract call bike-sharing-system rent-bike --args u1 u1000

# 4. Check bike status
clarinet contract call bike-sharing-system get-bike-status --args u1

# 5. Return bike with maintenance note
clarinet contract call bike-sharing-system return-bike --args u1 --args "Brake needs adjustment"

# 6. Check final state
clarinet contract call bike-sharing-system get-contract-stats
```

### 6. Testing

#### Run All Tests
```bash
npm test
```

#### Run Specific Tests
```bash
clarinet test --filter "BikeSharing System - Basic Functionality"
```

#### Check Contract Syntax
```bash
clarinet check
```

---

## Project Structure
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

## Troubleshooting

### Common Issues

#### "Clarinet command not found"
```bash
# Restart terminal or source profile
source ~/.bashrc
# or
source ~/.zshrc
```

#### "Contract not found"
```bash
# Check contract path in Clarinet.toml
cat Clarinet.toml
```

#### "Network error"
```bash
# Check network configuration
clarinet check
```

#### "Insufficient balance"
```bash
# For testnet: Get STX from faucet
# For mainnet: Ensure you have real STX
```

---

## Resources

- [Clarinet Documentation](https://docs.hiro.so/clarinet/)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/write-smart-contracts/overview)
- [Stacks Explorer](https://explorer.hiro.so/)

---

## License

This project is licensed under the MIT License.
