const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to initialize the database
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Check if the citizens table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'citizens'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating citizens table...');
      await client.query(`
        CREATE TABLE citizens (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          birth_date DATE NOT NULL,
          address VARCHAR(255) NOT NULL
        )
      `);

      // Insert some sample data
      await client.query(`
        INSERT INTO citizens (name, birth_date, address) VALUES
        ('Иван Иванов', '1990-01-15', 'ул. Пушкина, д. 10, кв. 5'),
        ('Мария Петрова', '1985-07-22', 'пр. Ленина, д. 25, кв. 12'),
        ('Алексей Сидоров', '1992-03-30', 'ул. Гагарина, д. 7, кв. 3')
      `);

      console.log('Citizens table created and sample data inserted.');
    } else {
      console.log('Citizens table already exists.');
    }
  } catch (err) {
    console.error('Error initializing database', err);
  } finally {
    client.release();
  }
}

// Routes

// Get all citizens
app.get('/api/citizens', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citizens ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching citizens' });
  }
});

// Get citizen by ID
app.get('/api/citizens/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM citizens WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Citizen not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the citizen' });
  }
});

// Start server and initialize database
initializeDatabase().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});