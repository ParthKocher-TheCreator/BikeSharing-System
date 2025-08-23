// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BikeNFT
 * @dev NFT contract representing physical bikes in the sharing system
 * Each NFT represents a unique bike with metadata and status tracking
 */
contract BikeNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Bike status enumeration
    enum BikeStatus {
        Available,
        InUse,
        NeedsMaintenance,
        Decommissioned
    }
    
    // Bike data structure
    struct BikeData {
        string bikeId;          // Physical bike identifier
        string model;           // Bike model
        string make;            // Bike manufacturer
        uint256 purchaseDate;   // Purchase timestamp
        BikeStatus status;      // Current status
        int256 latitude;        // Current latitude (scaled by 1e6)
        int256 longitude;       // Current longitude (scaled by 1e6)
        string maintenanceHash; // IPFS hash for maintenance records
        uint256 totalRides;     // Total number of rides
        uint256 totalDistance;  // Total distance in meters
    }
    
    // Mapping from token ID to bike data
    mapping(uint256 => BikeData) public bikes;
    
    // Mapping from bike ID to token ID
    mapping(string => uint256) public bikeIdToTokenId;
    
    // Authorized addresses that can update bike status and location
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event BikeAdded(uint256 indexed tokenId, string bikeId, address indexed owner);
    event BikeStatusUpdated(uint256 indexed tokenId, BikeStatus oldStatus, BikeStatus newStatus);
    event BikeLocationUpdated(uint256 indexed tokenId, int256 latitude, int256 longitude);
    event BikeMaintenanceUpdated(uint256 indexed tokenId, string maintenanceHash);
    event RideStatsUpdated(uint256 indexed tokenId, uint256 totalRides, uint256 totalDistance);
    event AuthorizedUpdaterAdded(address indexed updater);
    event AuthorizedUpdaterRemoved(address indexed updater);

    constructor(address initialOwner) ERC721("BikeNFT", "BIKE") Ownable(initialOwner) {}

    /**
     * @dev Add an authorized updater
     * @param updater Address to authorize
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        require(updater != address(0), "Invalid updater address");
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }

    /**
     * @dev Remove an authorized updater
     * @param updater Address to remove authorization from
     */
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit AuthorizedUpdaterRemoved(updater);
    }

    /**
     * @dev Modifier to check if caller is authorized to update bike data
     */
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    /**
     * @dev Mint a new bike NFT
     * @param to Address to mint the NFT to
     * @param bikeId Physical bike identifier
     * @param model Bike model
     * @param make Bike manufacturer
     * @param tokenURI Metadata URI for the NFT
     */
    function mintBike(
        address to,
        string memory bikeId,
        string memory model,
        string memory make,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(bytes(bikeId).length > 0, "Bike ID cannot be empty");
        require(bikeIdToTokenId[bikeId] == 0, "Bike ID already exists");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Store the mapping (add 1 to avoid collision with default value 0)
        bikeIdToTokenId[bikeId] = tokenId + 1;
        
        // Initialize bike data
        bikes[tokenId] = BikeData({
            bikeId: bikeId,
            model: model,
            make: make,
            purchaseDate: block.timestamp,
            status: BikeStatus.Available,
            latitude: 0,
            longitude: 0,
            maintenanceHash: "",
            totalRides: 0,
            totalDistance: 0
        });
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit BikeAdded(tokenId, bikeId, to);
        return tokenId;
    }

    /**
     * @dev Update bike status
     * @param tokenId Token ID of the bike
     * @param newStatus New status for the bike
     */
    function updateBikeStatus(uint256 tokenId, BikeStatus newStatus) external onlyAuthorized {
        require(_exists(tokenId), "Bike does not exist");
        
        BikeStatus oldStatus = bikes[tokenId].status;
        bikes[tokenId].status = newStatus;
        
        emit BikeStatusUpdated(tokenId, oldStatus, newStatus);
    }

    /**
     * @dev Update bike location
     * @param tokenId Token ID of the bike
     * @param latitude New latitude (scaled by 1e6)
     * @param longitude New longitude (scaled by 1e6)
     */
    function updateBikeLocation(uint256 tokenId, int256 latitude, int256 longitude) external onlyAuthorized {
        require(_exists(tokenId), "Bike does not exist");
        
        bikes[tokenId].latitude = latitude;
        bikes[tokenId].longitude = longitude;
        
        emit BikeLocationUpdated(tokenId, latitude, longitude);
    }

    /**
     * @dev Update bike maintenance records
     * @param tokenId Token ID of the bike
     * @param maintenanceHash IPFS hash of maintenance records
     */
    function updateMaintenanceHash(uint256 tokenId, string memory maintenanceHash) external onlyAuthorized {
        require(_exists(tokenId), "Bike does not exist");
        
        bikes[tokenId].maintenanceHash = maintenanceHash;
        
        emit BikeMaintenanceUpdated(tokenId, maintenanceHash);
    }

    /**
     * @dev Update ride statistics
     * @param tokenId Token ID of the bike
     * @param ridesIncrement Number of rides to add
     * @param distanceIncrement Distance to add (in meters)
     */
    function updateRideStats(uint256 tokenId, uint256 ridesIncrement, uint256 distanceIncrement) external onlyAuthorized {
        require(_exists(tokenId), "Bike does not exist");
        
        bikes[tokenId].totalRides += ridesIncrement;
        bikes[tokenId].totalDistance += distanceIncrement;
        
        emit RideStatsUpdated(tokenId, bikes[tokenId].totalRides, bikes[tokenId].totalDistance);
    }

    /**
     * @dev Get bike data by token ID
     * @param tokenId Token ID of the bike
     * @return BikeData struct
     */
    function getBikeData(uint256 tokenId) external view returns (BikeData memory) {
        require(_exists(tokenId), "Bike does not exist");
        return bikes[tokenId];
    }

    /**
     * @dev Get token ID by bike ID
     * @param bikeId Physical bike identifier
     * @return Token ID (subtract 1 from stored value)
     */
    function getTokenIdByBikeId(string memory bikeId) external view returns (uint256) {
        uint256 stored = bikeIdToTokenId[bikeId];
        require(stored > 0, "Bike ID not found");
        return stored - 1;
    }

    /**
     * @dev Get all available bikes
     * @return Array of token IDs for available bikes
     */
    function getAvailableBikes() external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory tempResult = new uint256[](totalSupply);
        uint256 availableCount = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && bikes[i].status == BikeStatus.Available) {
                tempResult[availableCount] = i;
                availableCount++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](availableCount);
        for (uint256 i = 0; i < availableCount; i++) {
            result[i] = tempResult[i];
        }
        
        return result;
    }

    /**
     * @dev Check if an address is authorized to update bike data
     * @param account Address to check
     * @return True if authorized
     */
    function isAuthorizedUpdater(address account) external view returns (bool) {
        return authorizedUpdaters[account];
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}