import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Profile Dashboard Coming Soon
        </Typography>
        <Typography variant="body1">
          This will show user statistics, token balances, ride history, and account settings.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Profile;