import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import SocialMediaTab from '../components/tabs/SocialMediaTab';
import WebsiteSEOTab from '../components/tabs/WebsiteSEOTab';
import AdsTab from '../components/tabs/AdsTab';
import EmailMarketingTab from '../components/tabs/EmailMarketingTab';
import ClientResponsesTab from '../components/tabs/ClientResponsesTab';
import TeamTab from '../components/tabs/TeamTab';
import OverviewTab from '../components/tabs/OverviewTab';

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Determine active tab from URL
    const path = location.pathname;
    switch (path) {
      case '/overview':
        setActiveTab(0);
        break;
      case '/social-media':
        setActiveTab(1);
        break;
      case '/website-seo':
        setActiveTab(2);
        break;
      case '/ads':
        setActiveTab(3);
        break;
      case '/email':
        setActiveTab(4);
        break;
      case '/responses':
        setActiveTab(5);
        break;
      case '/team':
        setActiveTab(6);
        break;
      default:
        setActiveTab(0); // Overview as default
    }
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <OverviewTab />;
      case 1:
        return <SocialMediaTab />;
      case 2:
        return <WebsiteSEOTab />;
      case 3:
        return <AdsTab />;
      case 4:
        return <EmailMarketingTab />;
      case 5:
        return <ClientResponsesTab />;
      case 6:
        return <TeamTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f1e' }}>
      <Paper sx={{ mb: 3, px: 2, mt: '80px', bgcolor: '#0f0f1e', borderRadius: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Social Media" />
          <Tab label="Website / SEO" />
          <Tab label="ADS / Closings / GHL" />
          <Tab label="Email Marketing" />
          <Tab label="Client Responses" />
          <Tab label="Team" />
        </Tabs>
      </Paper>

      {renderTabContent()}
    </Box>
  );
};

export default Dashboard;