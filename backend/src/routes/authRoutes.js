const express = require('express');
const { z } = require('zod');
const db = require('../db/pool');
const { hashPassword, verifyPassword, signToken } = require('../lib/auth');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

router.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid registration payload.', details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const existing = await db.query('SELECT id FROM app_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const created = await db.query(
      `
        INSERT INTO app_users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, created_at
      `,
      [email, passwordHash]
    );

    const user = created.rows[0];

    await db.query(
      `
        INSERT INTO user_sync_state (user_id, state)
        VALUES ($1, '{}'::jsonb)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [user.id]
    );

    return res.status(201).json({
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

router.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid login payload.', details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const result = await db.query(
      'SELECT id, email, password_hash, created_at FROM app_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await db.query(
      `
        INSERT INTO user_sync_state (user_id, state)
        VALUES ($1, '{}'::jsonb)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [user.id]
    );

    return res.json({
      token: signToken(user),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, created_at, updated_at FROM app_users WHERE id = $1',
      [req.auth.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('me error', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

module.exports = {
  authRoutes: router,
};
