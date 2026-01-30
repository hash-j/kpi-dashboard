import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import AddClientDialog from './AddClientDialog';
import AddTeamMemberDialog from './AddTeamMemberDialog';
import {
  Dashboard as DashboardIcon,
  SocialDistance as SocialMediaIcon,
  Language as WebsiteIcon,
  Campaign as AdsIcon,
  Email as EmailIcon,
  Reviews as ReviewsIcon,
  People as PeopleIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const Sidebar = ({ open, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState({});
  const [openAddClientDialog, setOpenAddClientDialog] = useState(false);
  const [openAddTeamMemberDialog, setOpenAddTeamMemberDialog] = useState(false);

  const mainMenuItems = [
    {
      text: 'Overview',
      icon: <DashboardIcon />,
      path: '/overview',
      badge: '5',
    },
    {
      text: 'Social Media',
      icon: <SocialMediaIcon />,
      path: '/social-media',
    },
    {
      text: 'Website / SEO',
      icon: <WebsiteIcon />,
      path: '/website-seo',
    },
    {
      text: 'ADS / Closings',
      icon: <AdsIcon />,
      path: '/ads',
      subItems: [
        { text: 'Facebook ADS', path: '/ads?platform=facebook' },
        { text: 'Google ADS', path: '/ads?platform=google' },
        { text: 'Go High Level', path: '/ads?platform=ghl' },
        { text: 'Closings', path: '/ads?platform=closings' },
      ],
    },
    {
      text: 'Email Marketing',
      icon: <EmailIcon />,
      path: '/email',
    },
    {
      text: 'Client Responses',
      icon: <ReviewsIcon />,
      path: '/responses',
    },
    {
      text: 'Team',
      icon: <PeopleIcon />,
      path: '/team',
    },
  ];

  const handleMenuClick = (item) => {
    if (item.subItems) {
      setOpenSubMenu(prev => ({
        ...prev,
        [item.text]: !prev[item.text]
      }));
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSubItemClick = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 0,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 0,
          backgroundColor: '#0f0f1e',
          transition: 'width 0.3s',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        backgroundColor: '#0f0f1e',
      }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Logo from public folder */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.textContent = '🚀';
            }}
          />
        </Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          The Start Up Leads
        </Typography>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {mainMenuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleMenuClick(item)}
                  sx={{
                    py: 1.5,
                    px: 3,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(10, 88, 191, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive(item.path) ? 'bold' : 'normal',
                    }}
                  />
                  {item.badge && (
                    <Chip 
                      label={item.badge} 
                      size="small" 
                      color="primary"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                  {item.subItems && (
                    openSubMenu[item.text] ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
              
              {item.subItems && (
                <Collapse in={openSubMenu[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        onClick={() => handleSubItemClick(subItem.path)}
                        sx={{ 
                          pl: 8,
                          py: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(10, 88, 191, 0.08)',
                          },
                        }}
                      >
                        <ListItemText 
                          primary={subItem.text}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Add New Buttons */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <ListItemButton
          onClick={() => setOpenAddClientDialog(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Add New Client"
            primaryTypographyProps={{
              fontWeight: 'medium',
              fontSize: '0.9rem',
            }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={() => setOpenAddTeamMemberDialog(true)}
          sx={{
            backgroundColor: 'secondary.main',
            color: 'white',
            borderRadius: 2,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'secondary.dark',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Add New Team Member"
            primaryTypographyProps={{
              fontWeight: 'medium',
              fontSize: '0.9rem',
            }}
          />
        </ListItemButton>
      </Box>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={openAddClientDialog}
        onClose={() => setOpenAddClientDialog(false)}
        onClientAdded={() => {
          // Could trigger a refresh of clients here if needed
        }}
      />

      {/* Add Team Member Dialog */}
      <AddTeamMemberDialog
        open={openAddTeamMemberDialog}
        onClose={() => setOpenAddTeamMemberDialog(false)}
        onMemberAdded={() => {
          // Could trigger a refresh of team members here if needed
        }}
      />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="caption" color="text.secondary">
          v2.1.0 • Last updated: Today
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;