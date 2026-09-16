-- Strivio database schema (MySQL, raw SQL, no ORM)
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(191) NOT NULL DEFAULT 'Admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NULL,
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  name VARCHAR(191) NOT NULL,
  business_name VARCHAR(191) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  description TEXT NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One-time-passwords for both user login and partner registration.
CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  purpose ENUM('user_login','partner_register') NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  last_sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otps_email_purpose (email, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(500) NULL,
  image VARCHAR(500) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- A partner's bookable session slots (e.g. "Morning 6-9 AM"), shared across all
-- of their listings. If a partner has none, the frontend falls back to defaults.
CREATE TABLE IF NOT EXISTS partner_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  label VARCHAR(60) NOT NULL,
  start_time VARCHAR(20) NULL,
  end_time VARCHAR(20) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  INDEX idx_sessions_partner (partner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partner_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_period VARCHAR(30) NOT NULL DEFAULT 'month',
  address VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  phone VARCHAR(20) NULL,
  opening_time VARCHAR(20) NULL,
  closing_time VARCHAR(20) NULL,
  services TEXT NULL,
  images JSON NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  rejection_reason VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  qr_token VARCHAR(64) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_category FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_listings_status (status),
  INDEX idx_listings_partner (partner_id),
  INDEX idx_listings_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Multiple pricing plans per listing (e.g. per day / per session / per month /
-- per quarter / per year), each with an optional group size ("persons").
CREATE TABLE IF NOT EXISTS listing_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  period ENUM('day','session','month','quarter','year') NOT NULL DEFAULT 'month',
  price DECIMAL(10,2) NOT NULL,
  persons INT NULL,
  label VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_listing FOREIGN KEY (listing_id) REFERENCES partner_listings(id) ON DELETE CASCADE,
  INDEX idx_plans_listing (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  partner_id INT NOT NULL,
  listing_id INT NOT NULL,
  plan_id INT NULL,
  plan_name VARCHAR(60) NOT NULL DEFAULT 'Monthly',
  persons INT NULL,
  session_label VARCHAR(60) NULL,
  booking_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('confirmed','completed','cancelled') NOT NULL DEFAULT 'confirmed',
  checked_in_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_listing FOREIGN KEY (listing_id) REFERENCES partner_listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_plan FOREIGN KEY (plan_id) REFERENCES listing_plans(id) ON DELETE SET NULL,
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_partner (partner_id),
  INDEX idx_bookings_listing (listing_id),
  INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Partner-created events (separate from listings): a single one-off/scheduled
-- happening with its own capacity (limited with a total slot count, or unlimited).
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  image VARCHAR(500) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacity_type ENUM('limited','unlimited') NOT NULL DEFAULT 'unlimited',
  total_slots INT NULL,
  booked_slots INT NOT NULL DEFAULT 0,
  location VARCHAR(255) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  event_time DATETIME NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  rejection_reason VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  INDEX idx_events_partner (partner_id),
  INDEX idx_events_status (status),
  INDEX idx_events_time (event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_code VARCHAR(20) NOT NULL UNIQUE,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  checked_in_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_event_user (event_id, user_id),
  INDEX idx_reg_event (event_id),
  INDEX idx_reg_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
