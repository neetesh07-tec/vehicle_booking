DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'customer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE car_status AS ENUM ('available', 'unavailable');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  year INT NOT NULL,
  price_per_day NUMERIC(10,2) NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  seats INT NOT NULL,
  location VARCHAR(120) NOT NULL,
  status car_status NOT NULL DEFAULT 'available',
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_car_listing UNIQUE (brand, model, year, location)
);

ALTER TABLE cars
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  car_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  message VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password, role)
VALUES
  ('Admin User', 'admin@example.com', '$2b$10$ea3ZWZMvZaZD7ar5x0bc1O2ahElKimI.RLdcxbTKlZc9Dhzs8lFfe', 'admin'),
  ('Customer User', 'customer@example.com', '$2b$10$ea3ZWZMvZaZD7ar5x0bc1O2ahElKimI.RLdcxbTKlZc9Dhzs8lFfe', 'customer')
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    role = EXCLUDED.role;

INSERT INTO cars (brand, model, year, price_per_day, fuel_type, seats, location, status, description)
VALUES
  ('Toyota', 'Innova', 2022, 3200.00, 'Diesel', 7, 'Indore', 'available', 'Comfortable family car for long trips.'),
  ('Hyundai', 'Creta', 2023, 2800.00, 'Petrol', 5, 'Bhopal', 'available', 'Compact SUV with good mileage.'),
  ('Maruti Suzuki', 'Swift', 2021, 1600.00, 'Petrol', 5, 'Indore', 'available', 'Budget friendly city car.')
ON CONFLICT (brand, model, year, location) DO NOTHING;
