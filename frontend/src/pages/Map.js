import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Map = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Bike Map
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Interactive Bike Map Coming Soon
        </Typography>
        <Typography variant="body1">
          This will show available bikes on an interactive map using React Leaflet.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Map;