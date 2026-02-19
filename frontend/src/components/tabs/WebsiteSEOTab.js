import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Avatar,
  Popover,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import api from '../../services/api';
import { formatDateOnly } from '../../utils/dateFormatter';
import { AuthContext } from '../../context/AuthContext';

const WebsiteSEOTab = () => {
  const { user } = useContext(AuthContext);
  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  const [data, setData] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
    fetchData();
    fetchClients();
    fetchTeamMembers();
  }, [startDate, endDate, selectedClient]);

  const fetchData = async () => {
    try {
      const params = {
        startDate: formatDateOnly(startDate),
        endDate: formatDateOnly(endDate),
      };
      if (selectedClient) params.clientId = selectedClient;
      
      const response = await api.get('/website-seo', { params });
      const formattedData = response.data.map(item => ({
        ...item,
        date: formatDateOnly(item.date)
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching website SEO data:', error);
    }
  };

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

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        client_id: item.client_id,
        team_member_ids: item.team_member_ids || (item.team_member_id ? [item.team_member_id] : []),
        date: new Date(item.date),
        changes_asked: item.changes_asked,
        blogs_posted: item.blogs_posted,
        updates: item.updates,
        ranking_issues: item.ranking_issues,
        reports_sent: item.reports_sent,
        ranking_issues_description: item.ranking_issues_description || '',
        backlinks: item.backlinks,
        domain_authority: item.domain_authority,
        page_authority: item.page_authority,
        keyword_pass: item.keyword_pass,
        site_health: item.site_health,
        issues: item.issues,
      });
    } else {
      setEditingItem(null);
      setFormData({
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
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const [rankingDialogOpen, setRankingDialogOpen] = useState(false);
  const [rankingDialogText, setRankingDialogText] = useState('');
  const [membersPopoverAnchor, setMembersPopoverAnchor] = useState(null);
  const [selectedMembersItem, setSelectedMembersItem] = useState(null);

  const openRankingDialog = (text) => {
    setRankingDialogText(text || '');
    setRankingDialogOpen(true);
  };

  const closeRankingDialog = () => {
    setRankingDialogOpen(false);
    setRankingDialogText('');
  };

  const handleSubmit = async () => {
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

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.delete(`/website-seo/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const handleOpenMembersPopover = (event, item) => {
    setMembersPopoverAnchor(event.currentTarget);
    setSelectedMembersItem(item);
  };

  const handleCloseMembersPopover = () => {
    setMembersPopoverAnchor(null);
    setSelectedMembersItem(null);
  };

  const getMemberName = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member ? member.name : `Unknown (${memberId})`;
  };

  const calculateStats = () => {
    if (data.length === 0) return {};
    
    const stats = {
      totalBlogs: data.reduce((sum, item) => sum + (item.blogs_posted || 0), 0),
      totalBacklinks: data.reduce((sum, item) => sum + (item.backlinks || 0), 0),
      totalChanges: data.reduce((sum, item) => sum + (item.changes_asked || 0), 0),
      avgDA: data.reduce((sum, item) => sum + (item.domain_authority || 0), 0) / data.length,
      avgPA: data.reduce((sum, item) => sum + (item.page_authority || 0), 0) / data.length,
      totalIssues: data.reduce((sum, item) => sum + (item.issues || 0), 0),
      avgSiteHealth: data.reduce((sum, item) => sum + (item.site_health || 0), 0) / data.length,
      reportsSentCount: data.filter(item => item.reports_sent).length,
      rankingIssuesCount: data.filter(item => item.ranking_issues).length,
    };
    
    return stats;
  };

  const stats = calculateStats();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f1e', p: 2 }}>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Client"
                >
                  <MenuItem value="">All Clients</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  fullWidth
                >
                  Add SEO Entry
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Ranking Issue Description Viewer Dialog */}
        <Dialog open={rankingDialogOpen} onClose={closeRankingDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Ranking Issue Details</DialogTitle>
          <DialogContent>
            <Typography variant="body1">{rankingDialogText || 'No description provided.'}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRankingDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Page Speed Scores</Typography>
                </Box>
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Page Speed on Mobile</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.avgDA || 0} 
                        sx={{ flexGrow: 1, mr: 1, height: 8 }} 
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {stats.avgDA ? stats.avgDA.toFixed(1) : 0}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Page Speed on the Desktop</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.avgPA || 0} 
                        sx={{ flexGrow: 1, mr: 1, height: 8 }} 
                        color="secondary"
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {stats.avgPA ? stats.avgPA.toFixed(1) : 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Content
                </Typography>
                <Box>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {stats.totalBlogs}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Blogs Posted
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Backlinks
                </Typography>
                <Box>
                  <Typography variant="h4" color="secondary" gutterBottom>
                    {stats.totalBacklinks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Links
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Site Health
                </Typography>
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ 
                    color: stats.avgSiteHealth >= 80 ? 'success.main' : stats.avgSiteHealth >= 60 ? 'warning.main' : 'error.main' 
                  }}>
                    {stats.avgSiteHealth ? stats.avgSiteHealth.toFixed(1) : 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Health
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Issues
                </Typography>
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ 
                    color: stats.totalIssues > 10 ? 'error.main' : stats.totalIssues > 5 ? 'warning.main' : 'success.main' 
                  }}>
                    {stats.totalIssues}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Issues
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Status
                </Typography>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      icon={stats.reportsSentCount > 0 ? <CheckCircleIcon /> : <CancelIcon />}
                      label={`Reports: ${stats.reportsSentCount}/${data.length}`}
                      color={stats.reportsSentCount === data.length ? "success" : "default"}
                      size="small"
                    />
                    <Chip
                      icon={stats.rankingIssuesCount > 0 ? <CancelIcon /> : <CheckCircleIcon />}
                      label={`Ranking Issues: ${stats.rankingIssuesCount}`}
                      color={stats.rankingIssuesCount > 0 ? "error" : "success"}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Changes: {stats.totalChanges}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Page Speed Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="domain_authority" stroke="#0A58BF" name="Page Speed on Mobile" />
                  <Line type="monotone" dataKey="page_authority" stroke="#5505A6" name="Page Speed on the Desktop" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Activity Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="blogs_posted" fill="#0A58BF" name="Blogs" />
                  <Bar dataKey="backlinks" fill="#5505A6" name="Backlinks" />
                  <Bar dataKey="keyword_pass" fill="#3A7FD9" name="Keyword Ranking" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Data Table */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Website & SEO Data
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Blogs</TableCell>
                  <TableCell>Backlinks</TableCell>
                  <TableCell>Page Speed (Mobile/Desktop)</TableCell>
                  <TableCell>Ranking Issue</TableCell>
                  <TableCell>Keywords</TableCell>
                  <TableCell>Issues</TableCell>
                  <TableCell>Reports</TableCell>
                  <TableCell>Team Member</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.client_name}</TableCell>
                    <TableCell>{item.blogs_posted}</TableCell>
                    <TableCell>{item.backlinks}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">Mobile: {item.domain_authority}</Typography>
                        <Typography variant="body2">Desktop: {item.page_authority}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => item.ranking_issues ? openRankingDialog(item.ranking_issues_description) : null}>
                        {item.ranking_issues ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{item.keyword_pass}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.issues} 
                        size="small" 
                        color={item.issues > 5 ? "error" : item.issues > 0 ? "warning" : "success"}
                      />
                    </TableCell>
                    <TableCell>
                      {item.reports_sent ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const memberIds = item.team_member_ids || [];
                        if (memberIds.length === 0) {
                          return item.team_member_name || 'N/A';
                        }
                        if (memberIds.length === 1) {
                          return getMemberName(memberIds[0]);
                        }
                        return (
                          <Chip
                            label={`View Members (${memberIds.length})`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            onClick={(e) => handleOpenMembersPopover(e, item)}
                            sx={{ cursor: 'pointer' }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {canEdit && (
                        <>
                          <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingItem ? 'Edit Website SEO Entry' : 'Add Website SEO Entry'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Client</InputLabel>
                  <Select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    label="Client"
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Team Member</InputLabel>
                  <Select
                    multiple
                    value={formData.team_member_ids}
                    onChange={(e) => setFormData({ ...formData, team_member_ids: e.target.value })}
                    label="Team Member"
                  >
                    {teamMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
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
                <Typography gutterBottom>Page Speed on Mobile: {formData.domain_authority}</Typography>
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
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Page Speed on the Desktop: {formData.page_authority}</Typography>
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
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Site Health: {formData.site_health}%</Typography>
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
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issues"
                  type="number"
                  value={formData.issues}
                  onChange={(e) => setFormData({ ...formData, issues: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              
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
              {formData.ranking_issues && (
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Ranking Issue Description"
                    multiline
                    rows={3}
                    value={formData.ranking_issues_description}
                    onChange={(e) => setFormData({ ...formData, ranking_issues_description: e.target.value })}
                  />
                </Grid>
              )}
              
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Members Popover */}
        <Popover
          open={Boolean(membersPopoverAnchor)}
          anchorEl={membersPopoverAnchor}
          onClose={handleCloseMembersPopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Paper sx={{ p: 2, minWidth: 250 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Team Members
            </Typography>
            {selectedMembersItem && (selectedMembersItem.team_member_ids || []).map((memberId, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.75rem',
                  }}
                >
                  {getMemberName(memberId)
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  {getMemberName(memberId)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default WebsiteSEOTab;