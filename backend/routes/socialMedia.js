const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { logActivity } = require('../middleware/activityLog');
const { authorize } = require('../middleware/auth');

// Get all social media KPIs with filters
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, clientId } = req.query;
        let query = `
            SELECT sm.*, c.name as client_name, tm.name as team_member_name
            FROM social_media_kpis sm
            LEFT JOIN clients c ON sm.client_id = c.id
            LEFT JOIN team_members tm ON sm.team_member_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (startDate) {
            query += ` AND sm.date >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND sm.date <= $${params.length + 1}`;
            params.push(endDate);
        }

        if (clientId) {
            query += ` AND sm.client_id = $${params.length + 1}`;
            params.push(clientId);
        }

        query += ' ORDER BY sm.date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching social media KPIs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new social media KPI
router.post('/', authorize(['admin', 'editor']), async (req, res) => {
    const {
        client_id,
        team_member_id,
        date,
        platform,
        quality_score,
        quantity
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO social_media_kpis 
            (client_id, team_member_id, date, platform, quality_score, quantity)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [client_id, team_member_id, date, platform, quality_score, quantity]
        );
        
        const kpi = result.rows[0];
        
        // Get client name for logging
        const clientResult = await pool.query('SELECT name FROM clients WHERE id = $1', [client_id]);
        const clientName = clientResult.rows[0]?.name || 'Unknown Client';
        
        // Log the activity
        const userId = req.user?.id || null;
        const userName = req.user?.full_name || 'Unknown User';
        await logActivity(
            userId,
            'data_added',
            'social_media',
            kpi.id,
            `${clientName} - ${platform}`,
            'SocialMediaTab',
            `${userName} added social media data for ${clientName} on ${date}`
        );
        
        res.status(201).json(kpi);
    } catch (error) {
        console.error('Error creating social media KPI:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update social media KPI
router.put('/:id', authorize(['admin', 'editor']), async (req, res) => {
    const { id } = req.params;
    const {
        client_id,
        team_member_id,
        date,
        platform,
        quality_score,
        quantity
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE social_media_kpis 
            SET client_id = $1, team_member_id = $2, date = $3, 
                platform = $4, quality_score = $5, quantity = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 RETURNING *`,
            [client_id, team_member_id, date, platform, quality_score, quantity, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Social media KPI not found' });
        }
        
        const kpi = result.rows[0];
        
        // Get client name for logging
        const clientResult = await pool.query('SELECT name FROM clients WHERE id = $1', [client_id]);
        const clientName = clientResult.rows[0]?.name || 'Unknown Client';
        
        // Log the activity
        const userId = req.user?.id || null;
        const userName = req.user?.full_name || 'Unknown User';
        await logActivity(
            userId,
            'data_edited',
            'social_media',
            kpi.id,
            `${clientName} - ${platform}`,
            'SocialMediaTab',
            `${userName} edited social media data for ${clientName} on ${date}`
        );
        
        res.json(kpi);
    } catch (error) {
        console.error('Error updating social media KPI:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete social media KPI
router.delete('/:id', authorize(['admin', 'editor']), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM social_media_kpis WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Social media KPI not found' });
        }

        try {
            const kpi = result.rows[0];
            const clientResult = await pool.query('SELECT name FROM clients WHERE id = $1', [kpi.client_id]);
            const clientName = clientResult.rows[0]?.name || 'Unknown Client';
            const userId = req.user?.id || null;
            const userName = req.user?.full_name || 'Unknown User';
            await logActivity(
                userId,
                'data_deleted',
                'social_media',
                kpi.id,
                `${clientName} - ${kpi.platform || ''}`,
                'SocialMediaTab',
                `${userName} deleted social media data for ${clientName} on ${kpi.date}`
            );
        } catch (e) {
            console.error('Error logging social media deletion:', e.message);
        }

        res.json({ message: 'Social media KPI deleted successfully' });
    } catch (error) {
        console.error('Error deleting social media KPI:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;