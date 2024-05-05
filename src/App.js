import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Container
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import Users from './components/Users';
import Login from './components/Login';  // Make sure to create this component

// Dummy component for the home page
const HomePage = () => (
  <Container maxWidth="md" sx={{ padding: 4, textAlign: 'center', marginTop: 6 }}>
    <Typography variant="h3" gutterBottom color="primary">
      Welcome to the Admin Panel
    </Typography>
    <Typography variant="body1">
      Use the navigation bar to explore different sections.
    </Typography>
  </Container>
);

function App() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);  // Check if user is authenticated

  // Navigation bar links
  const navLinks = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'Users', path: '/users', icon: <PeopleIcon /> }
  ];

  // Create a custom theme with additional styling
  const theme = createTheme({
    palette: {
      primary: {
        main: '#0d47a1', // Deep blue
      },
      secondary: {
        main: '#f57c00', // Bright orange
      },
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundColor: '#0d47a1',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* Navigation Bar */}
        <AppBar position="static" color="primary">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>
            <Box>
              {navLinks.map((link) => (
                <IconButton
                  key={link.title}
                  color="inherit"
                  component={Link}
                  to={link.path}
                  sx={{ marginLeft: 2 }}
                >
                  {link.icon}
                </IconButton>
              ))}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
