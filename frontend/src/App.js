import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AddAccount from './pages/AddAccount';
import UsersManagement from './pages/UsersManagement';
import ActivityHistory from './pages/ActivityHistory';

// Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ClientsProvider } from './context/ClientsContext';
import { TeamProvider } from './context/TeamContext';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A58BF',
      light: '#3A7FD9',
      dark: '#041340',
    },
    secondary: {
      main: '#5505A6',
      light: '#7B3FD1',
      dark: '#290773',
    },
    background: {
      default: '#0f0f1e',
      paper: '#0f0f1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0c0',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#041A59',
      light: '#3A5A8B',
      dark: '#041340',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderRadius: 0,
        },
      },
    },
  },
});

// Private Route component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin Only Route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <ClientsProvider>
            <TeamProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/users-management" element={<UsersManagement />} />
                  <Route
                    path="/add-account"
                    element={
                      <AdminRoute>
                        <AddAccount />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <Box sx={{ display: 'flex' }}>
                          <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                          <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                          <Box
                            component="main"
                            sx={{
                              flexGrow: 1,
                              height: '100vh',
                              overflow: 'auto',
                              backgroundColor: '#0f0f1e',
                            }}
                          >
                            <Container 
                              maxWidth={false} 
                              sx={{ 
                                mt: 9, 
                                mb: 4,
                                px: { xs: 2, sm: 3, md: 4 },
                              }}
                            >
                              <Routes>
                                <Route path="/" element={<Navigate to="/overview" />} />
                                <Route path="/dashboard" element={<Navigate to="/overview" />} />
                                <Route path="/activity-history" element={<ActivityHistory />} />
                                <Route path="/social-media" element={<Dashboard />} />
                                <Route path="/website-seo" element={<Dashboard />} />
                                <Route path="/ads" element={<Dashboard />} />
                                <Route path="/email" element={<Dashboard />} />
                                <Route path="/responses" element={<Dashboard />} />
                                <Route path="/team" element={<Dashboard />} />
                                <Route path="/overview" element={<Dashboard />} />
                              </Routes>
                            </Container>
                          </Box>
                        </Box>
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Router>
            </TeamProvider>
          </ClientsProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;