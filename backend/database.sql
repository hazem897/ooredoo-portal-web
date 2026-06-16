CREATE DATABASE ooredoo_portal;
\c ooredoo_portal
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,

  role VARCHAR(20) NOT NULL CHECK (
    role IN ('admin','zone_manager','manager','conseiller')
  ),

  zone VARCHAR(100),

  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (
    statut IN ('en_attente','approuve','refuse','suspendu')
  ),

  photo_url VARCHAR(255),
  otp_code VARCHAR(6),
  otp_expire TIMESTAMP,

  cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,

  type_ticket VARCHAR(20) NOT NULL CHECK (
    type_ticket IN ('activation','plainte','resiliation')
  ),

  client_nom VARCHAR(150),
  client_tel VARCHAR(20),
  client_zone VARCHAR(100),

  produit VARCHAR(10) NOT NULL CHECK (
    produit IN ('outdoor','indoor','pro')
  ),

  debit VARCHAR(50),

  sla_cible INT,
  sla_reel INT,

  statut VARCHAR(20) DEFAULT 'ouvert' CHECK (
    statut IN ('ouvert','en_cours','resolu','ferme')
  ),

  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_resolution TIMESTAMP,

  zone VARCHAR(100),

  cree_par INT,
  CONSTRAINT fk_creator
    FOREIGN KEY (cree_par)
    REFERENCES users(id)
);
CREATE INDEX idx_type ON tickets(type_ticket);
CREATE INDEX idx_zone ON tickets(zone);
CREATE INDEX idx_produit ON tickets(produit);
CREATE INDEX idx_statut ON tickets(statut);
CREATE INDEX idx_date ON tickets(date_creation);

CREATE TABLE reset_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  token VARCHAR(6) NOT NULL,
  expire_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (nom, prenom, email, mot_de_passe, role, statut)
VALUES (
  'Admin',
  'HAZEM',
  'hazemhazem9089@gmail.com',
  '$2a$10$V1bTvp1COKjlxOGz70P2De4fSYVlqkQU3JcmSum.RKByzYQlOodSS',
  'admin',
  'approuve'
);
