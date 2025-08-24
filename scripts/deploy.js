const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { makeContractDeploy } = require('@stacks/transactions');
const fs = require('fs');
const path = require('path');

// Configuration
const CONTRACT_NAME = 'bike-sharing-system';
const CONTRACT_PATH = path.join(__dirname, '../contracts/bike-sharing-system.clar');

// Read contract code
function readContractCode() {
  try {
    return fs.readFileSync(CONTRACT_PATH, 'utf8');
  } catch (error) {
    console.error('Error reading contract file:', error.message);
    process.exit(1);
  }
}

// Deploy contract
async function deployContract(network, privateKey) {
  try {
    const contractCode = readContractCode();
    
    console.log(`Deploying ${CONTRACT_NAME} to ${network.name}...`);
    console.log('Contract size:', contractCode.length, 'characters');
    
    const transaction = await makeContractDeploy({
      contractName: CONTRACT_NAME,
      codeBody: contractCode,
      senderKey: privateKey,
      network,
    });
    
    console.log('✅ Contract deployment transaction created successfully!');
    console.log('Transaction ID:', transaction.txid());
    console.log('Contract Address:', `${transaction.payload.contractName}.${CONTRACT_NAME}`);
    
    return transaction;
  } catch (error) {
    console.error('❌ Contract deployment failed:', error.message);
    throw error;
  }
}

// Initialize contract
async function initializeContract(network, privateKey, contractAddress, bikeCount = 10) {
  try {
    console.log(`Initializing contract with ${bikeCount} bikes...`);
    
    // This would require additional setup for contract calls
    // For now, we'll just show the command
    console.log('To initialize the contract, run:');
    console.log(`clarinet contract call ${CONTRACT_NAME} initialize --args u${bikeCount} --network ${network.name}`);
    
  } catch (error) {
    console.error('❌ Contract initialization failed:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const networkType = args[0] || 'testnet';
  const privateKey = args[1];
  
  if (!privateKey) {
    console.error('❌ Please provide your private key as the second argument');
    console.log('Usage: node deploy.js [testnet|mainnet] <private-key>');
    console.log('Example: node deploy.js testnet 1234567890abcdef...');
    process.exit(1);
  }
  
  // Select network
  const network = networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
  
  try {
    // Deploy contract
    const transaction = await deployContract(network, privateKey);
    
    // Show next steps
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Wait for transaction confirmation');
    console.log('2. Initialize the contract with bikes');
    console.log('3. Test the contract functions');
    console.log('4. Update your README with the contract address');
    
    console.log('\n🔗 View transaction on explorer:');
    if (networkType === 'testnet') {
      console.log(`https://explorer.hiro.so/sandbox/txid/${transaction.txid()}`);
    } else {
      console.log(`https://explorer.hiro.so/txid/${transaction.txid()}`);
    }
    
  } catch (error) {
    console.error('\n💥 Deployment failed. Please check the error above and try again.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  deployContract,
  initializeContract
};