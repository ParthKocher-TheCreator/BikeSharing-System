import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { loadContractAddresses } from './utils/web3';

// Components
import Navbar from './components/Navbar';
import WalletConnection from './components/WalletConnection';
import LeatherWalletConnection from './components/LeatherWalletConnection';

// Pages
import Home from './pages/Home';
import Map from './pages/Map';
import Maintenance from './pages/Maintenance';
import Governance from './pages/Governance';
import Profile from './pages/Profile';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Web3 provider function
function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  useEffect(() => {
    // Load contract addresses on app start
    loadContractAddresses().catch(console.error);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <div className="App">
            <Navbar />
            {/* Ethereum/Polygon wallet connection */}
            <WalletConnection />
            {/* Stacks/Bitcoin wallet connection */}
            <LeatherWalletConnection />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </Web3ReactProvider>
    </ThemeProvider>
  );
}

export default App;