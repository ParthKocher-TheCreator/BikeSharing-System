import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Maintenance = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance Hub
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Maintenance Management Coming Soon
        </Typography>
        <Typography variant="body1">
          This will show available maintenance jobs and allow maintainers to claim and complete work.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Maintenance;