const express = require('express');
const fs = require('fs').promises;
const path = require('path');

module.exports = function createOpportunitiesRouter(deps) {
    const router = express.Router();
    deps = deps || {};
    const opportunitiesFilePath = deps.opportunitiesFilePath || path.join(__dirname, '..', '..', 'assets', 'uploads', 'files', 'opportunities.json');
    const cache = {
        mtimeMs: null,
        opportunities: []
    };

    router.get('/api/opportunities', async (req, res) => {
        try {
            const stat = await fs.stat(opportunitiesFilePath).catch(error => {
                if (error.code === 'ENOENT') return null;
                throw error;
            });
            if (!stat) {
                cache.mtimeMs = null;
                cache.opportunities = [];
                return res.json({ ok: true, opportunities: [] });
            }
            if (cache.mtimeMs !== stat.mtimeMs) {
                const data = await fs.readFile(opportunitiesFilePath, 'utf8');
                cache.opportunities = JSON.parse(data);
                cache.mtimeMs = stat.mtimeMs;
            }
            res.json({
                ok: true,
                opportunities: cache.opportunities
            });
        } catch (error) {
            console.error('Opportunities error:', error);
            res.status(500).json({ ok: false, error: 'Erreur opportunités' });
        }
    });

    return router;
};
