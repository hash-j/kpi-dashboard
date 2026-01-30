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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../services/api';
import { formatDateOnly } from '../../utils/dateFormatter';
import { AuthContext } from '../../context/AuthContext';

const platforms = ['Reddit', 'TikTok', 'Instagram', 'Facebook', 'YouTube'];

const SocialMediaTab = () => {
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
    team_member_id: '',
    date: new Date(),
    platform: 'Instagram',
    quality_score: 5,
    quantity: 0,
  });

  useEffect(() => {
    fetchData();
    fetchClients();
    fetchTeamMembers();
  }, [startDate, endDate, selectedClient]);

  const fetchData = async () => {
    try {
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
      if (selectedClient) params.clientId = selectedClient;
      
      const response = await api.get('/social-media', { params });
      const formattedData = response.data.map(item => ({
        ...item,
        date: formatDateOnly(item.date)
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching social media data:', error);
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
        team_member_id: item.team_member_id,
        date: new Date(item.date),
        platform: item.platform,
        quality_score: item.quality_score,
        quantity: item.quantity,
      });
    } else {
      setEditingItem(null);
      setFormData({
        client_id: '',
        team_member_id: '',
        date: new Date(),
        platform: 'Instagram',
        quality_score: 5,
        quantity: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        date: formData.date.toISOString().split('T')[0],
      };

      if (editingItem) {
        await api.put(`/social-media/${editingItem.id}`, payload);
      } else {
        await api.post('/social-media', payload);
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
        await api.delete(`/social-media/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const calculatePlatformStats = () => {
    const stats = {};
    platforms.forEach(platform => {
      const platformData = data.filter(item => item.platform === platform);
      if (platformData.length > 0) {
        const totalQuality = platformData.reduce((sum, item) => sum + (item.quality_score || 0), 0);
        const totalQuantity = platformData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        stats[platform] = {
          avgQuality: totalQuality / platformData.length,
          totalQuantity,
          entries: platformData.length,
        };
      }
    });
    return stats;
  };

  const platformStats = calculatePlatformStats();

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
                  Add Entry
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Platform Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {Object.entries(platformStats).map(([platform, stats]) => (
            <Grid item xs={12} sm={6} md={2.4} key={platform}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {platform}
                  </Typography>
                  <Typography color="textSecondary">
                    Avg Quality: {stats.avgQuality.toFixed(1)}/10
                  </Typography>
                  <Typography color="textSecondary">
                    Total Posts: {stats.totalQuantity}
                  </Typography>
                  <Typography color="textSecondary">
                    Entries: {stats.entries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quality Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {platforms.map((platform, index) => (
                    <Line
                      key={platform}
                      type="monotone"
                      dataKey="quality_score"
                      data={data.filter(d => d.platform === platform)}
                      name={`${platform} Quality`}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quantity by Platform
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(platformStats).map(([platform, stats]) => ({
                  platform,
                  quantity: stats.totalQuantity,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#0A58BF" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Data Table */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Social Media Data
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Quality (0-10)</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Team Member</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.client_name}</TableCell>
                    <TableCell>{item.platform}</TableCell>
                    <TableCell>
                      <Slider
                        value={item.quality_score}
                        min={0}
                        max={10}
                        step={1}
                        marks
                        size="small"
                        disabled
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.team_member_name}</TableCell>
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
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingItem ? 'Edit Social Media Entry' : 'Add Social Media Entry'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Team Member</InputLabel>
                  <Select
                    value={formData.team_member_id}
                    onChange={(e) => setFormData({ ...formData, team_member_id: e.target.value })}
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
              <Grid item xs={12}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    label="Platform"
                  >
                    {platforms.map((platform) => (
                      <MenuItem key={platform} value={platform}>
                        {platform}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Quality Score: {formData.quality_score}/10</Typography>
                <Slider
                  value={formData.quality_score}
                  onChange={(_, value) => setFormData({ ...formData, quality_score: value })}
                  min={0}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
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
      </Box>
    </LocalizationProvider>
  );
};

export default SocialMediaTab;