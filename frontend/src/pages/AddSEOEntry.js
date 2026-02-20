import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';
import { formatDateOnly } from '../utils/dateFormatter';
import { AuthContext } from '../context/AuthContext';

const AddSEOEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const editingItem = location.state?.editingItem || null;

  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    team_member_ids: [],
    date: new Date(),
    changes_asked: 0,
    blogs_posted: 0,
    updates: 0,
    ranking_issues: false,
    reports_sent: false,
    ranking_issues_description: '',
    backlinks: 0,
    domain_authority: 50,
    page_authority: 50,
    keyword_pass: 0,
    site_health: 100,
    issues: 0,
  });

  useEffect(() => {
    fetchClients();
    fetchTeamMembers();
    
    if (editingItem) {
      setFormData({
        client_id: editingItem.client_id,
        team_member_ids: editingItem.team_member_ids || (editingItem.team_member_id ? [editingItem.team_member_id] : []),
        date: new Date(editingItem.date),
        changes_asked: editingItem.changes_asked,
        blogs_posted: editingItem.blogs_posted,
        updates: editingItem.updates,
        ranking_issues: editingItem.ranking_issues,
        reports_sent: editingItem.reports_sent,
        ranking_issues_description: editingItem.ranking_issues_description || '',
        backlinks: editingItem.backlinks,
        domain_authority: editingItem.domain_authority,
        page_authority: editingItem.page_authority,
        keyword_pass: editingItem.keyword_pass,
        site_health: editingItem.site_health,
        issues: editingItem.issues,
      });
    }
  }, [editingItem]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.client_id) {
      alert('Please select a client');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        date: formatDateOnly(formData.date),
      };

      if (editingItem) {
        await api.put(`/website-seo/${editingItem.id}`, payload);
      } else {
        await api.post('/website-seo', payload);
      }

      navigate('/dashboard?tab=website-seo');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard?tab=website-seo');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f1e', pt: 4, pb: 4 }}>
        <Container maxWidth="lg">
          {/* Breadcrumb Navigation */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/dashboard?tab=website-seo')}
                sx={{ cursor: 'pointer', color: 'primary.main' }}
              >
                Website & SEO Data
              </Link>
              <Typography color="textSecondary">
                {editingItem ? 'Edit SEO Entry' : 'Add New SEO Entry'}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {editingItem ? 'Edit Website & SEO Data' : 'Add New Website & SEO Data'}
            </Typography>
          </Box>

          {/* Main Form Card */}
          <Card sx={{ bgcolor: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Client Selection */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Client</InputLabel>
                    <Select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      label="Client"
                    >
                      <MenuItem value="">Select a Client</MenuItem>
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date Selection */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                {/* Team Members Multi-Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Team Members</InputLabel>
                    <Select
                      multiple
                      value={formData.team_member_ids}
                      onChange={(e) => setFormData({ ...formData, team_member_ids: e.target.value })}
                      label="Team Members"
                    >
                      {teamMembers.map((member) => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Divider */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    Content & Links
                  </Typography>
                </Grid>

                {/* Content Fields */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Blogs Posted"
                    type="number"
                    value={formData.blogs_posted}
                    onChange={(e) => setFormData({ ...formData, blogs_posted: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Backlinks"
                    type="number"
                    value={formData.backlinks}
                    onChange={(e) => setFormData({ ...formData, backlinks: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Keyword Ranking"
                    type="number"
                    value={formData.keyword_pass}
                    onChange={(e) => setFormData({ ...formData, keyword_pass: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Changes Asked"
                    type="number"
                    value={formData.changes_asked}
                    onChange={(e) => setFormData({ ...formData, changes_asked: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Updates"
                    type="number"
                    value={formData.updates}
                    onChange={(e) => setFormData({ ...formData, updates: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                {/* Divider */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    Performance Metrics
                  </Typography>
                </Grid>

                {/* Page Speed on Mobile */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Page Speed on Mobile: <strong>{formData.domain_authority}</strong>
                  </Typography>
                  <Slider
                    value={formData.domain_authority}
                    onChange={(_, value) => setFormData({ ...formData, domain_authority: value })}
                    min={0}
                    max={100}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                {/* Page Speed on Desktop */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Page Speed on the Desktop: <strong>{formData.page_authority}</strong>
                  </Typography>
                  <Slider
                    value={formData.page_authority}
                    onChange={(_, value) => setFormData({ ...formData, page_authority: value })}
                    min={0}
                    max={100}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                {/* Site Health */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Site Health: <strong>{formData.site_health}%</strong>
                  </Typography>
                  <Slider
                    value={formData.site_health}
                    onChange={(_, value) => setFormData({ ...formData, site_health: value })}
                    min={0}
                    max={100}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                {/* Issues */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Issues"
                    type="number"
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                {/* Divider */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    Additional Information
                  </Typography>
                </Grid>

                {/* Ranking Issues */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ranking_issues}
                        onChange={(e) => setFormData({ ...formData, ranking_issues: e.target.checked })}
                      />
                    }
                    label="Ranking Issues"
                  />
                </Grid>

                {/* Reports Sent */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.reports_sent}
                        onChange={(e) => setFormData({ ...formData, reports_sent: e.target.checked })}
                      />
                    }
                    label="Reports Sent"
                  />
                </Grid>

                {/* Ranking Issue Description */}
                {formData.ranking_issues && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ranking Issue Description"
                      multiline
                      rows={4}
                      value={formData.ranking_issues_description}
                      onChange={(e) => setFormData({ ...formData, ranking_issues_description: e.target.value })}
                      placeholder="Describe the ranking issues you encountered..."
                    />
                  </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={loading || !formData.client_id}
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update Entry' : 'Add Entry'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default AddSEOEntry;
