import { useState, useEffect, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { getContract, CONTRACT_ADDRESSES, handleContractError, waitForTransaction } from '../utils/web3';

// Contract ABIs - These would be imported from the compiled contracts
// For now, we'll define minimal ABIs for the main functions
const RIDE_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

const BIKE_NFT_ABI = [
  'function getAvailableBikes() view returns (uint256[])',
  'function getBikeData(uint256 tokenId) view returns (tuple(string bikeId, string model, string make, uint256 purchaseDate, uint8 status, int256 latitude, int256 longitude, string maintenanceHash, uint256 totalRides, uint256 totalDistance))',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'event BikeAdded(uint256 indexed tokenId, string bikeId, address indexed owner)',
  'event BikeStatusUpdated(uint256 indexed tokenId, uint8 oldStatus, uint8 newStatus)',
];

const BIKE_SHARING_ABI = [
  'function getUserDeposit(address user) view returns (uint256)',
  'function getUserActiveRide(address user) view returns (uint256)',
  'function getRideDetails(uint256 rideId) view returns (tuple(uint256 bikeTokenId, address rider, uint256 startTime, uint256 endTime, uint256 depositAmount, uint256 finalCost, bool active, bool ended))',
  'function makeDeposit(uint256 amount)',
  'function withdrawDeposit(uint256 amount)',
  'function startRide(uint256 bikeTokenId) returns (uint256)',
  'function endRide(uint256 rideId, int256 finalLatitude, int256 finalLongitude, uint256 distance)',
  'function reportIssue(uint256 bikeTokenId, string description)',
  'event RideStarted(uint256 indexed rideId, uint256 indexed bikeTokenId, address indexed rider, uint256 startTime)',
  'event RideEnded(uint256 indexed rideId, uint256 endTime, uint256 finalCost, uint256 refund)',
];

const MAINTENANCE_MANAGER_ABI = [
  'function getAvailableJobs() view returns (uint256[])',
  'function getMaintenanceJob(uint256 jobId) view returns (tuple(uint256 bikeTokenId, address reporter, address assignedMaintainer, address validator, string description, string proofHash, uint256 stakeAmount, uint256 rewardAmount, uint256 createdAt, uint256 completedAt, uint256 validatedAt, uint8 status))',
  'function getMaintainerJobs(address maintainer) view returns (uint256[])',
  'function claimMaintenanceJob(uint256 jobId)',
  'function submitMaintenanceProof(uint256 jobId, string proofHash)',
  'function validateMaintenance(uint256 jobId, bool approved)',
  'event MaintenanceReported(uint256 indexed jobId, uint256 indexed bikeTokenId, address indexed reporter, string description)',
];

const BIKE_DAO_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function delegate(address delegatee)',
  'function getVotes(address account) view returns (uint256)',
  'function getPastVotes(address account, uint256 blockNumber) view returns (uint256)',
];

