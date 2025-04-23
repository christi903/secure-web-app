-- Select the database
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('fraud_analyst', 'support_agent')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create users table
