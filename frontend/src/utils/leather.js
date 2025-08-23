import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV
} from '@stacks/transactions';

// App configuration for Stacks
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network configuration
export const network = process.env.NODE_ENV === 'production' 
  ? new StacksMainnet() 
  : new StacksTestnet();

// Leather wallet integration class
class LeatherWallet {
  constructor() {
    this.userSession = userSession;
    this.isConnected = false;
    this.userAddress = null;
  }

  // Check if user is signed in
  isSignedIn() {
    return this.userSession.isUserSignedIn();
  }

  // Get user data
  getUserData() {
    if (this.isSignedIn()) {
      return this.userSession.loadUserData();
    }
    return null;
  }

  // Connect to Leather wallet
  async connect() {
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: {
          name: 'BikeDAO',
          icon: '/logo192.png', // Your app icon
        },
        redirectTo: '/',
        onFinish: () => {
          this.isConnected = true;
          const userData = this.getUserData();
          this.userAddress = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet;
          resolve(userData);
        },
        onCancel: () => {
          reject(new Error('User cancelled connection'));
        },
        userSession: this.userSession,
      });
    });
  }

  // Disconnect from wallet
  disconnect() {
    if (this.isSignedIn()) {
      this.userSession.signUserOut('/');
      this.isConnected = false;
      this.userAddress = null;
    }
  }

  // Get user's STX address
  getAddress() {
    if (this.isSignedIn()) {
      const userData = this.getUserData();
      return userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet;
    }
    return null;
  }

  // Get STX balance (this would need to be implemented with Stacks API)
  async getSTXBalance() {
    const address = this.getAddress();
    if (!address) return '0';

    try {
      // Call Stacks API to get balance
      const response = await fetch(`https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/balances`);
      const data = await response.json();
      return data.stx.balance;
    } catch (error) {
      console.error('Error fetching STX balance:', error);
      return '0';
    }
  }

  // Make a contract call (example for future Stacks integration)
  async makeContractCall(contractAddress, contractName, functionName, functionArgs) {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      senderKey: this.userSession.loadUserData().appPrivateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    try {
      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, network);
      return result;
    } catch (error) {
      console.error('Contract call failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const leatherWallet = new LeatherWallet();

// Utility functions
export const formatSTXAmount = (amount, decimals = 6) => {
  const stx = parseFloat(amount) / 1000000; // STX has 6 decimal places
  return stx.toFixed(decimals);
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Check if Leather wallet is installed
export const isLeatherInstalled = () => {
  return typeof window !== 'undefined' && window.LeatherProvider;
};

// Get Leather provider (for direct wallet interactions)
export const getLeatherProvider = () => {
  if (typeof window !== 'undefined' && window.LeatherProvider) {
    return window.LeatherProvider;
  }
  return null;
};