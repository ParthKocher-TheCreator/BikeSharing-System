const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy RideToken
    console.log("\n--- Deploying RideToken ---");
    const RideToken = await ethers.getContractFactory("RideToken");
    const rideToken = await RideToken.deploy(deployer.address);
    await rideToken.deployed();
    console.log("RideToken deployed to:", rideToken.address);

    // Deploy BikeDAOToken
    console.log("\n--- Deploying BikeDAOToken ---");
    const BikeDAOToken = await ethers.getContractFactory("BikeDAOToken");
    const bikeDAOToken = await BikeDAOToken.deploy(deployer.address);
    await bikeDAOToken.deployed();
    console.log("BikeDAOToken deployed to:", bikeDAOToken.address);

    // Deploy BikeNFT
    console.log("\n--- Deploying BikeNFT ---");
    const BikeNFT = await ethers.getContractFactory("BikeNFT");
    const bikeNFT = await BikeNFT.deploy(deployer.address);
    await bikeNFT.deployed();
    console.log("BikeNFT deployed to:", bikeNFT.address);

    // Deploy TimelockController for DAO
    console.log("\n--- Deploying TimelockController ---");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const minDelay = 86400; // 1 day
    const proposers = []; // Will be set to DAO after deployment
    const executors = [ethers.constants.AddressZero]; // Anyone can execute
    const admin = deployer.address; // Temporary admin
    
    const timelock = await TimelockController.deploy(
        minDelay,
        proposers,
        executors,
        admin
    );
    await timelock.deployed();
    console.log("TimelockController deployed to:", timelock.address);

    // Deploy BikeDAOTreasury
    console.log("\n--- Deploying BikeDAOTreasury ---");
    const BikeDAOTreasury = await ethers.getContractFactory("BikeDAOTreasury");
    const treasury = await BikeDAOTreasury.deploy(
        timelock.address, // Timelock will be the owner
        rideToken.address,
        bikeDAOToken.address
    );
    await treasury.deployed();
    console.log("BikeDAOTreasury deployed to:", treasury.address);

    // Deploy BikeDAO
    console.log("\n--- Deploying BikeDAO ---");
    const BikeDAO = await ethers.getContractFactory("BikeDAO");
    const bikeDAO = await BikeDAO.deploy(
        bikeDAOToken.address,
        timelock.address,
        treasury.address
    );
    await bikeDAO.deployed();
    console.log("BikeDAO deployed to:", bikeDAO.address);

    // Deploy BikeSharing
    console.log("\n--- Deploying BikeSharing ---");
    const BikeSharing = await ethers.getContractFactory("BikeSharing");
    const bikeSharing = await BikeSharing.deploy(
        deployer.address, // Initial owner
        bikeNFT.address,
        rideToken.address,
        treasury.address,
        deployer.address // Oracle service (temporary)
    );
    await bikeSharing.deployed();
    console.log("BikeSharing deployed to:", bikeSharing.address);

    // Deploy MaintenanceManager
    console.log("\n--- Deploying MaintenanceManager ---");
    const MaintenanceManager = await ethers.getContractFactory("MaintenanceManager");
    const maintenanceManager = await MaintenanceManager.deploy(
        deployer.address, // Initial owner
        bikeNFT.address,
        rideToken.address
    );
    await maintenanceManager.deployed();
    console.log("MaintenanceManager deployed to:", maintenanceManager.address);

    // Setup permissions and roles
    console.log("\n--- Setting up permissions ---");
    
    // Grant minter role to BikeSharing and MaintenanceManager
    await rideToken.addMinter(bikeSharing.address);
    await rideToken.addMinter(maintenanceManager.address);
    console.log("Granted minter roles to BikeSharing and MaintenanceManager");

    // Add BikeSharing and MaintenanceManager as authorized updaters for BikeNFT
    await bikeNFT.addAuthorizedUpdater(bikeSharing.address);
    await bikeNFT.addAuthorizedUpdater(maintenanceManager.address);
    console.log("Added authorized updaters to BikeNFT");

    // Setup timelock permissions
    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const timelockAdminRole = await timelock.TIMELOCK_ADMIN_ROLE();

    // Grant proposer role to DAO
    await timelock.grantRole(proposerRole, bikeDAO.address);
    
    // Grant executor role to DAO (and keep zero address for public execution)
    await timelock.grantRole(executorRole, bikeDAO.address);
    
    // Revoke admin role from deployer (DAO will be admin through timelock)
    await timelock.revokeRole(timelockAdminRole, deployer.address);
    
    console.log("Timelock permissions configured");

    // Delegate votes to enable governance
    console.log("\n--- Setting up governance ---");
    await bikeDAOToken.delegate(deployer.address);
    console.log("Delegated governance votes");

    // Mint some initial tokens for testing
    console.log("\n--- Minting initial tokens ---");
    const initialRideAmount = ethers.utils.parseEther("10000"); // 10k RIDE
    const initialDAOAmount = ethers.utils.parseEther("1000"); // 1k DAO tokens
    
    await rideToken.mint(deployer.address, initialRideAmount);
    await bikeDAOToken.mint(deployer.address, initialDAOAmount);
    
    console.log("Minted initial tokens");

    // Create a sample bike NFT
    console.log("\n--- Creating sample bike NFT ---");
    const bikeId = "BIKE-001";
    const model = "City Cruiser";
    const make = "BikeShare Co";
    const tokenURI = "https://ipfs.io/ipfs/QmSampleBikeMetadata";
    
    await bikeNFT.mintBike(deployer.address, bikeId, model, make, tokenURI);
    console.log("Created sample bike NFT");

    // Output contract addresses for frontend integration
    console.log("\n=== DEPLOYMENT SUMMARY ===");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    console.log("\nContract Addresses:");
    console.log("RideToken:", rideToken.address);
    console.log("BikeDAOToken:", bikeDAOToken.address);
    console.log("BikeNFT:", bikeNFT.address);
    console.log("TimelockController:", timelock.address);
    console.log("BikeDAOTreasury:", treasury.address);
    console.log("BikeDAO:", bikeDAO.address);
    console.log("BikeSharing:", bikeSharing.address);
    console.log("MaintenanceManager:", maintenanceManager.address);

    // Save addresses to file for frontend
    const addresses = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        deployer: deployer.address,
        contracts: {
            RideToken: rideToken.address,
            BikeDAOToken: bikeDAOToken.address,
            BikeNFT: bikeNFT.address,
            TimelockController: timelock.address,
            BikeDAOTreasury: treasury.address,
            BikeDAO: bikeDAO.address,
            BikeSharing: bikeSharing.address,
            MaintenanceManager: maintenanceManager.address
        }
    };

    const fs = require('fs');
    fs.writeFileSync(
        './deployed-addresses.json',
        JSON.stringify(addresses, null, 2)
    );
    
    console.log("\nAddresses saved to deployed-addresses.json");
    console.log("Deployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });