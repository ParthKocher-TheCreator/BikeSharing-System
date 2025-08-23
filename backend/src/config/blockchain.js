const { ethers } = require('ethers');
const logger = require('./logger');

class BlockchainConfig {
  constructor() {
    this.provider = null;
    this.chainId = null;
    this.networkConfig = null;
  }

  async initialize() {
    try {
      this.chainId = parseInt(process.env.CHAIN_ID) || 31337;
      
      const networkConfigs = {
        31337: {
          name: 'localhost',
          rpcUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
          blockTime: 2000, // 2 seconds
        },
        137: {
          name: 'polygon',
          rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
          blockTime: 2000, // 2 seconds
        },
        80001: {
          name: 'mumbai',
          rpcUrl: process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
          blockTime: 2000, // 2 seconds
        }
      };

      this.networkConfig = networkConfigs[this.chainId];
      if (!this.networkConfig) {
        throw new Error(`Unsupported chain ID: ${this.chainId}`);
      }

      this.provider = new ethers.providers.JsonRpcProvider(this.networkConfig.rpcUrl);
      
      // Test connection
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      logger.info('Blockchain configuration initialized', {
        chainId: this.chainId,
        network: this.networkConfig.name,
        blockNumber,
        rpcUrl: this.networkConfig.rpcUrl
      });

    } catch (error) {
      logger.error('Failed to initialize blockchain configuration:', error);
      throw error;
    }
  }

  getProvider() {
    return this.provider;
  }

  getChainId() {
    return this.chainId;
  }

  getNetworkConfig() {
    return this.networkConfig;
  }

  async isHealthy() {
    try {
      if (!this.provider) {
        return false;
      }
      
      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      logger.error('Blockchain health check failed:', error);
      return false;
    }
  }
}

module.exports = new BlockchainConfig();