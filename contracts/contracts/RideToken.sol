// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RideToken
 * @dev Utility token for the bike-sharing platform
 * Used for paying rides and earning rewards
 */
contract RideToken is ERC20, ERC20Permit, Ownable {
    // Maximum supply of tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Minting roles
    mapping(address => bool) public minters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        address initialOwner
    ) ERC20("Ride Token", "RIDE") ERC20Permit("Ride Token") Ownable(initialOwner) {
        // Mint initial supply to owner for distribution
        _mint(initialOwner, 100_000_000 * 10**18); // 100 million initial supply
    }

    /**
     * @dev Add a minter role to an address
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter role from an address
     * @param minter Address to remove from minters
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific address (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    /**
     * @dev Check if an address is a minter
     * @param account Address to check
     * @return True if the address is a minter
     */
    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }
}