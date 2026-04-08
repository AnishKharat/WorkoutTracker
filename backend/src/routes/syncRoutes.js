const express = require('express');
const { z } = require('zod');
const db = require('../db/pool');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

const syncSchema = z.object({
  state: z.record(z.string(), z.unknown()),
  stateVersion: z.number().int().positive().optional(),
});

router.get('/state', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `
        SELECT state, state_version, updated_at
        FROM user_sync_state
        WHERE user_id = $1
      `,
      [req.auth.userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        state: {},
        stateVersion: 1,
        updatedAt: null,
      });
    }

    const row = result.rows[0];
    return res.json({
      state: row.state,
      stateVersion: row.state_version,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('sync get error', error);
    return res.status(500).json({ error: 'Failed to load sync state.' });
  }
});

router.put('/state', requireAuth, async (req, res) => {
  const parsed = syncSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid sync payload.', details: parsed.error.flatten() });
  }

  const { state, stateVersion = 1 } = parsed.data;

  try {
    const result = await db.query(
      `
        INSERT INTO user_sync_state (user_id, state, state_version)
        VALUES ($1, $2::jsonb, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET
          state = EXCLUDED.state,
          state_version = EXCLUDED.state_version,
          updated_at = NOW()
        RETURNING state, state_version, updated_at
      `,
      [req.auth.userId, JSON.stringify(state), stateVersion]
    );

    const row = result.rows[0];
    return res.json({
      state: row.state,
      stateVersion: row.state_version,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('sync put error', error);
    return res.status(500).json({ error: 'Failed to save sync state.' });
  }
});

module.exports = {
  syncRoutes: router,
};
