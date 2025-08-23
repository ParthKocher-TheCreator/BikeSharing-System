import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
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
} from '@mui/material';
import {
  AccountBalanceWallet,
  Close as CloseIcon,
} from '@mui/icons-material';
import { injected, walletconnect } from '../utils/web3';

const WalletConnection = () => {
  const { activate, deactivate, active, error } = useWeb3React();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState('');

  const connectors = [
    {
      name: 'MetaMask',
      connector: injected,
      icon: '🦊',
      description: 'Connect using browser wallet',
    },
    {
      name: 'WalletConnect',
      connector: walletconnect,
      icon: '📱',
      description: 'Connect using mobile wallet',
    },
  ];

  const handleConnect = async (connector, name) => {
    setConnecting(name);
    try {
      await activate(connector);
      setOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting('');
    }
  };

  const handleDisconnect = () => {
    deactivate();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setConnecting('');
  };

  if (active) {
    return (
      <Box sx={{ position: 'fixed', top: 80, right: 16, zIndex: 1000 }}>
        <Button
          variant="outlined"
          onClick={handleDisconnect}
          startIcon={<AccountBalanceWallet />}
          sx={{
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Disconnect
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ position: 'fixed', top: 80, right: 16, zIndex: 1000 }}>
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<AccountBalanceWallet />}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          Connect Wallet
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
          <Typography variant="h6">Connect Your Wallet</Typography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose your preferred wallet to connect to BikeDAO. Make sure you're on the correct network.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to connect: {error.message}
            </Alert>
          )}

          <List>
            {connectors.map((wallet) => (
              <ListItem key={wallet.name} disablePadding>
                <ListItemButton
                  onClick={() => handleConnect(wallet.connector, wallet.name)}
                  disabled={connecting === wallet.name}
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
                    {connecting === wallet.name ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography variant="h5">{wallet.icon}</Typography>
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={wallet.name}
                    secondary={wallet.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              New to Web3? Download <strong>MetaMask</strong> browser extension to get started.
            </Typography>
          </Alert>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnection;