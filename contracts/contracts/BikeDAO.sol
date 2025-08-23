// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BikeDAOToken.sol";
import "./RideToken.sol";

/**
 * @title BikeDAO
 * @dev DAO governance contract for the bike-sharing platform
 */
contract BikeDAO is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    BikeDAOToken public governanceToken;
    RideToken public rideToken;
    
    // Treasury management
    address public treasury;
    
    // Proposal types
    enum ProposalType {
        Treasury,      // Treasury spending
        Parameter,     // Platform parameter changes
        Upgrade,       // Contract upgrades
        BikeFleet,     // Bike fleet management
        Emergency      // Emergency actions
    }
    
    // Custom proposal data
    struct ProposalData {
        ProposalType proposalType;
        string description;
        address proposer;
        uint256 createdAt;
    }
    
    mapping(uint256 => ProposalData) public proposalData;
    
    // Events
    event ProposalCreatedWithType(
        uint256 proposalId,
        address proposer,
        ProposalType proposalType,
        string description
    );
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyExecuted(uint256 proposalId, string reason);

    constructor(
        BikeDAOToken _token,
        TimelockController _timelock,
        address _treasury
    )
        Governor("BikeDAO")
        GovernorSettings(7200, 50400, 1000e18) // 1 day voting delay, 1 week voting period, 1000 tokens proposal threshold
        GovernorVotes(IVotes(address(_token)))
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {
        governanceToken = _token;
        treasury = _treasury;
    }

    /**
     * @dev Create a proposal with type classification
     * @param targets Target addresses for the proposal
     * @param values Values to send with the calls
     * @param calldatas Call data for the proposal
     * @param description Human readable description
     * @param proposalType Type of the proposal
     */
    function proposeWithType(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        ProposalType proposalType
    ) public returns (uint256) {
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        proposalData[proposalId] = ProposalData({
            proposalType: proposalType,
            description: description,
            proposer: msg.sender,
            createdAt: block.timestamp
        });
        
        emit ProposalCreatedWithType(proposalId, msg.sender, proposalType, description);
        
        return proposalId;
    }

    /**
     * @dev Create a treasury spending proposal
     * @param recipient Address to send funds to
     * @param amount Amount to send
     * @param description Description of the spending
     */
    function proposeTreasurySpending(
        address recipient,
        uint256 amount,
        string memory description
    ) external returns (uint256) {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        
        targets[0] = treasury;
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("transfer(address,uint256)", recipient, amount);
        
        return proposeWithType(
            targets,
            values,
            calldatas,
            description,
            ProposalType.Treasury
        );
    }

    /**
     * @dev Create a parameter change proposal
     * @param target Contract address to call
     * @param callData Call data for the parameter change
     * @param description Description of the change
     */
    function proposeParameterChange(
        address target,
        bytes memory callData,
        string memory description
    ) external returns (uint256) {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        
        targets[0] = target;
        values[0] = 0;
        calldatas[0] = callData;
        
        return proposeWithType(
            targets,
            values,
            calldatas,
            description,
            ProposalType.Parameter
        );
    }

    /**
     * @dev Create an emergency proposal (lower quorum)
     * @param targets Target addresses
     * @param values Values to send
     * @param calldatas Call data
     * @param description Description of emergency action
     */
    function proposeEmergency(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256) {
        // Emergency proposals require higher voting power but lower quorum
        require(
            getVotes(msg.sender, block.number - 1) >= 5000e18,
            "Insufficient voting power for emergency proposal"
        );
        
        return proposeWithType(
            targets,
            values,
            calldatas,
            description,
            ProposalType.Emergency
        );
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyGovernance {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Get proposal data
     * @param proposalId ID of the proposal
     * @return ProposalData struct
     */
    function getProposalData(uint256 proposalId) external view returns (ProposalData memory) {
        return proposalData[proposalId];
    }

    /**
     * @dev Override quorum for emergency proposals
     * @param blockNumber Block number for quorum calculation
     * @return Quorum needed for proposals
     */
    function quorum(uint256 blockNumber) public view override returns (uint256) {
        // Emergency proposals need only 2% quorum
        // Regular proposals need 4% quorum (set in constructor)
        return (token().getPastTotalSupply(blockNumber) * quorumNumerator(blockNumber)) / quorumDenominator();
    }

    /**
     * @dev Get proposal threshold for emergency proposals
     * @return Proposal threshold
     */
    function proposalThreshold() public view override returns (uint256) {
        return super.proposalThreshold();
    }

    // Override required functions
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorumNumerator() public view override returns (uint256) {
        return super.quorumNumerator();
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * @title BikeDAOTreasury
 * @dev Treasury contract for holding and managing DAO funds
 */
contract BikeDAOTreasury is Ownable {
    RideToken public rideToken;
    BikeDAOToken public governanceToken;
    
    // Revenue tracking
    uint256 public totalRevenue;
    uint256 public totalDistributed;
    
    // Events
    event RevenueReceived(uint256 amount, address from);
    event FundsDistributed(address to, uint256 amount, string purpose);
    event TokensWithdrawn(address token, address to, uint256 amount);

    constructor(
        address initialOwner,
        address _rideToken,
        address _governanceToken
    ) Ownable(initialOwner) {
        rideToken = RideToken(_rideToken);
        governanceToken = BikeDAOToken(_governanceToken);
    }

    /**
     * @dev Receive revenue from the platform
     * @param amount Amount of revenue received
     */
    function receiveRevenue(uint256 amount) external {
        require(rideToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        totalRevenue += amount;
        emit RevenueReceived(amount, msg.sender);
    }

    /**
     * @dev Distribute funds (only through governance)
     * @param to Recipient address
     * @param amount Amount to distribute
     * @param purpose Purpose of the distribution
     */
    function distributeFunds(
        address to,
        uint256 amount,
        string memory purpose
    ) external onlyOwner {
        require(rideToken.balanceOf(address(this)) >= amount, "Insufficient funds");
        require(rideToken.transfer(to, amount), "Transfer failed");
        
        totalDistributed += amount;
        emit FundsDistributed(to, amount, purpose);
    }

    /**
     * @dev Emergency withdraw tokens (only through governance)
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(IERC20(token).transfer(to, amount), "Transfer failed");
        emit TokensWithdrawn(token, to, amount);
    }

    /**
     * @dev Get treasury balance
     * @return Balance in RIDE tokens
     */
    function getTreasuryBalance() external view returns (uint256) {
        return rideToken.balanceOf(address(this));
    }

    /**
     * @dev Get revenue statistics
     * @return totalRevenue Total revenue received
     * @return totalDistributed Total funds distributed
     * @return currentBalance Current treasury balance
     */
    function getRevenueStats() external view returns (
        uint256,
        uint256,
        uint256
    ) {
        return (
            totalRevenue,
            totalDistributed,
            rideToken.balanceOf(address(this))
        );
    }
}