import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { ethers } from 'ethers';

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [1, 3, 4, 5, 42, 137, 80001, 31337]; // Ethereum networks + Polygon + Local

// Connectors
export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
});

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: process.env.REACT_APP_RPC_URL_1,
    137: process.env.REACT_APP_RPC_URL_137,
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000,
});

// Contract addresses (will be loaded from deployed-addresses.json)
export let CONTRACT_ADDRESSES = {};

// Load contract addresses
export const loadContractAddresses = async () => {
  try {
    const response = await fetch('/deployed-addresses.json');
    const data = await response.json();
    CONTRACT_ADDRESSES = data.contracts;
    return data;
  } catch (error) {
    console.error('Failed to load contract addresses:', error);
    // Fallback addresses for development
    CONTRACT_ADDRESSES = {
      RideToken: process.env.REACT_APP_RIDE_TOKEN_ADDRESS,
      BikeDAOToken: process.env.REACT_APP_BIKE_DAO_TOKEN_ADDRESS,
      BikeNFT: process.env.REACT_APP_BIKE_NFT_ADDRESS,
      BikeSharing: process.env.REACT_APP_BIKE_SHARING_ADDRESS,
      MaintenanceManager: process.env.REACT_APP_MAINTENANCE_MANAGER_ADDRESS,
      BikeDAO: process.env.REACT_APP_BIKE_DAO_ADDRESS,
      BikeDAOTreasury: process.env.REACT_APP_TREASURY_ADDRESS,
    };
  }
};

// Network configurations
export const NETWORK_CONFIGS = {
  1: {
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  137: {
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  80001: {
    chainName: 'Polygon Mumbai',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  31337: {
    chainName: 'Localhost 8545',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [''],
  },
};

// Get contract instance
export const getContract = (address, abi, provider) => {
  if (!address || !abi || !provider) {
    throw new Error('Missing required parameters for contract creation');
  }
  
  const signer = provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format token amount
export const formatTokenAmount = (amount, decimals = 18, displayDecimals = 2) => {
  if (!amount) return '0';
  return parseFloat(ethers.utils.formatUnits(amount, decimals)).toFixed(displayDecimals);
};

// Parse token amount
export const parseTokenAmount = (amount, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

// Get network name
export const getNetworkName = (chainId) => {
  const config = NETWORK_CONFIGS[chainId];
  return config ? config.chainName : 'Unknown Network';
};

// Switch network
export const switchNetwork = async (chainId) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const chainIdHex = `0x${chainId.toString(16)}`;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      const config = NETWORK_CONFIGS[chainId];
      if (config) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: config.chainName,
            nativeCurrency: config.nativeCurrency,
            rpcUrls: config.rpcUrls,
            blockExplorerUrls: config.blockExplorerUrls,
          }],
        });
      }
    } else {
      throw switchError;
    }
  }
};

// Add token to wallet
export const addTokenToWallet = async (address, symbol, decimals = 18, image) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals,
          image,
        },
      },
    });

    return wasAdded;
  } catch (error) {
    console.error('Error adding token to wallet:', error);
    return false;
  }
};

// Transaction helpers
export const waitForTransaction = async (provider, hash, confirmations = 1) => {
  try {
    const receipt = await provider.waitForTransaction(hash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

// Error handling
export const handleContractError = (error) => {
  console.error('Contract error:', error);
  
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction may fail. Please check your input parameters.';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds to complete this transaction.';
  }
  
  if (error.code === 4001) {
    return 'Transaction was rejected by user.';
  }
  
  if (error.message && error.message.includes('revert')) {
    const revertReason = error.message.split('revert ')[1];
    return `Transaction failed: ${revertReason}`;
  }
  
  return error.message || 'An unknown error occurred.';
};

// IPFS helpers
export const uploadToIPFS = async (data) => {
  // This would integrate with your IPFS service
  // For now, return a mock hash
  console.log('Uploading to IPFS:', data);
  return 'QmMockIPFSHash';
};

export const fetchFromIPFS = async (hash) => {
  // This would fetch from your IPFS service
  // For now, return mock data
  console.log('Fetching from IPFS:', hash);
  return { data: 'mock data' };
};