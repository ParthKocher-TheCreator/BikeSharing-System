const logger = require('../config/logger');

class EventListenerService {
  constructor(blockchainService, iotService) {
    this.blockchainService = blockchainService;
    this.iotService = iotService;
    this.listeners = [];
  }

  async start() {
    try {
      await this.setupEventListeners();
      logger.info('Event listener service started');
    } catch (error) {
      logger.error('Failed to start event listener service:', error);
      throw error;
    }
  }

  async setupEventListeners() {
    // Listen for RideStarted events
    const rideStartedFilter = await this.blockchainService.getEventFilter('BikeSharing', 'RideStarted');
    
    // Listen for RideEnded events
    const rideEndedFilter = await this.blockchainService.getEventFilter('BikeSharing', 'RideEnded');

    // Set up event listeners (simplified for now)
    logger.info('Blockchain event listeners configured');
  }

  async handleRideStarted(event) {
    try {
      const { rideId, bikeTokenId, rider } = event.args;
      
      logger.info('Ride started event received', {
        rideId: rideId.toString(),
        bikeTokenId: bikeTokenId.toString(),
        rider
      });

      // Trigger IoT unlock
      const bikeData = await this.blockchainService.getBikeData(bikeTokenId);
      const unlockResult = await this.iotService.unlockBike(bikeData.bikeId);

      // Confirm lock operation on blockchain
      await this.blockchainService.confirmLockOperation(rideId, unlockResult.success);

    } catch (error) {
      logger.error('Error handling RideStarted event:', error);
    }
  }

  async handleRideEnded(event) {
    try {
      const { rideId } = event.args;
      
      logger.info('Ride ended event received', {
        rideId: rideId.toString()
      });

      // Get ride details to find the bike
      const rideDetails = await this.blockchainService.getRideDetails(rideId);
      const bikeData = await this.blockchainService.getBikeData(rideDetails.bikeTokenId);

      // Trigger IoT lock
      const lockResult = await this.iotService.lockBike(bikeData.bikeId);

      logger.info('Bike locked after ride ended', {
        rideId: rideId.toString(),
        bikeId: bikeData.bikeId,
        success: lockResult.success
      });

    } catch (error) {
      logger.error('Error handling RideEnded event:', error);
    }
  }

  async stop() {
    try {
      // Clean up event listeners
      this.listeners.forEach(listener => {
        if (listener.removeAllListeners) {
          listener.removeAllListeners();
        }
      });
      
      logger.info('Event listener service stopped');
    } catch (error) {
      logger.error('Error stopping event listener service:', error);
    }
  }
}

module.exports = EventListenerService;