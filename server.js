import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'profile';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD
});

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const schemaSql = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf-8');
const seedSql = fs.readFileSync(path.join(__dirname, 'sql', 'seed.sql'), 'utf-8');

async function initDb() {
  await pool.query(schemaSql);
  await pool.query(seedSql);
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    summary: row.summary,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroDescription: row.hero_description,
    phone: row.phone,
    email: row.email,
    location: row.location,
    avatarUrl: row.avatar_url
  };
}

app.get('/api/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = mapUser(result.rows[0]);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.put('/api/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  const payload = req.body;
  await pool.query(
    `INSERT INTO users (id, name, title, summary, hero_title, hero_subtitle, hero_description, phone, email, location, avatar_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       title = EXCLUDED.title,
       summary = EXCLUDED.summary,
       hero_title = EXCLUDED.hero_title,
       hero_subtitle = EXCLUDED.hero_subtitle,
       hero_description = EXCLUDED.hero_description,
       phone = EXCLUDED.phone,
       email = EXCLUDED.email,
       location = EXCLUDED.location,
       avatar_url = EXCLUDED.avatar_url`,
    [
      userId,
      payload.name,
      payload.title,
      payload.summary,
      payload.heroTitle,
      payload.heroSubtitle,
      payload.heroDescription,
      payload.phone,
      payload.email,
      payload.location,
      payload.avatarUrl
    ]
  );
  res.json({ message: 'Profile saved' });
});

app.get('/api/users/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY level DESC', [userId]);
  res.json(result.rows);
});

app.put('/api/users/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  const skills = Array.isArray(req.body) ? req.body : [];
  await pool.query('DELETE FROM skills WHERE user_id = $1', [userId]);
  for (const s of skills) {
    await pool.query(
      'INSERT INTO skills (user_id, name, level, category) VALUES ($1,$2,$3,$4)',
      [userId, s.name, s.level, s.category]
    );
  }
  res.json({ message: 'Skills updated' });
});

app.get('/api/users/:userId/programming', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query('SELECT * FROM programming WHERE user_id = $1 ORDER BY level DESC', [userId]);
  res.json(result.rows);
});

app.put('/api/users/:userId/programming', async (req, res) => {
  const { userId } = req.params;
  const items = Array.isArray(req.body) ? req.body : [];
  await pool.query('DELETE FROM programming WHERE user_id = $1', [userId]);
  for (const item of items) {
    await pool.query(
      'INSERT INTO programming (user_id, name, level) VALUES ($1,$2,$3)',
      [userId, item.name, item.level]
    );
  }
  res.json({ message: 'Programming skills updated' });
});

app.get('/api/users/:userId/projects', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY id DESC', [userId]);
  res.json(result.rows);
});

app.put('/api/users/:userId/projects', async (req, res) => {
  const { userId } = req.params;
  const items = Array.isArray(req.body) ? req.body : [];
  await pool.query('DELETE FROM projects WHERE user_id = $1', [userId]);
  for (const item of items) {
    await pool.query(
      `INSERT INTO projects (user_id, title, description, image_url, live_url, repo_url, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, item.title, item.description, item.image_url, item.live_url, item.repo_url, item.category]
    );
  }
  res.json({ message: 'Projects updated' });
});

app.get('/api/users/:userId/social', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query('SELECT * FROM social_links WHERE user_id = $1', [userId]);
  res.json(result.rows);
});

app.put('/api/users/:userId/social', async (req, res) => {
  const { userId } = req.params;
  const items = Array.isArray(req.body) ? req.body : [];
  await pool.query('DELETE FROM social_links WHERE user_id = $1', [userId]);
  for (const item of items) {
    await pool.query(
      'INSERT INTO social_links (user_id, platform, url) VALUES ($1,$2,$3)',
      [userId, item.platform, item.url]
    );
  }
  res.json({ message: 'Social links updated' });
});

app.get('/api/users/:userId/certificates/primary', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    'SELECT * FROM certificates WHERE user_id = $1 AND type = $2 ORDER BY id DESC',
    [userId, 'primary']
  );
  res.json(result.rows);
});

app.get('/api/users/:userId/certificates/secondary', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    'SELECT * FROM certificates WHERE user_id = $1 AND type = $2 ORDER BY id DESC',
    [userId, 'secondary']
  );
  res.json(result.rows);
});

app.put('/api/users/:userId/certificates/primary', async (req, res) => {
  const { userId } = req.params;
  const items = Array.isArray(req.body) ? req.body : [];
  await pool.query('DELETE FROM certificates WHERE user_id = $1 AND type = $2', [userId, 'primary']);
  for (const item of items) {
    await pool.query(
      `INSERT INTO certificates (user_id, title, issuer, type, date_earned, credential_id, verify_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, item.title, item.issuer, 'primary', item.date_earned, item.credential_id, item.verify_url]
    );
  }
  res.json({ message: 'Primary certificates updated' });
});

app.put('/api/users/:userId/certificates/secondary', async (req, res) => {
  const { userId } = req.params;
  const items = Array.isArray(req.body) ? req.body : [];
  await pool.query('DELETE FROM certificates WHERE user_id = $1 AND type = $2', [userId, 'secondary']);
  for (const item of items) {
    await pool.query(
      `INSERT INTO certificates (user_id, title, issuer, type, date_earned, credential_id, verify_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, item.title, item.issuer, 'secondary', item.date_earned, item.credential_id, item.verify_url]
    );
  }
  res.json({ message: 'Secondary certificates updated' });
});

app.get('/api/users/:userId/education/bsc', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    'SELECT * FROM education WHERE user_id = $1 AND degree_type = $2',
    [userId, 'bsc']
  );
  res.json(result.rows[0] || null);
});

app.get('/api/users/:userId/education/msc', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    'SELECT * FROM education WHERE user_id = $1 AND degree_type = $2',
    [userId, 'msc']
  );
  res.json(result.rows[0] || null);
});

app.put('/api/users/:userId/education/bsc', async (req, res) => {
  const { userId } = req.params;
  const item = req.body;
  await pool.query('DELETE FROM education WHERE user_id = $1 AND degree_type = $2', [userId, 'bsc']);
  await pool.query(
    `INSERT INTO education (user_id, degree_type, institution, subject, year_start, year_end)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, 'bsc', item.institution, item.subject, item.year_start, item.year_end]
  );
  res.json({ message: 'BSc updated' });
});

app.put('/api/users/:userId/education/msc', async (req, res) => {
  const { userId } = req.params;
  const item = req.body;
  await pool.query('DELETE FROM education WHERE user_id = $1 AND degree_type = $2', [userId, 'msc']);
  await pool.query(
    `INSERT INTO education (user_id, degree_type, institution, subject, year_start, year_end)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, 'msc', item.institution, item.subject, item.year_start, item.year_end]
  );
  res.json({ message: 'MSc updated' });
});

app.get('/api/users/:userId/cv/download', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    'SELECT * FROM cv_files WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT 1',
    [userId]
  );
  const file = result.rows[0];
  if (!file) return res.status(404).json({ message: 'CV not found' });

  const filePath = path.join(__dirname, 'storage', 'cv', file.file_name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'CV file missing' });

  res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
  res.setHeader('Content-Type', 'application/pdf');
  fs.createReadStream(filePath).pipe(res);
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message, userId } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email, message required' });
  }
  const result = await pool.query(
    'INSERT INTO contact_messages (user_id, name, email, message) VALUES ($1,$2,$3,$4) RETURNING id',
    [userId || null, name, email, message]
  );
  res.json({ message: 'Contact message submitted', id: result.rows[0].id });
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Node backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to init DB', err);
    process.exit(1);
  });
