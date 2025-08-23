import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import {
  DirectionsBike,
  Menu as MenuIcon,
  AccountBalanceWallet,
  Map as MapIcon,
  Build as BuildIcon,
  HowToVote as VoteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { formatAddress, getNetworkName } from '../utils/web3';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account, chainId } = useWeb3React();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const navigationItems = [
    { label: 'Home', path: '/', icon: <DirectionsBike /> },
    { label: 'Map', path: '/map', icon: <MapIcon /> },
    { label: 'Maintenance', path: '/maintenance', icon: <BuildIcon /> },
    { label: 'Governance', path: '/governance', icon: <VoteIcon /> },
    { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <DirectionsBike sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          BikeDAO
        </Typography>

        {/* Network Info */}
        {chainId && (
          <Chip
            label={getNetworkName(chainId)}
            size="small"
            color="secondary"
            sx={{ mr: 2 }}
          />
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Account Info */}
        {account && (
          <Chip
            icon={<AccountBalanceWallet />}
            label={formatAddress(account)}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'white',
              ml: 2,
            }}
          />
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive(item.path)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    {item.label}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;