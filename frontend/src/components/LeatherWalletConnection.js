import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Close as CloseIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { leatherWallet, formatAddress, formatSTXAmount, isLeatherInstalled } from '../utils/leather';

const LeatherWalletConnection = () => {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [stxBalance, setSTXBalance] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already connected
    if (leatherWallet.isSignedIn()) {
      setConnected(true);
      setUserAddress(leatherWallet.getAddress());
      loadBalance();
    }
  }, []);

  const loadBalance = async () => {
    try {
      const balance = await leatherWallet.getSTXBalance();
      setSTXBalance(balance);
    } catch (error) {
      console.error('Failed to load STX balance:', error);
    }
  };

  const handleConnect = async () => {
    if (!isLeatherInstalled()) {
      setError('Leather wallet is not installed. Please install it from https://leather.io/');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const userData = await leatherWallet.connect();
      setConnected(true);
      setUserAddress(leatherWallet.getAddress());
      setOpen(false);
      await loadBalance();
    } catch (error) {
      console.error('Failed to connect to Leather wallet:', error);
      setError(error.message || 'Failed to connect to Leather wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    leatherWallet.disconnect();
    setConnected(false);
    setUserAddress('');
    setSTXBalance('0');
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setConnecting(false);
    setError('');
  };

  if (connected) {
    return (
      <Box sx={{ position: 'fixed', top: 140, right: 16, zIndex: 1000 }}>
        <Card sx={{ minWidth: 250 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle2" color="primary.main">
                Leather Wallet
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Address:</strong> {formatAddress(userAddress)}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>STX Balance:</strong> {formatSTXAmount(stxBalance)} STX
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleDisconnect}
              fullWidth
            >
              Disconnect
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ position: 'fixed', top: 140, right: 16, zIndex: 1000 }}>
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<AccountBalanceWallet />}
          sx={{
            backgroundColor: '#ff6b35', // Leather brand color
            '&:hover': {
              backgroundColor: '#e55a2b',
            },
          }}
        >
          Connect Leather
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Connect Leather Wallet</Typography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your Leather wallet to interact with BikeDAO on the Stacks blockchain.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!isLeatherInstalled() ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Leather wallet is not detected. Please install Leather wallet from{' '}
                <a href="https://leather.io/" target="_blank" rel="noopener noreferrer">
                  leather.io
                </a>
              </Typography>
            </Alert>
          ) : (
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleConnect}
                  disabled={connecting}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemIcon>
                    {connecting ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Box
                        component="img"
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgOEwxMiAxNEwyIDhMMTIgMloiIGZpbGw9IiNmZjZiMzUiLz4KPHBhdGggZD0iTTIgOEwxMiAxNEwyMiA4TDEyIDIyTDIgOFoiIGZpbGw9IiNmZjZiMzUiIG9wYWNpdHk9IjAuNyIvPgo8L3N2Zz4K"
                        alt="Leather"
                        sx={{ width: 24, height: 24 }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Leather Wallet"
                    secondary="Connect to Stacks blockchain"
                  />
                  {isLeatherInstalled() && (
                    <Chip
                      label="Detected"
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </List>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Leather wallet connects to the Stacks blockchain. 
              This is different from Ethereum-based wallets like MetaMask.
            </Typography>
          </Alert>

          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>What is Leather Wallet?</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Leather is a wallet for Bitcoin and Stacks. It allows you to manage STX tokens, 
              interact with Stacks smart contracts, and send/receive Bitcoin.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeatherWalletConnection;