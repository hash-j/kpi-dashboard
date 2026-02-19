const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { logActivity } = require('../middleware/activityLog');
const { authorize } = require('../middleware/auth');

// Get all website SEO KPIs with filters
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, clientId } = req.query;
        let query = `
            SELECT ws.*, ws.team_member_ids, c.name as client_name, tm.name as team_member_name
            FROM website_seo_kpis ws
            LEFT JOIN clients c ON ws.client_id = c.id
            LEFT JOIN team_members tm ON ws.team_member_id = tm.id
            WHERE 1=1
        `;
        const params = [];

        if (startDate) {
            query += ` AND ws.date >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND ws.date <= $${params.length + 1}`;
            params.push(endDate);
        }

        if (clientId) {
            query += ` AND ws.client_id = $${params.length + 1}`;
            params.push(clientId);
        }

        query += ' ORDER BY ws.date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching website SEO KPIs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new website SEO KPI
router.post('/', authorize(['admin', 'editor']), async (req, res) => {
    const {
        client_id,
        team_member_id,
        team_member_ids,
        date,
        changes_asked,
        blogs_posted,
        updates,
        ranking_issues,
        ranking_issues_description,
        reports_sent,
        backlinks,
        domain_authority,
        page_authority,
        keyword_pass,
        site_health,
        issues
    } = req.body;

    const primaryTeamMemberId = (Array.isArray(team_member_ids) && team_member_ids.length > 0)
        ? team_member_ids[0]
        : team_member_id;

    try {
        const result = await pool.query(
            `INSERT INTO website_seo_kpis 
                (client_id, team_member_id, team_member_ids, date, changes_asked, blogs_posted, updates,
                 ranking_issues, ranking_issues_description, reports_sent, backlinks, domain_authority, page_authority,
                 keyword_pass, site_health, issues)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
                [
                    client_id, primaryTeamMemberId, team_member_ids || [], date, changes_asked, blogs_posted, updates,
                    ranking_issues, ranking_issues_description, reports_sent, backlinks, domain_authority, page_authority,
                    keyword_pass, site_health, issues
                ]
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
            'website_seo',
            kpi.id,
            `${clientName} - SEO`,
            'WebsiteSEOTab',
            `${userName} added website SEO data for ${clientName} on ${date}`
        );
        
        res.status(201).json(kpi);
    } catch (error) {
        console.error('Error creating website SEO KPI:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update website SEO KPI
router.put('/:id', authorize(['admin', 'editor']), async (req, res) => {
    const { id } = req.params;
    const {
        client_id,
        team_member_id,
        team_member_ids,
        date,
        changes_asked,
        blogs_posted,
        updates,
        ranking_issues,
        ranking_issues_description,
        reports_sent,
        backlinks,
        domain_authority,
        page_authority,
        keyword_pass,
        site_health,
        issues
    } = req.body;

    const primaryTeamMemberId = (Array.isArray(team_member_ids) && team_member_ids.length > 0)
        ? team_member_ids[0]
        : team_member_id;

    try {
        const result = await pool.query(
            `UPDATE website_seo_kpis 
            SET client_id = $1, team_member_id = $2, team_member_ids = $3, date = $4, changes_asked = $5,
                blogs_posted = $6, updates = $7, ranking_issues = $8, ranking_issues_description = $9, reports_sent = $10,
                backlinks = $11, domain_authority = $12, page_authority = $13,
                keyword_pass = $14, site_health = $15, issues = $16,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $17 RETURNING *`,
            [
                client_id, primaryTeamMemberId, team_member_ids || [], date, changes_asked, blogs_posted, updates,
                ranking_issues, ranking_issues_description, reports_sent, backlinks, domain_authority, page_authority,
                keyword_pass, site_health, issues, id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Website SEO KPI not found' });
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
            'website_seo',
            kpi.id,
            `${clientName} - SEO`,
            'WebsiteSEOTab',
            `${userName} edited website SEO data for ${clientName} on ${date}`
        );
        
        res.json(kpi);
    } catch (error) {
        console.error('Error updating website SEO KPI:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete website SEO KPI
router.delete('/:id', authorize(['admin', 'editor']), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM website_seo_kpis WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Website SEO KPI not found' });
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
                'website_seo',
                kpi.id,
                `${clientName} - SEO`,
                'WebsiteSEOTab',
                `${userName} deleted website SEO data for ${clientName} on ${kpi.date}`
            );
        } catch (e) {
            console.error('Error logging website SEO deletion:', e.message);
        }

        res.json({ message: 'Website SEO KPI deleted successfully' });
    } catch (error) {
        console.error('Error deleting website SEO KPI:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;