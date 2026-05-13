const express = require('express');
const crypto = require('crypto');

module.exports = function createSkillsRouter(deps) {
    const router = express.Router();
    const { verifyToken, getConnection, fallbackStore } = deps;

    router.post('/api/skills', verifyToken, async (req, res) => {
        try {
            const { nom, categorie } = req.body;
            const skillId = crypto.randomUUID();
            const connection = await getConnection();
            try {
                await connection.execute(
                    'INSERT INTO competence (id_skill, nom, categorie) VALUES (?, ?, ?)',
                    [skillId, nom, categorie]
                );

                res.json({
                    ok: true,
                    message: 'Compétence ajoutée',
                    skill: {
                        id: skillId,
                        id_skill: skillId,
                        nom: nom,
                        categorie: categorie
                    }
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            if (fallbackStore.isDatabaseUnavailable(error)) {
                const { nom, categorie } = req.body;
                const skill = await fallbackStore.addSkill({ nom, categorie });
                return res.json({
                    ok: true,
                    mode: 'file',
                    message: 'Compétence ajoutée',
                    skill: skill
                });
            }
            console.error('Skills error:', error);
            res.status(500).json({ ok: false, error: 'Erreur compétence' });
        }
    });

    router.get('/api/skills', verifyToken, async (req, res) => {
        try {
            const connection = await getConnection();
            try {
                const [skills] = await connection.execute('SELECT * FROM competence LIMIT 50');
                res.json({ ok: true, skills: skills });
            } finally {
                connection.release();
            }
        } catch (error) {
            if (fallbackStore.isDatabaseUnavailable(error)) {
                return res.json({
                    ok: true,
                    mode: 'file',
                    skills: await fallbackStore.listSkills()
                });
            }
            res.status(500).json({ ok: false, error: 'Erreur récupération compétences' });
        }
    });

    return router;
};
