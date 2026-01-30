const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { authenticateToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to Neon PostgreSQL database');
        release();
    }
});

// Public routes (auth)
app.use('/api/auth', require('./routes/auth'));

// Health check (public)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes (require authentication)
app.use('/api/clients', authenticateToken, require('./routes/clients'));
app.use('/api/team', authenticateToken, require('./routes/team'));
app.use('/api/social-media', authenticateToken, require('./routes/socialMedia'));
app.use('/api/website-seo', authenticateToken, require('./routes/websiteSeo'));
app.use('/api/ads', authenticateToken, require('./routes/ads'));
app.use('/api/email', authenticateToken, require('./routes/email'));
app.use('/api/responses', authenticateToken, require('./routes/responses'));
app.use('/api/team-kpis', authenticateToken, require('./routes/teamKpis'));
app.use('/api/activities', authenticateToken, require('./routes/activities'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});