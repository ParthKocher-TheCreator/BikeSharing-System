// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./BikeNFT.sol";
import "./RideToken.sol";

/**
 * @title MaintenanceManager
 * @dev Contract for managing bike maintenance workflow
 */
contract MaintenanceManager is Ownable, ReentrancyGuard {
    BikeNFT public bikeNFT;
    RideToken public rideToken;
    
    // Maintenance job structure
    struct MaintenanceJob {
        uint256 bikeTokenId;
        address reporter;
        address assignedMaintainer;
        address validator;
        string description;
        string proofHash; // IPFS hash of repair proof
        uint256 stakeAmount;
        uint256 rewardAmount;
        uint256 createdAt;
        uint256 completedAt;
        uint256 validatedAt;
        MaintenanceStatus status;
    }
    
    enum MaintenanceStatus {
        Reported,
        Assigned,
        Completed,
        Validated,
        Rejected
    }
    
    // Configuration
    uint256 public maintainerStake = 5 * 10**18; // 5 RIDE tokens
    uint256 public baseReward = 20 * 10**18; // 20 RIDE tokens
    uint256 public validatorReward = 2 * 10**18; // 2 RIDE tokens
    uint256 public reporterReward = 5 * 10**18; // 5 RIDE tokens
    
    // Mappings
    mapping(uint256 => MaintenanceJob) public maintenanceJobs;
    mapping(uint256 => uint256) public bikeToJobId; // bike token ID => job ID
    mapping(address => bool) public authorizedValidators;
    mapping(address => uint256) public maintainerStakes; // staked amounts
    
    // Counters
    uint256 private jobCounter;
    
    // Events
    event MaintenanceReported(uint256 indexed jobId, uint256 indexed bikeTokenId, address indexed reporter, string description);
    event MaintenanceAssigned(uint256 indexed jobId, address indexed maintainer, uint256 stakeAmount);
    event MaintenanceCompleted(uint256 indexed jobId, string proofHash);
    event MaintenanceValidated(uint256 indexed jobId, address indexed validator, bool approved);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event RewardPaid(address indexed recipient, uint256 amount, string rewardType);

    constructor(
        address initialOwner,
        address _bikeNFT,
        address _rideToken
    ) Ownable(initialOwner) {
        bikeNFT = BikeNFT(_bikeNFT);
        rideToken = RideToken(_rideToken);
    }

    /**
     * @dev Add an authorized validator
     * @param validator Address to authorize as validator
     */
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        authorizedValidators[validator] = true;
        emit ValidatorAdded(validator);
    }

    /**
     * @dev Remove an authorized validator
     * @param validator Address to remove authorization from
     */
    function removeValidator(address validator) external onlyOwner {
        authorizedValidators[validator] = false;
        emit ValidatorRemoved(validator);
    }

    /**
     * @dev Report a maintenance issue
     * @param bikeTokenId Token ID of the bike needing maintenance
     * @param description Description of the issue
     */
    function reportMaintenance(uint256 bikeTokenId, string memory description) external returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bikeToJobId[bikeTokenId] == 0, "Bike already has pending maintenance");
        
        // Update bike status
        bikeNFT.updateBikeStatus(bikeTokenId, BikeNFT.BikeStatus.NeedsMaintenance);
        
        // Create maintenance job
        jobCounter++;
        uint256 jobId = jobCounter;
        
        maintenanceJobs[jobId] = MaintenanceJob({
            bikeTokenId: bikeTokenId,
            reporter: msg.sender,
            assignedMaintainer: address(0),
            validator: address(0),
            description: description,
            proofHash: "",
            stakeAmount: 0,
            rewardAmount: baseReward,
            createdAt: block.timestamp,
            completedAt: 0,
            validatedAt: 0,
            status: MaintenanceStatus.Reported
        });
        
        bikeToJobId[bikeTokenId] = jobId;
        
        emit MaintenanceReported(jobId, bikeTokenId, msg.sender, description);
        
        // Reward reporter
        rideToken.mint(msg.sender, reporterReward);
        emit RewardPaid(msg.sender, reporterReward, "reporter");
        
        return jobId;
    }

    /**
     * @dev Claim a maintenance job
     * @param jobId ID of the maintenance job to claim
     */
    function claimMaintenanceJob(uint256 jobId) external nonReentrant {
        MaintenanceJob storage job = maintenanceJobs[jobId];
        require(job.status == MaintenanceStatus.Reported, "Job not available");
        require(job.assignedMaintainer == address(0), "Job already assigned");
        
        // Transfer stake from maintainer
        require(rideToken.transferFrom(msg.sender, address(this), maintainerStake), "Stake transfer failed");
        
        // Assign job
        job.assignedMaintainer = msg.sender;
        job.stakeAmount = maintainerStake;
        job.status = MaintenanceStatus.Assigned;
        
        maintainerStakes[msg.sender] += maintainerStake;
        
        emit MaintenanceAssigned(jobId, msg.sender, maintainerStake);
    }

    /**
     * @dev Submit proof of completed maintenance
     * @param jobId ID of the maintenance job
     * @param proofHash IPFS hash of the proof (photos, description, etc.)
     */
    function submitMaintenanceProof(uint256 jobId, string memory proofHash) external {
        MaintenanceJob storage job = maintenanceJobs[jobId];
        require(job.assignedMaintainer == msg.sender, "Not assigned to this job");
        require(job.status == MaintenanceStatus.Assigned, "Job not in assigned state");
        require(bytes(proofHash).length > 0, "Proof hash cannot be empty");
        
        job.proofHash = proofHash;
        job.completedAt = block.timestamp;
        job.status = MaintenanceStatus.Completed;
        
        emit MaintenanceCompleted(jobId, proofHash);
    }

    /**
     * @dev Validate completed maintenance work
     * @param jobId ID of the maintenance job
     * @param approved Whether the work is approved
     */
    function validateMaintenance(uint256 jobId, bool approved) external nonReentrant {
        require(authorizedValidators[msg.sender], "Not authorized validator");
        
        MaintenanceJob storage job = maintenanceJobs[jobId];
        require(job.status == MaintenanceStatus.Completed, "Job not completed");
        require(job.validator == address(0), "Job already validated");
        
        job.validator = msg.sender;
        job.validatedAt = block.timestamp;
        
        if (approved) {
            job.status = MaintenanceStatus.Validated;
            
            // Pay maintainer reward + return stake
            uint256 totalPayout = job.rewardAmount + job.stakeAmount;
            maintainerStakes[job.assignedMaintainer] -= job.stakeAmount;
            
            rideToken.mint(address(this), job.rewardAmount); // Mint reward
            require(rideToken.transfer(job.assignedMaintainer, totalPayout), "Maintainer payment failed");
            
            // Pay validator reward
            rideToken.mint(msg.sender, validatorReward);
            emit RewardPaid(msg.sender, validatorReward, "validator");
            emit RewardPaid(job.assignedMaintainer, job.rewardAmount, "maintainer");
            
            // Update bike status back to available
            bikeNFT.updateBikeStatus(job.bikeTokenId, BikeNFT.BikeStatus.Available);
            
            // Clear bike to job mapping
            bikeToJobId[job.bikeTokenId] = 0;
            
        } else {
            job.status = MaintenanceStatus.Rejected;
            
            // Maintainer loses half of stake as penalty, other half returned
            uint256 penalty = job.stakeAmount / 2;
            uint256 refund = job.stakeAmount - penalty;
            
            maintainerStakes[job.assignedMaintainer] -= job.stakeAmount;
            
            if (refund > 0) {
                require(rideToken.transfer(job.assignedMaintainer, refund), "Refund failed");
            }
            
            // Reset job for re-assignment
            job.assignedMaintainer = address(0);
            job.stakeAmount = 0;
            job.status = MaintenanceStatus.Reported;
            job.completedAt = 0;
            job.proofHash = "";
            job.validator = address(0);
            job.validatedAt = 0;
        }
        
        emit MaintenanceValidated(jobId, msg.sender, approved);
    }

    /**
     * @dev Update maintenance stake amount (only owner)
     * @param newStake New stake amount
     */
    function updateMaintainerStake(uint256 newStake) external onlyOwner {
        maintainerStake = newStake;
    }

    /**
     * @dev Update base reward amount (only owner)
     * @param newReward New reward amount
     */
    function updateBaseReward(uint256 newReward) external onlyOwner {
        baseReward = newReward;
    }

    /**
     * @dev Update validator reward amount (only owner)
     * @param newReward New validator reward amount
     */
    function updateValidatorReward(uint256 newReward) external onlyOwner {
        validatorReward = newReward;
    }

    /**
     * @dev Update reporter reward amount (only owner)
     * @param newReward New reporter reward amount
     */
    function updateReporterReward(uint256 newReward) external onlyOwner {
        reporterReward = newReward;
    }

    /**
     * @dev Get maintenance job details
     * @param jobId ID of the maintenance job
     * @return MaintenanceJob struct
     */
    function getMaintenanceJob(uint256 jobId) external view returns (MaintenanceJob memory) {
        return maintenanceJobs[jobId];
    }

    /**
     * @dev Get all available maintenance jobs
     * @return Array of job IDs for available maintenance jobs
     */
    function getAvailableJobs() external view returns (uint256[] memory) {
        uint256[] memory tempResult = new uint256[](jobCounter);
        uint256 availableCount = 0;
        
        for (uint256 i = 1; i <= jobCounter; i++) {
            if (maintenanceJobs[i].status == MaintenanceStatus.Reported) {
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
     * @dev Get jobs assigned to a maintainer
     * @param maintainer Address of the maintainer
     * @return Array of job IDs
     */
    function getMaintainerJobs(address maintainer) external view returns (uint256[] memory) {
        uint256[] memory tempResult = new uint256[](jobCounter);
        uint256 jobCount = 0;
        
        for (uint256 i = 1; i <= jobCounter; i++) {
            if (maintenanceJobs[i].assignedMaintainer == maintainer && 
                (maintenanceJobs[i].status == MaintenanceStatus.Assigned || 
                 maintenanceJobs[i].status == MaintenanceStatus.Completed)) {
                tempResult[jobCount] = i;
                jobCount++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](jobCount);
        for (uint256 i = 0; i < jobCount; i++) {
            result[i] = tempResult[i];
        }
        
        return result;
    }

    /**
     * @dev Check if an address is an authorized validator
     * @param account Address to check
     * @return True if authorized
     */
    function isAuthorizedValidator(address account) external view returns (bool) {
        return authorizedValidators[account];
    }

    /**
     * @dev Get current job counter
     * @return Current job counter value
     */
    function getCurrentJobId() external view returns (uint256) {
        return jobCounter;
    }
}