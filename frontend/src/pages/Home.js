import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  DirectionsBike,
  AccountBalance,
  Build,
  HowToVote,
  TrendingUp,
  Security,
  Public,
  EcoFriendly,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const { active } = useWeb3React();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <DirectionsBike sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Decentralized Bike Sharing',
      description: 'Rent bikes owned by the community, not corporations. Each bike is represented as an NFT with transparent ownership and history.',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'DAO Governance',
      description: 'Community members vote on platform decisions, fee structures, and fund allocation through transparent blockchain governance.',
    },
    {
      icon: <Build sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Maintenance Network',
      description: 'Decentralized maintenance system where local mechanics earn tokens for keeping bikes in perfect condition.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Earn While You Ride',
      description: 'Get rewarded with RIDE tokens for positive actions like parking in designated areas and reporting issues.',
    },
  ];

  const benefits = [
    {
      icon: <Security />,
      title: 'Transparent & Secure',
      description: 'All transactions and governance decisions are recorded on the blockchain for complete transparency.',
    },
    {
      icon: <Public />,
      title: 'Community Owned',
      description: 'The bike fleet is owned by token holders, creating a truly decentralized sharing economy.',
    },
    {
      icon: <EcoFriendly />,
      title: 'Environmentally Friendly',
      description: 'Reduce carbon footprint while earning rewards for sustainable transportation choices.',
    },
  ];

  const stats = [
    { label: 'Total Bikes', value: '1,234' },
    { label: 'Active Users', value: '5,678' },
    { label: 'Total Rides', value: '23,456' },
    { label: 'CO₂ Saved', value: '12.3 tons' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
        >
          Welcome to BikeDAO
        </Typography>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
        >
          The first decentralized bike-sharing platform powered by Web3 technology.
          Community-owned, transparently governed, and environmentally sustainable.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {active ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/map')}
                startIcon={<DirectionsBike />}
                sx={{ px: 4, py: 1.5 }}
              >
                Find a Bike
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/governance')}
                startIcon={<HowToVote />}
                sx={{ px: 4, py: 1.5 }}
              >
                Join Governance
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Connect your wallet to get started
              </Typography>
              <Chip
                label="Connect Wallet Required"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '1rem', px: 2, py: 1 }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Stats Section */}
      <Paper sx={{ p: 3, mb: 6, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Features Section */}
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        Platform Features
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Benefits Section */}
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        Why Choose BikeDAO?
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                  color: theme.palette.primary.main,
                }}
              >
                {React.cloneElement(benefit.icon, { sx: { fontSize: 48 } })}
              </Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {benefit.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {benefit.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* CTA Section */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Ready to join the future of bike sharing?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Connect your wallet and start earning rewards while contributing to a sustainable transportation network.
        </Typography>
        {!active && (
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: 'white',
              color: theme.palette.primary.main,
              '&:hover': { backgroundColor: '#f5f5f5' },
              px: 4,
              py: 1.5,
            }}
          >
            Get Started
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default Home;