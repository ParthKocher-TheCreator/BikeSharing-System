const { ethers } = require('ethers');
const logger = require('../config/logger');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.contractABIs = {
      BikeSharing: [
        'function confirmLockOperation(uint256 rideId, bool success)',
        'function getRideDetails(uint256 rideId) view returns (tuple(uint256 bikeTokenId, address rider, uint256 startTime, uint256 endTime, uint256 depositAmount, uint256 finalCost, bool active, bool ended))',
        'event RideStarted(uint256 indexed rideId, uint256 indexed bikeTokenId, address indexed rider, uint256 startTime)',
        'event RideEnded(uint256 indexed rideId, uint256 endTime, uint256 finalCost, uint256 refund)',
      ],
      BikeNFT: [
        'function updateBikeLocation(uint256 tokenId, int256 latitude, int256 longitude)',
        'function updateBikeStatus(uint256 tokenId, uint8 newStatus)',
        'function getBikeData(uint256 tokenId) view returns (tuple(string bikeId, string model, string make, uint256 purchaseDate, uint8 status, int256 latitude, int256 longitude, string maintenanceHash, uint256 totalRides, uint256 totalDistance))',
        'event BikeLocationUpdated(uint256 indexed tokenId, int256 latitude, int256 longitude)',
        'event BikeStatusUpdated(uint256 indexed tokenId, uint8 oldStatus, uint8 newStatus)',
      ],
      MaintenanceManager: [
        'function getMaintenanceJob(uint256 jobId) view returns (tuple(uint256 bikeTokenId, address reporter, address assignedMaintainer, address validator, string description, string proofHash, uint256 stakeAmount, uint256 rewardAmount, uint256 createdAt, uint256 completedAt, uint256 validatedAt, uint8 status))',
        'event MaintenanceReported(uint256 indexed jobId, uint256 indexed bikeTokenId, address indexed reporter, string description)',
        'event MaintenanceCompleted(uint256 indexed jobId, string proofHash)',
      ],
    };
  }

  async initialize() {
    try {
      // Initialize provider based on chain ID
      const chainId = parseInt(process.env.CHAIN_ID) || 31337;
      
      if (chainId === 31337) {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      } else if (chainId === 137 || chainId === 80001) {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
      } else {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Initialize wallet
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY environment variable is required');
      }

      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      // Load contract addresses and initialize contracts
      await this.loadContracts();
      
      logger.info('Blockchain service initialized successfully', {
        address: this.wallet.address,
        chainId,
        network: await this.provider.getNetwork()
      });

    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async loadContracts() {
    const contractAddresses = {
      BikeSharing: process.env.BIKE_SHARING_CONTRACT,
      BikeNFT: process.env.BIKE_NFT_CONTRACT,
      MaintenanceManager: process.env.MAINTENANCE_MANAGER_CONTRACT,
    };

    for (const [name, address] of Object.entries(contractAddresses)) {
      if (address && this.contractABIs[name]) {
        this.contracts[name] = new ethers.Contract(
          address,
          this.contractABIs[name],
          this.wallet
        );
        logger.info(`Contract ${name} loaded at ${address}`);
      } else {
        logger.warn(`Contract ${name} not configured or ABI missing`);
      }
    }
  }

  // Bike location and status updates
  async updateBikeLocation(tokenId, latitude, longitude) {
    try {
      if (!this.contracts.BikeNFT) {
        throw new Error('BikeNFT contract not initialized');
      }

      // Convert to scaled integers
      const scaledLat = Math.round(latitude * 1e6);
      const scaledLng = Math.round(longitude * 1e6);

      const tx = await this.contracts.BikeNFT.updateBikeLocation(
        tokenId,
        scaledLat,
        scaledLng
      );

      await tx.wait();
      
      logger.info(`Bike location updated for token ${tokenId}`, {
        tokenId,
        latitude,
        longitude,
        txHash: tx.hash
      });

      return tx.hash;
    } catch (error) {
      logger.error(`Failed to update bike location for token ${tokenId}:`, error);
      throw error;
    }
  }

  async updateBikeStatus(tokenId, status) {
    try {
      if (!this.contracts.BikeNFT) {
        throw new Error('BikeNFT contract not initialized');
      }

      const tx = await this.contracts.BikeNFT.updateBikeStatus(tokenId, status);
      await tx.wait();
      
      logger.info(`Bike status updated for token ${tokenId}`, {
        tokenId,
        status,
        txHash: tx.hash
      });

      return tx.hash;
    } catch (error) {
      logger.error(`Failed to update bike status for token ${tokenId}:`, error);
      throw error;
    }
  }

  // Ride management
  async confirmLockOperation(rideId, success) {
    try {
      if (!this.contracts.BikeSharing) {
        throw new Error('BikeSharing contract not initialized');
      }

      const tx = await this.contracts.BikeSharing.confirmLockOperation(rideId, success);
      await tx.wait();
      
      logger.info(`Lock operation confirmed for ride ${rideId}`, {
        rideId,
        success,
        txHash: tx.hash
      });

      return tx.hash;
    } catch (error) {
      logger.error(`Failed to confirm lock operation for ride ${rideId}:`, error);
      throw error;
    }
  }

  async getRideDetails(rideId) {
    try {
      if (!this.contracts.BikeSharing) {
        throw new Error('BikeSharing contract not initialized');
      }

      const rideDetails = await this.contracts.BikeSharing.getRideDetails(rideId);
      
      return {
        bikeTokenId: rideDetails.bikeTokenId.toString(),
        rider: rideDetails.rider,
        startTime: rideDetails.startTime.toNumber(),
        endTime: rideDetails.endTime.toNumber(),
        depositAmount: rideDetails.depositAmount.toString(),
        finalCost: rideDetails.finalCost.toString(),
        active: rideDetails.active,
        ended: rideDetails.ended
      };
    } catch (error) {
      logger.error(`Failed to get ride details for ride ${rideId}:`, error);
      throw error;
    }
  }

  async getBikeData(tokenId) {
    try {
      if (!this.contracts.BikeNFT) {
        throw new Error('BikeNFT contract not initialized');
      }

      const bikeData = await this.contracts.BikeNFT.getBikeData(tokenId);
      
      return {
        bikeId: bikeData.bikeId,
        model: bikeData.model,
        make: bikeData.make,
        purchaseDate: bikeData.purchaseDate.toNumber(),
        status: bikeData.status,
        latitude: bikeData.latitude.toNumber() / 1e6,
        longitude: bikeData.longitude.toNumber() / 1e6,
        maintenanceHash: bikeData.maintenanceHash,
        totalRides: bikeData.totalRides.toString(),
        totalDistance: bikeData.totalDistance.toString()
      };
    } catch (error) {
      logger.error(`Failed to get bike data for token ${tokenId}:`, error);
      throw error;
    }
  }

  // Event listening
  async getEventFilter(contractName, eventName) {
    const contract = this.contracts[contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    return contract.filters[eventName]();
  }

  async getLogs(filter, fromBlock = 'latest', toBlock = 'latest') {
    try {
      const logs = await this.provider.getLogs({
        ...filter,
        fromBlock,
        toBlock
      });

      return logs.map(log => {
        // Parse log with appropriate contract interface
        for (const [contractName, contract] of Object.entries(this.contracts)) {
          try {
            const parsed = contract.interface.parseLog(log);
            return {
              contractName,
              eventName: parsed.name,
              args: parsed.args,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              address: log.address
            };
          } catch {
            // Continue to next contract if parsing fails
          }
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      logger.error('Failed to get logs:', error);
      throw error;
    }
  }

  // Gas estimation and transaction utilities
  async estimateGas(contract, method, args = []) {
    try {
      const gasEstimate = await contract.estimateGas[method](...args);
      return gasEstimate.toString();
    } catch (error) {
      logger.error(`Failed to estimate gas for ${method}:`, error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      throw error;
    }
  }

  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Failed to get block number:', error);
      throw error;
    }
  }

  async getTransactionReceipt(txHash) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error(`Failed to get transaction receipt for ${txHash}:`, error);
      throw error;
    }
  }

  // Health check
  async isHealthy() {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      logger.error('Blockchain service health check failed:', error);
      return false;
    }
  }
}

module.exports = BlockchainService;