export const useContracts = () => {
  const { library, account, chainId } = useWeb3React();
  const [contracts, setContracts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContracts = async () => {
      if (!library || !account) {
        setContracts({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const rideToken = getContract(CONTRACT_ADDRESSES.RideToken, RIDE_TOKEN_ABI, library);
        const bikeNFT = getContract(CONTRACT_ADDRESSES.BikeNFT, BIKE_NFT_ABI, library);
        const bikeSharing = getContract(CONTRACT_ADDRESSES.BikeSharing, BIKE_SHARING_ABI, library);
        const maintenanceManager = getContract(CONTRACT_ADDRESSES.MaintenanceManager, MAINTENANCE_MANAGER_ABI, library);
        const bikeDAOToken = getContract(CONTRACT_ADDRESSES.BikeDAOToken, BIKE_DAO_TOKEN_ABI, library);

        setContracts({
          rideToken,
          bikeNFT,
          bikeSharing,
          maintenanceManager,
          bikeDAOToken,
        });
      } catch (err) {
        console.error('Failed to initialize contracts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initContracts();
  }, [library, account, chainId]);

  return { contracts, loading, error };
};

export const useRideToken = () => {
  const { contracts } = useContracts();
  const { account, library } = useWeb3React();
  const [balance, setBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!contracts.rideToken || !account) return;
    
    try {
      const balance = await contracts.rideToken.balanceOf(account);
      setBalance(balance.toString());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [contracts.rideToken, account]);

  const checkAllowance = useCallback(async (spender) => {
    if (!contracts.rideToken || !account || !spender) return;
    
    try {
      const allowance = await contracts.rideToken.allowance(account, spender);
      setAllowance(allowance.toString());
      return allowance.toString();
    } catch (error) {
      console.error('Failed to check allowance:', error);
      return '0';
    }
  }, [contracts.rideToken, account]);

  const approve = useCallback(async (spender, amount) => {
    if (!contracts.rideToken) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contracts.rideToken.approve(spender, amount);
      await waitForTransaction(library, tx.hash);
      await checkAllowance(spender);
      return tx.hash;
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.rideToken, library, checkAllowance]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return {
    balance,
    allowance,
    loading,
    refreshBalance,
    checkAllowance,
    approve,
  };
};

export const useBikeSharing = () => {
  const { contracts } = useContracts();
  const { account, library } = useWeb3React();
  const [userDeposit, setUserDeposit] = useState('0');
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshUserData = useCallback(async () => {
    if (!contracts.bikeSharing || !account) return;
    
    try {
      const [deposit, rideId] = await Promise.all([
        contracts.bikeSharing.getUserDeposit(account),
        contracts.bikeSharing.getUserActiveRide(account)
      ]);
      
      setUserDeposit(deposit.toString());
      
      if (rideId.gt(0)) {
        const rideDetails = await contracts.bikeSharing.getRideDetails(rideId);
        setActiveRide({
          id: rideId.toString(),
          ...rideDetails
        });
      } else {
        setActiveRide(null);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [contracts.bikeSharing, account]);

  const makeDeposit = useCallback(async (amount) => {
    if (!contracts.bikeSharing) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contracts.bikeSharing.makeDeposit(amount);
      await waitForTransaction(library, tx.hash);
      await refreshUserData();
      return tx.hash;
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.bikeSharing, library, refreshUserData]);

  const startRide = useCallback(async (bikeTokenId) => {
    if (!contracts.bikeSharing) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contracts.bikeSharing.startRide(bikeTokenId);
      const receipt = await waitForTransaction(library, tx.hash);
      await refreshUserData();
      
      // Extract ride ID from events
      const event = receipt.events?.find(e => e.event === 'RideStarted');
      const rideId = event?.args?.rideId?.toString();
      
      return { hash: tx.hash, rideId };
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.bikeSharing, library, refreshUserData]);

  const endRide = useCallback(async (rideId, latitude, longitude, distance) => {
    if (!contracts.bikeSharing) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      // Convert coordinates to scaled integers (multiply by 1e6)
      const scaledLat = Math.round(latitude * 1e6);
      const scaledLng = Math.round(longitude * 1e6);
      
      const tx = await contracts.bikeSharing.endRide(rideId, scaledLat, scaledLng, distance);
      await waitForTransaction(library, tx.hash);
      await refreshUserData();
      return tx.hash;
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.bikeSharing, library, refreshUserData]);

  const reportIssue = useCallback(async (bikeTokenId, description) => {
    if (!contracts.bikeSharing) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contracts.bikeSharing.reportIssue(bikeTokenId, description);
      await waitForTransaction(library, tx.hash);
      return tx.hash;
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.bikeSharing, library]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  return {
    userDeposit,
    activeRide,
    loading,
    refreshUserData,
    makeDeposit,
    startRide,
    endRide,
    reportIssue,
  };
};

export const useBikes = () => {
  const { contracts } = useContracts();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshBikes = useCallback(async () => {
    if (!contracts.bikeNFT) return;
    
    setLoading(true);
    try {
      const availableBikeIds = await contracts.bikeNFT.getAvailableBikes();
      
      const bikeDetails = await Promise.all(
        availableBikeIds.map(async (tokenId) => {
          const data = await contracts.bikeNFT.getBikeData(tokenId);
          return {
            tokenId: tokenId.toString(),
            bikeId: data.bikeId,
            model: data.model,
            make: data.make,
            status: data.status,
            latitude: data.latitude.toNumber() / 1e6,
            longitude: data.longitude.toNumber() / 1e6,
            totalRides: data.totalRides.toString(),
            totalDistance: data.totalDistance.toString(),
          };
        })
      );
      
      setBikes(bikeDetails);
    } catch (error) {
      console.error('Failed to refresh bikes:', error);
    } finally {
      setLoading(false);
    }
  }, [contracts.bikeNFT]);

  useEffect(() => {
    refreshBikes();
  }, [refreshBikes]);

  return {
    bikes,
    loading,
    refreshBikes,
  };
};

export const useMaintenance = () => {
  const { contracts } = useContracts();
  const { account, library } = useWeb3React();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshJobs = useCallback(async () => {
    if (!contracts.maintenanceManager) return;
    
    setLoading(true);
    try {
      const [availableJobIds, myJobIds] = await Promise.all([
        contracts.maintenanceManager.getAvailableJobs(),
        account ? contracts.maintenanceManager.getMaintainerJobs(account) : []
      ]);
      
      const [availableJobDetails, myJobDetails] = await Promise.all([
        Promise.all(availableJobIds.map(async (jobId) => {
          const job = await contracts.maintenanceManager.getMaintenanceJob(jobId);
          return { id: jobId.toString(), ...job };
        })),
        Promise.all(myJobIds.map(async (jobId) => {
          const job = await contracts.maintenanceManager.getMaintenanceJob(jobId);
          return { id: jobId.toString(), ...job };
        }))
      ]);
      
      setAvailableJobs(availableJobDetails);
      setMyJobs(myJobDetails);
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [contracts.maintenanceManager, account]);

  const claimJob = useCallback(async (jobId) => {
    if (!contracts.maintenanceManager) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contracts.maintenanceManager.claimMaintenanceJob(jobId);
      await waitForTransaction(library, tx.hash);
      await refreshJobs();
      return tx.hash;
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.maintenanceManager, library, refreshJobs]);

  const submitProof = useCallback(async (jobId, proofHash) => {
    if (!contracts.maintenanceManager) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contracts.maintenanceManager.submitMaintenanceProof(jobId, proofHash);
      await waitForTransaction(library, tx.hash);
      await refreshJobs();
      return tx.hash;
    } catch (error) {
      throw new Error(handleContractError(error));
    } finally {
      setLoading(false);
    }
  }, [contracts.maintenanceManager, library, refreshJobs]);

  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  return {
    availableJobs,
    myJobs,
    loading,
    refreshJobs,
    claimJob,
    submitProof,
  };
};