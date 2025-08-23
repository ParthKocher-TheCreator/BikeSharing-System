// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BikeNFT.sol";
import "./RideToken.sol";

/**
 * @title BikeSharing
 * @dev Main contract for handling bike rides, payments, and integration
 */
contract BikeSharing is Ownable, ReentrancyGuard {
    BikeNFT public bikeNFT;
    RideToken public rideToken;
    
    // Ride pricing configuration
    uint256 public baseFee = 1 * 10**18; // 1 RIDE token base fee
    uint256 public perMinuteFee = 0.1 * 10**18; // 0.1 RIDE per minute
    uint256 public securityDeposit = 10 * 10**18; // 10 RIDE security deposit
    
    // Treasury addresses
    address public daoTreasury;
    
    // Oracle service address for IoT communication
    address public oracleService;
    
    // Ride data structure
    struct Ride {
        uint256 bikeTokenId;
        address rider;
        uint256 startTime;
        uint256 endTime;
        uint256 depositAmount;
        uint256 finalCost;
        bool active;
        bool ended;
    }
    
    // Mappings
    mapping(uint256 => Ride) public rides; // rideId => Ride
    mapping(address => uint256) public activeRides; // rider => rideId
    mapping(address => uint256) public userDeposits; // user => deposit amount
    
    // Counters
    uint256 private rideCounter;
    
    // Events
    event RideStarted(uint256 indexed rideId, uint256 indexed bikeTokenId, address indexed rider, uint256 startTime);
    event RideEnded(uint256 indexed rideId, uint256 endTime, uint256 finalCost, uint256 refund);
    event DepositMade(address indexed user, uint256 amount);
    event DepositWithdrawn(address indexed user, uint256 amount);
    event FeeUpdated(string feeType, uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event IssueReported(uint256 indexed bikeTokenId, address indexed reporter, string description);

    constructor(
        address initialOwner,
        address _bikeNFT,
        address _rideToken,
        address _daoTreasury,
        address _oracleService
    ) Ownable(initialOwner) {
        bikeNFT = BikeNFT(_bikeNFT);
        rideToken = RideToken(_rideToken);
        daoTreasury = _daoTreasury;
        oracleService = _oracleService;
    }

    /**
     * @dev Modifier to check if caller is oracle service
     */
    modifier onlyOracle() {
        require(msg.sender == oracleService, "Only oracle can call this function");
        _;
    }

    /**
     * @dev Make a deposit to activate account
     * @param amount Amount of RIDE tokens to deposit
     */
    function makeDeposit(uint256 amount) external nonReentrant {
        require(amount >= securityDeposit, "Deposit amount too low");
        require(rideToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userDeposits[msg.sender] += amount;
        
        emit DepositMade(msg.sender, amount);
    }

    /**
     * @dev Withdraw deposit (only if no active rides)
     * @param amount Amount to withdraw
     */
    function withdrawDeposit(uint256 amount) external nonReentrant {
        require(activeRides[msg.sender] == 0, "Cannot withdraw with active ride");
        require(userDeposits[msg.sender] >= amount, "Insufficient deposit");
        
        userDeposits[msg.sender] -= amount;
        require(rideToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit DepositWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Start a ride
     * @param bikeTokenId Token ID of the bike to rent
     */
    function startRide(uint256 bikeTokenId) external nonReentrant returns (uint256) {
        require(activeRides[msg.sender] == 0, "User already has an active ride");
        require(userDeposits[msg.sender] >= securityDeposit, "Insufficient deposit");
        
        // Check bike availability
        BikeNFT.BikeData memory bikeData = bikeNFT.getBikeData(bikeTokenId);
        require(bikeData.status == BikeNFT.BikeStatus.Available, "Bike not available");
        
        // Create ride
        rideCounter++;
        uint256 rideId = rideCounter;
        
        rides[rideId] = Ride({
            bikeTokenId: bikeTokenId,
            rider: msg.sender,
            startTime: block.timestamp,
            endTime: 0,
            depositAmount: securityDeposit,
            finalCost: 0,
            active: true,
            ended: false
        });
        
        activeRides[msg.sender] = rideId;
        
        // Update bike status
        bikeNFT.updateBikeStatus(bikeTokenId, BikeNFT.BikeStatus.InUse);
        
        emit RideStarted(rideId, bikeTokenId, msg.sender, block.timestamp);
        
        return rideId;
    }

    /**
     * @dev End a ride
     * @param rideId ID of the ride to end
     * @param finalLatitude Final latitude position (scaled by 1e6)
     * @param finalLongitude Final longitude position (scaled by 1e6)
     * @param distance Distance traveled in meters
     */
    function endRide(
        uint256 rideId,
        int256 finalLatitude,
        int256 finalLongitude,
        uint256 distance
    ) external nonReentrant {
        require(rides[rideId].active, "Ride not active");
        require(rides[rideId].rider == msg.sender, "Not ride owner");
        require(!rides[rideId].ended, "Ride already ended");
        
        Ride storage ride = rides[rideId];
        uint256 bikeTokenId = ride.bikeTokenId;
        
        // Calculate ride duration and cost
        uint256 duration = block.timestamp - ride.startTime;
        uint256 durationMinutes = duration / 60;
        uint256 totalCost = baseFee + (durationMinutes * perMinuteFee);
        
        // Ensure cost doesn't exceed deposit
        if (totalCost > ride.depositAmount) {
            totalCost = ride.depositAmount;
        }
        
        // Update ride data
        ride.endTime = block.timestamp;
        ride.finalCost = totalCost;
        ride.active = false;
        ride.ended = true;
        
        // Clear active ride
        activeRides[msg.sender] = 0;
        
        // Deduct cost from user deposit
        userDeposits[msg.sender] -= totalCost;
        
        // Transfer cost to DAO treasury
        require(rideToken.transfer(daoTreasury, totalCost), "Treasury transfer failed");
        
        // Update bike status and location
        bikeNFT.updateBikeStatus(bikeTokenId, BikeNFT.BikeStatus.Available);
        bikeNFT.updateBikeLocation(bikeTokenId, finalLatitude, finalLongitude);
        bikeNFT.updateRideStats(bikeTokenId, 1, distance);
        
        // Calculate refund
        uint256 refund = ride.depositAmount - totalCost;
        
        emit RideEnded(rideId, block.timestamp, totalCost, refund);
    }

    /**
     * @dev Report an issue with a bike
     * @param bikeTokenId Token ID of the bike with issues
     * @param description Description of the issue
     */
    function reportIssue(uint256 bikeTokenId, string memory description) external {
        // Update bike status to needs maintenance
        bikeNFT.updateBikeStatus(bikeTokenId, BikeNFT.BikeStatus.NeedsMaintenance);
        
        emit IssueReported(bikeTokenId, msg.sender, description);
        
        // Reward user for reporting (mint reward tokens)
        rideToken.mint(msg.sender, 5 * 10**18); // 5 RIDE reward
    }

    /**
     * @dev Oracle function to confirm bike lock/unlock
     * @param rideId ID of the ride
     * @param success Whether the lock operation was successful
     */
    function confirmLockOperation(uint256 rideId, bool success) external onlyOracle {
        require(rides[rideId].active || rides[rideId].ended, "Invalid ride");
        
        if (!success && rides[rideId].active) {
            // If unlock failed, revert the ride start
            Ride storage ride = rides[rideId];
            ride.active = false;
            activeRides[ride.rider] = 0;
            bikeNFT.updateBikeStatus(ride.bikeTokenId, BikeNFT.BikeStatus.Available);
        }
    }

    /**
     * @dev Update base fee (only owner)
     * @param newBaseFee New base fee amount
     */
    function updateBaseFee(uint256 newBaseFee) external onlyOwner {
        uint256 oldFee = baseFee;
        baseFee = newBaseFee;
        emit FeeUpdated("base", oldFee, newBaseFee);
    }

    /**
     * @dev Update per minute fee (only owner)
     * @param newPerMinuteFee New per minute fee amount
     */
    function updatePerMinuteFee(uint256 newPerMinuteFee) external onlyOwner {
        uint256 oldFee = perMinuteFee;
        perMinuteFee = newPerMinuteFee;
        emit FeeUpdated("perMinute", oldFee, newPerMinuteFee);
    }

    /**
     * @dev Update security deposit (only owner)
     * @param newSecurityDeposit New security deposit amount
     */
    function updateSecurityDeposit(uint256 newSecurityDeposit) external onlyOwner {
        uint256 oldDeposit = securityDeposit;
        securityDeposit = newSecurityDeposit;
        emit FeeUpdated("deposit", oldDeposit, newSecurityDeposit);
    }

    /**
     * @dev Update DAO treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = daoTreasury;
        daoTreasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Update oracle service address (only owner)
     * @param newOracle New oracle address
     */
    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = oracleService;
        oracleService = newOracle;
        emit OracleUpdated(oldOracle, newOracle);
    }

    /**
     * @dev Get ride details
     * @param rideId ID of the ride
     * @return Ride struct
     */
    function getRideDetails(uint256 rideId) external view returns (Ride memory) {
        return rides[rideId];
    }

    /**
     * @dev Get user's current active ride
     * @param user Address of the user
     * @return rideId Active ride ID (0 if none)
     */
    function getUserActiveRide(address user) external view returns (uint256) {
        return activeRides[user];
    }

    /**
     * @dev Get user's deposit balance
     * @param user Address of the user
     * @return Deposit balance
     */
    function getUserDeposit(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    /**
     * @dev Get current ride counter
     * @return Current ride counter value
     */
    function getCurrentRideId() external view returns (uint256) {
        return rideCounter;
    }
}