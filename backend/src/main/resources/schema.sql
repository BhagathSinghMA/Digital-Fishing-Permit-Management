-- Create sequences for token numbers
CREATE SEQUENCE IF NOT EXISTS permit_token_seq START 1;

-- Create fisherman table
CREATE TABLE IF NOT EXISTS fisherman (
    fisherman_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    district VARCHAR(50),
    port VARCHAR(100),
    village VARCHAR(100),
    address VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    state VARCHAR(50) DEFAULT 'Tamil Nadu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fisherman_id_name_phone UNIQUE (fisherman_id, name, phone_number)
);

-- Create boat_owner table
CREATE TABLE IF NOT EXISTS boat_owner (
    registration_number VARCHAR(50) PRIMARY KEY,
    boat_name VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    port VARCHAR(100),
    district VARCHAR(50),
    owner_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    fisherman_id VARCHAR(50) UNIQUE NOT NULL,
    FOREIGN KEY (fisherman_id) REFERENCES fisherman(fisherman_id),
    CONSTRAINT fk_boat_owner_fisherman_details 
        FOREIGN KEY (fisherman_id, owner_name, phone_number) 
        REFERENCES fisherman(fisherman_id, name, phone_number),
    CONSTRAINT uq_boat_owner_reg_owner UNIQUE (registration_number, owner_name)
);

-- Create permit_history table with crew_members as JSON TEXT
CREATE TABLE IF NOT EXISTS permit_history (
    permit_id SERIAL PRIMARY KEY,
    token_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'PERMIT-' || LPAD(nextval('permit_token_seq')::text, 6, '0'),
    permit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    registration_number VARCHAR(50) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    crew_members TEXT,  -- Store JSON array: [{"fishermanId":"FISH002","name":"Suresh Babu"},...]
    fisherman_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_number) REFERENCES boat_owner(registration_number),
    FOREIGN KEY (fisherman_id) REFERENCES fisherman(fisherman_id),
    CONSTRAINT fk_permit_owner_name 
        FOREIGN KEY (registration_number, owner_name) 
        REFERENCES boat_owner(registration_number, owner_name)
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    permit_application_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'Admin'
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(30) DEFAULT 'ROLE_SUPER_ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permit_date ON permit_history(permit_date);
CREATE INDEX IF NOT EXISTS idx_permit_registration ON permit_history(registration_number);
CREATE INDEX IF NOT EXISTS idx_permit_fisherman ON permit_history(fisherman_id);
CREATE INDEX IF NOT EXISTS idx_permit_token ON permit_history(token_number);
CREATE INDEX IF NOT EXISTS idx_boat_owner_fisherman ON boat_owner(fisherman_id);

