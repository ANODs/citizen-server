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
    const citizensTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'citizens'
      );
    `);

    if (!citizensTableExists.rows[0].exists) {
      console.log('Creating citizens table...');
      await client.query(`
        CREATE TABLE citizens (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          middle_name VARCHAR(100),
          birth_date DATE NOT NULL,
          birth_place VARCHAR(255) NOT NULL,
          gender VARCHAR(20) NOT NULL,
          profile_photo VARCHAR(255),
          address VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          country VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          email VARCHAR(100) NOT NULL,
          citizenship VARCHAR(100) NOT NULL,
          nationality VARCHAR(100) NOT NULL,
          marital_status VARCHAR(50) NOT NULL,
          children_count INTEGER NOT NULL,
          native_language VARCHAR(50) NOT NULL,
          additional_languages TEXT[],
          education_level VARCHAR(50) NOT NULL,
          institution VARCHAR(255) NOT NULL,
          graduation_year INTEGER NOT NULL,
          specialization VARCHAR(255) NOT NULL,
          academic_degree VARCHAR(50),
          workplace VARCHAR(255),
          position VARCHAR(100),
          work_experience INTEGER,
          salary INTEGER,
          resume TEXT,
          skills TEXT[],
          hobbies TEXT[],
          interests TEXT[],
          blood_type VARCHAR(5),
          height INTEGER,
          weight INTEGER,
          eye_color VARCHAR(20),
          hair_color VARCHAR(20),
          shoe_size INTEGER,
          clothing_size VARCHAR(10),
          allergies TEXT[],
          chronic_diseases TEXT[],
          disability BOOLEAN,
          military_service BOOLEAN,
          driving_license BOOLEAN,
          driving_categories TEXT[],
          has_car BOOLEAN,
          car_brand VARCHAR(50),
          car_year INTEGER,
          passport_number VARCHAR(20),
          passport_issue_date DATE,
          passport_issued_by VARCHAR(255),
          tax_id VARCHAR(20),
          social_security_number VARCHAR(20),
          medical_insurance_number VARCHAR(20),
          bank_details TEXT,
          credit_score INTEGER,
          criminal_record BOOLEAN,
          political_views VARCHAR(50),
          religious_beliefs VARCHAR(50),
          organization_memberships TEXT[],
          social_media_links TEXT[],
          nickname VARCHAR(50),
          personal_website VARCHAR(255),
          blog_url VARCHAR(255),
          youtube_channel VARCHAR(255),
          spotify_playlist VARCHAR(255),
          favorite_music TEXT[],
          favorite_movies TEXT[],
          favorite_books TEXT[],
          favorite_foods TEXT[],
          dietary_preferences VARCHAR(50),
          sports_achievements TEXT,
          awards TEXT[],
          publications TEXT[],
          patents TEXT[],
          volunteer_activities TEXT,
          blood_donor BOOLEAN,
          zodiac_sign VARCHAR(20),
          pets TEXT[],
          favorite_color VARCHAR(20),
          ring_size FLOAT,
          tattoos BOOLEAN,
          piercings BOOLEAN,
          wears_glasses BOOLEAN,
          disability_group VARCHAR(20),
          benefits TEXT[],
          pension_certificate VARCHAR(20),
          retirement_date DATE,
          military_id VARCHAR(20),
          foreign_passport BOOLEAN,
          visa TEXT[],
          visited_countries TEXT[],
          computer_skills VARCHAR(50),
          musical_instruments TEXT[],
          sports_clubs TEXT[],
          training_courses TEXT[],
          certificates TEXT[],
          parents INTEGER[],
          spouse INTEGER,
          children INTEGER[],
          siblings INTEGER[],
          grandparents INTEGER[],
          colleagues INTEGER[],
          classmates INTEGER[],
          friends INTEGER[],
          neighbors INTEGER[],
          scientific_advisor INTEGER,
          mentor INTEGER,
          favorite_teacher INTEGER,
          photo_albums TEXT[],
          documents TEXT[],
          medical_record TEXT,
          vaccinations TEXT[],
          health_group VARCHAR(10),
          last_fluorography_date DATE,
          last_medical_exam_date DATE,
          fingerprints TEXT,
          signature TEXT,
          handwriting_sample TEXT,
          voice_sample TEXT,
          video_presentation TEXT,
          qr_code TEXT,
          barcode TEXT,
          favorite_place TEXT,
          dream TEXT,
          life_credo TEXT,
          motto TEXT,
          superpower TEXT,
          fears TEXT[],
          phobias TEXT[],
          bad_habits TEXT[],
          sleep_schedule TEXT,
          preferred_vacation_type VARCHAR(50),
          favorite_holiday VARCHAR(50),
          hat_size FLOAT,
          favorite_joke TEXT,
          favorite_quote TEXT,
          idol VARCHAR(100),
          motivation TEXT,
          yearly_goals TEXT[],
          achievements TEXT[],
          failures TEXT[],
          future_plans TEXT,
          family_tree TEXT,
          personal_coat_of_arms TEXT,
          favorite_superhero VARCHAR(50),
          favorite_game VARCHAR(100),
          favorite_sport VARCHAR(50),
          preferred_clothing_style VARCHAR(50)
        )
      `);
      console.log('Citizens table created.');
    } else {
      console.log('Citizens table already exists.');
    }

    // Check if the statistics table exists
    const statsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'statistics'
      );
    `);

    if (!statsTableExists.rows[0].exists) {
      console.log('Creating statistics table...');
      await client.query(`
        CREATE TABLE statistics (
          id SERIAL PRIMARY KEY,
          avg_age_male FLOAT,
          avg_age_female FLOAT,
          gender_distribution JSONB,
          education_distribution JSONB,
          marital_status_distribution JSONB,
          avg_salary FLOAT,
          avg_children_count FLOAT,
          citizenship_distribution JSONB,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Statistics table created.');
    } else {
      console.log('Statistics table already exists.');
    }

  } catch (err) {
    console.error('Error initializing database', err);
  } finally {
    client.release();
  }
}

// Function to calculate and update statistics
async function updateStatistics() {
  const client = await pool.connect();
  try {
    const stats = await client.query(`
      WITH age_stats AS (
        SELECT 
          AVG(CASE WHEN gender = 'male' THEN EXTRACT(YEAR FROM age(birth_date)) END) as avg_age_male,
          AVG(CASE WHEN gender = 'female' THEN EXTRACT(YEAR FROM age(birth_date)) END) as avg_age_female
        FROM citizens
      ),
      gender_dist AS (
        SELECT jsonb_object_agg(gender, count) as gender_distribution
        FROM (
          SELECT gender, COUNT(*) as count
          FROM citizens
          GROUP BY gender
        ) as gender_counts
      ),
      education_dist AS (
        SELECT jsonb_object_agg(education_level, count) as education_distribution
        FROM (
          SELECT education_level, COUNT(*) as count
          FROM citizens
          GROUP BY education_level
        ) as education_counts
      ),
      marital_dist AS (
        SELECT jsonb_object_agg(marital_status, count) as marital_status_distribution
        FROM (
          SELECT marital_status, COUNT(*) as count
          FROM citizens
          GROUP BY marital_status
        ) as marital_counts
      ),
      salary_stats AS (
        SELECT AVG(salary) as avg_salary
        FROM citizens
      ),
      children_stats AS (
        SELECT AVG(children_count) as avg_children_count
        FROM citizens
      ),
      citizenship_dist AS (
        SELECT jsonb_object_agg(citizenship, count) as citizenship_distribution
        FROM (
          SELECT citizenship, COUNT(*) as count
          FROM citizens
          GROUP BY citizenship
        ) as citizenship_counts
      )
      INSERT INTO statistics (
        avg_age_male, 
        avg_age_female, 
        gender_distribution, 
        education_distribution, 
        marital_status_distribution, 
        avg_salary, 
        avg_children_count, 
        citizenship_distribution
      )
      SELECT 
        age_stats.avg_age_male,
        age_stats.avg_age_female,
        gender_dist.gender_distribution,
        education_dist.education_distribution,
        marital_dist.marital_status_distribution,
        salary_stats.avg_salary,
        children_stats.avg_children_count,
        citizenship_dist.citizenship_distribution
      FROM 
        age_stats, 
        gender_dist, 
        education_dist, 
        marital_dist, 
        salary_stats, 
        children_stats, 
        citizenship_dist
      ON CONFLICT (id) DO UPDATE
      SET 
        avg_age_male = EXCLUDED.avg_age_male,
        avg_age_female = EXCLUDED.avg_age_female,
        gender_distribution = EXCLUDED.gender_distribution,
        education_distribution = EXCLUDED.education_distribution,
        marital_status_distribution = EXCLUDED.marital_status_distribution,
        avg_salary = EXCLUDED.avg_salary,
        avg_children_count = EXCLUDED.avg_children_count,
        citizenship_distribution = EXCLUDED.citizenship_distribution,
        last_updated = CURRENT_TIMESTAMP
    `);
    console.log('Statistics updated successfully');
  } catch (err) {
    console.error('Error updating statistics', err);
  } finally {
    client.release();
  }
}

// Routes

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

// Get a slice of citizens
app.get('/api/citizens/slice/:start/:end', async (req, res) => {
  const { start, end } = req.params;
  const limit = end - start;
  
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM citizens');
    const totalCount = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      'SELECT id, first_name, last_name, birth_date, address FROM citizens ORDER BY id ASC OFFSET $1 LIMIT $2',
      [start, limit]
    );
    
    res.json({
      citizens: result.rows,
      totalCount: totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching citizens slice' });
  }
});

// Create a new citizen
app.post('/api/citizens', async (req, res) => {
  const newCitizen = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO citizens (first_name, last_name, birth_date, gender, address, city, country, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [newCitizen.first_name, newCitizen.last_name, newCitizen.birth_date, newCitizen.gender, newCitizen.address, newCitizen.city, newCitizen.country, newCitizen.email]
    );
    res.status(201).json(result.rows[0]);
    updateStatistics();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the citizen' });
  }
});

// Update a citizen
app.put('/api/citizens/:id', async (req, res) => {
  const { id } = req.params;
  const updatedCitizen = req.body;
  try {
    const result = await pool.query(
      'UPDATE citizens SET first_name = $1, last_name = $2, birth_date = $3, gender = $4, address = $5, city = $6, country = $7, email = $8 WHERE id = $9 RETURNING *',
      [updatedCitizen.first_name, updatedCitizen.last_name, updatedCitizen.birth_date, updatedCitizen.gender, updatedCitizen.address, updatedCitizen.city, updatedCitizen.country, updatedCitizen.email, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Citizen not found' });
    } else {
      res.json(result.rows[0]);
      updateStatistics();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the citizen' });
  }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM statistics ORDER BY last_updated DESC LIMIT 1');
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Statistics not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching statistics' });
  }
});

// Start server and initialize database
initializeDatabase().then(() => {
  updateStatistics().then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running`);
    });
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});

app.post('/api/citizens/search', async (req, res) => {
  console.log('Received search request:', req.body);

  const filters = req.body;
  let query = 'SELECT * FROM citizens WHERE 1=1';
  const values = [];
  let paramCounter = 1;
  const conditions = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      conditions.push(`${key} ILIKE $${paramCounter}`);
      values.push(`%${value}%`);
      paramCounter++;
    }
  }

  if (conditions.length === 0) {
    console.log('Empty search request received. Returning all citizens.');
    return res.json({
      citizens: [],
      totalCount: 0
    });
  }

  // Используем AND между условиями вместо OR
  query += ` AND ${conditions.join(' AND ')}`;

  console.log('Executing query:', query);
  console.log('Query parameters:', values);

  try {
    const result = await pool.query(query, values);
    console.log(`Search completed. Found ${result.rowCount} citizens.`);
    res.json({
      citizens: result.rows,
      totalCount: result.rowCount
    });
  } catch (err) {
    console.error('Error occurred while searching citizens:', err);
    res.status(500).json({ error: 'An error occurred while searching citizens' });
  }
});